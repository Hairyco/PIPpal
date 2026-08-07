/**
 * On-chain disburse_marketing client (Devnet/Mainnet).
 * Assembles PDAs and sends via @solana/web3.js (no IDL required).
 *
 * Env:
 *   KEEPER_SECRET_KEY — JSON byte array (must match RexConfig.keeper or authority)
 *   SOLANA_RPC_URL
 *   REX_MVP_PROGRAM_ID
 *   PROTOCOL_TREASURY — optional override; otherwise read from on-chain config
 *   MW_DISBURSE_DRY_RUN=1 — encode + derive only, do not broadcast
 */

import { createHash } from 'node:crypto';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { serviceFeeBpsForInvoiceUsd } from './fees.js';

function anchorDiscriminator(ixName) {
  return createHash('sha256').update(`global:${ixName}`).digest().subarray(0, 8);
}

/**
 * Encode disburse_marketing args: invoice_id [u8;32] + invoice_lamports u64 LE + service_fee_bps u64 LE.
 * @param {Uint8Array | Buffer} invoiceId32
 * @param {bigint | number} invoiceLamports
 * @param {number} serviceFeeBps
 */
export function encodeDisburseData(invoiceId32, invoiceLamports, serviceFeeBps = 500) {
  const id = Buffer.from(invoiceId32);
  if (id.length !== 32) throw new Error('invoice_id must be 32 bytes');
  const data = Buffer.alloc(8 + 32 + 8 + 8);
  anchorDiscriminator('disburse_marketing').copy(data, 0);
  id.copy(data, 8);
  data.writeBigUInt64LE(BigInt(invoiceLamports), 40);
  data.writeBigUInt64LE(BigInt(serviceFeeBps), 48);
  return data;
}

/**
 * MW stores invoice_id as sha256 hex (64 chars). On-chain wants the 32 raw bytes.
 * @param {string} invoiceIdHex
 */
export function invoiceIdBytesFromHex(invoiceIdHex) {
  const hex = String(invoiceIdHex || '').trim();
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(`invoice_id must be 64-char hex, got length ${hex.length}`);
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Derive DisburseMarketing PDAs.
 * @param {PublicKey} programId
 * @param {PublicKey} mint
 * @param {PublicKey} supplier
 * @param {Buffer} invoiceId32
 */
export function deriveDisburseAccounts(programId, mint, supplier, invoiceId32) {
  const [config] = PublicKey.findProgramAddressSync([Buffer.from('config')], programId);
  const [projectPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('project'), mint.toBuffer()],
    programId,
  );
  const [whitelistEntry] = PublicKey.findProgramAddressSync(
    [Buffer.from('whitelist'), supplier.toBuffer()],
    programId,
  );
  const [marketingVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('marketing_vault'), projectPda.toBuffer()],
    programId,
  );
  const [receipt] = PublicKey.findProgramAddressSync(
    [Buffer.from('disburse'), projectPda.toBuffer(), invoiceId32],
    programId,
  );
  return { config, projectPda, whitelistEntry, marketingVault, receipt };
}

/**
 * RexConfig layout after 8-byte discriminator: authority(32) protocol_treasury(32) keeper(32) ...
 * @param {Connection} connection
 * @param {PublicKey} configPda
 */
export async function readProtocolTreasury(connection, configPda) {
  if (process.env.PROTOCOL_TREASURY) {
    return new PublicKey(process.env.PROTOCOL_TREASURY);
  }
  const info = await connection.getAccountInfo(configPda);
  if (!info?.data || info.data.length < 8 + 32 + 32) {
    throw new Error('Config account missing or too short — set PROTOCOL_TREASURY env or initialize program');
  }
  return new PublicKey(info.data.subarray(8 + 32, 8 + 32 + 32));
}

function loadKeeperKeypair() {
  const secret = process.env.KEEPER_SECRET_KEY;
  if (!secret) return null;
  try {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
  } catch {
    throw new Error('KEEPER_SECRET_KEY must be a JSON byte array');
  }
}

/**
 * @param {{ order: object, project: object, provider: object }} args
 */
export async function submitDisburse({ order, project, provider }) {
  const programIdStr = process.env.REX_MVP_PROGRAM_ID;
  const rpc = process.env.SOLANA_RPC_URL;

  if (!process.env.KEEPER_SECRET_KEY || !rpc) {
    return {
      ok: false,
      dryRun: true,
      error:
        'Keeper wallet / RPC not configured — payment left for manual_review (free to configure locally; RPC is paid for production).',
    };
  }

  if (!programIdStr) {
    return { ok: false, dryRun: false, error: 'REX_MVP_PROGRAM_ID unset' };
  }

  if (!provider?.wallet_address || provider.wallet_address === 'PENDING_WHITELIST') {
    return { ok: false, dryRun: false, error: 'Provider wallet PENDING_WHITELIST or missing' };
  }

  if (!project?.mint) {
    return { ok: false, dryRun: false, error: 'Project mint missing — cannot derive project PDA' };
  }

  let keeper;
  try {
    keeper = loadKeeperKeypair();
  } catch (err) {
    return { ok: false, dryRun: false, error: err.message || String(err) };
  }

  let invoiceId32;
  try {
    invoiceId32 = invoiceIdBytesFromHex(order.invoice_id);
  } catch (err) {
    return { ok: false, dryRun: false, error: err.message || String(err) };
  }

  const programId = new PublicKey(programIdStr);
  const mint = new PublicKey(project.mint);
  const supplier = new PublicKey(provider.wallet_address);
  const accounts = deriveDisburseAccounts(programId, mint, supplier, invoiceId32);
  const feeBps =
    Number(order.creatives?.feeBps) ||
    (order.creatives?.priceUsd
      ? serviceFeeBpsForInvoiceUsd(Number(order.creatives.priceUsd))
      : 500);
  const data = encodeDisburseData(invoiceId32, order.invoice_lamports, feeBps);

  if (process.env.MW_DISBURSE_DRY_RUN === '1') {
    return {
      ok: true,
      dryRun: true,
      signature: `dry-run-${order.id}-${Date.now()}`,
      actor: keeper.publicKey.toBase58(),
      note: `Derived PDAs for disburse_marketing; set MW_DISBURSE_DRY_RUN=0 to broadcast`,
      accounts: {
        config: accounts.config.toBase58(),
        project: accounts.projectPda.toBase58(),
        whitelist: accounts.whitelistEntry.toBase58(),
        marketingVault: accounts.marketingVault.toBase58(),
        receipt: accounts.receipt.toBase58(),
        supplier: supplier.toBase58(),
      },
    };
  }

  try {
    const connection = new Connection(rpc, 'confirmed');
    const protocolTreasury = await readProtocolTreasury(connection, accounts.config);

    // Fail fast if PDAs missing (project not initialized / supplier not whitelisted)
    const needed = [
      ['config', accounts.config],
      ['project', accounts.projectPda],
      ['whitelist', accounts.whitelistEntry],
      ['marketing_vault', accounts.marketingVault],
    ];
    for (const [label, key] of needed) {
      const info = await connection.getAccountInfo(key);
      if (!info) {
        return {
          ok: false,
          dryRun: false,
          error: `On-chain account missing: ${label} (${key.toBase58()}) — initialize project / whitelist supplier on this cluster first`,
        };
      }
    }

    const receiptInfo = await connection.getAccountInfo(accounts.receipt);
    if (receiptInfo) {
      return {
        ok: false,
        dryRun: false,
        error: `Receipt PDA already exists for invoice ${order.invoice_id} — treated as already disbursed (idempotent)`,
      };
    }

    const ix = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: keeper.publicKey, isSigner: true, isWritable: true },
        { pubkey: accounts.config, isSigner: false, isWritable: false },
        { pubkey: accounts.projectPda, isSigner: false, isWritable: true },
        { pubkey: accounts.whitelistEntry, isSigner: false, isWritable: false },
        { pubkey: accounts.marketingVault, isSigner: false, isWritable: true },
        { pubkey: supplier, isSigner: false, isWritable: true },
        { pubkey: protocolTreasury, isSigner: false, isWritable: true },
        { pubkey: accounts.receipt, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const signature = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix),
      [keeper],
      { commitment: 'confirmed' },
    );

    return {
      ok: true,
      dryRun: false,
      signature,
      actor: keeper.publicKey.toBase58(),
      protocolTreasury: protocolTreasury.toBase58(),
      supplier: supplier.toBase58(),
      marketingVault: accounts.marketingVault.toBase58(),
    };
  } catch (err) {
    return { ok: false, dryRun: false, error: err.message || String(err) };
  }
}
