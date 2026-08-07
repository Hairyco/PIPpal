/**
 * On-chain disburse_marketing client (Devnet/Mainnet).
 * Fail-closed until KEEPER_SECRET_KEY + RPC + program + treasury are configured.
 *
 * Full Anchor account resolution (project PDA, config, whitelist) requires on-chain
 * project state. When MW_DISBURSE_DRY_RUN=1, returns structured dry-run success for
 * keeper path testing without broadcasting.
 */

import { createHash } from 'node:crypto';

function anchorDiscriminator(ixName) {
  return createHash('sha256').update(`global:${ixName}`).digest().subarray(0, 8);
}

/**
 * Encode disburse_marketing args: invoice_id [u8;32] + invoice_lamports u64 LE.
 * @param {Uint8Array | Buffer} invoiceId32
 * @param {bigint | number} invoiceLamports
 */
export function encodeDisburseData(invoiceId32, invoiceLamports) {
  const id = Buffer.from(invoiceId32);
  if (id.length !== 32) throw new Error('invoice_id must be 32 bytes');
  const data = Buffer.alloc(8 + 32 + 8);
  anchorDiscriminator('disburse_marketing').copy(data, 0);
  id.copy(data, 8);
  data.writeBigUInt64LE(BigInt(invoiceLamports), 40);
  return data;
}

/**
 * @param {{ order: object, project: object, provider: object }} args
 */
export async function submitDisburse({ order, project, provider }) {
  const programId = process.env.REX_MVP_PROGRAM_ID;
  const rpc = process.env.SOLANA_RPC_URL;
  const secret = process.env.KEEPER_SECRET_KEY;

  if (!secret || !rpc) {
    return {
      ok: false,
      dryRun: true,
      error:
        'Keeper wallet / RPC not configured — payment left for manual_review (free to configure locally; RPC is paid for production).',
    };
  }

  if (!programId) {
    return {
      ok: false,
      dryRun: false,
      error: 'REX_MVP_PROGRAM_ID unset',
    };
  }

  if (provider.wallet_address === 'PENDING_WHITELIST') {
    return { ok: false, dryRun: false, error: 'Provider wallet PENDING_WHITELIST' };
  }

  // Structured dry-run for keeper integration tests (no broadcast).
  if (process.env.MW_DISBURSE_DRY_RUN === '1') {
    const invoiceHash = createHash('sha256').update(String(order.invoice_id)).digest();
    const data = encodeDisburseData(invoiceHash, order.invoice_lamports);
    return {
      ok: true,
      dryRun: true,
      signature: `dry-run-${order.id}-${Date.now()}`,
      actor: 'dry-run-keeper',
      note: `Encoded disburse_marketing (${data.length} bytes) for vault ${project.marketing_vault} → ${provider.wallet_address}; program ${programId}. Set MW_DISBURSE_DRY_RUN=0 and wire PDA accounts to broadcast.`,
    };
  }

  // Live broadcast requires @solana/web3.js + derived PDAs (config, project, whitelist, receipt).
  // Until IDL-backed client ships, fail closed with actionable error (never fake Mainnet success).
  try {
    const mod = await import('@solana/web3.js');
    const { Connection, Keypair, PublicKey } = mod;

    let secretBytes;
    try {
      const parsed = JSON.parse(secret);
      secretBytes = Uint8Array.from(parsed);
    } catch {
      // base58 not always available — require JSON byte array export for now
      return {
        ok: false,
        dryRun: false,
        error:
          'KEEPER_SECRET_KEY must be a JSON byte array (Phantom export / solana-keygen) for live disburse.',
      };
    }

    const keeper = Keypair.fromSecretKey(secretBytes);
    const connection = new Connection(rpc, 'confirmed');
    const bal = await connection.getBalance(keeper.publicKey);

    return {
      ok: false,
      dryRun: false,
      error: `On-chain disburse client bound to RPC (keeper ${keeper.publicKey.toBase58()}, balance ${bal} lamports, program ${programId}, supplier ${provider.wallet_address}, vault ${project.marketing_vault || 'missing'}) but PDA account metas not yet assembled — add Anchor/IDL client next. Invoice ${order.invoice_id}.`,
    };
  } catch (err) {
    if (String(err.message || err).includes("Cannot find package '@solana/web3.js'")) {
      return {
        ok: false,
        dryRun: false,
        error:
          'Install @solana/web3.js in rex to enable live disburse. Encoded ix helper is ready (encodeDisburseData).',
      };
    }
    return { ok: false, dryRun: false, error: err.message || String(err) };
  }
}
