/**
 * Pay a resolved Helio deposit from the ops wallet pool (or keeper fallback).
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  failoverOpsWallet,
  loadOpsWalletSecret,
  markOpsWalletSuccess,
  pickActiveOpsWallet,
} from './opsWallets.js';
import { resolveHelioDeposit, USDC_MINT_MAINNET } from './helio.js';
import { audit } from './supabase.js';

const USDC_DECIMALS = 6;

function rpcUrl() {
  return process.env.SOLANA_RPC_URL || '';
}

/**
 * Prefer ops pool; until 3 wallets registered, allow KEEPER_SECRET_KEY as sole payer.
 */
async function resolvePayerKeypair() {
  const picked = await pickActiveOpsWallet();
  if (picked.ok) {
    const secret = loadOpsWalletSecret(picked.wallet);
    if (!secret.ok) {
      return { ok: false, reason: secret.reason, walletRow: picked.wallet };
    }
    return {
      ok: true,
      keypair: Keypair.fromSecretKey(secret.secretKey),
      walletRow: picked.wallet,
      source: 'ops_pool',
    };
  }

  const raw = process.env.KEEPER_SECRET_KEY;
  if (!raw) {
    return {
      ok: false,
      reason:
        picked.reason ||
        'No ops payer wallets and no KEEPER_SECRET_KEY fallback — register pool or set keeper',
    };
  }
  try {
    const secretKey = Uint8Array.from(JSON.parse(raw));
    return {
      ok: true,
      keypair: Keypair.fromSecretKey(secretKey),
      walletRow: null,
      source: 'keeper_fallback',
    };
  } catch {
    return { ok: false, reason: 'KEEPER_SECRET_KEY must be JSON byte array' };
  }
}

/**
 * @param {{ depositAddress: string, depositAmount: number, asset?: string, mint?: string }} deposit
 * @param {Keypair} payer
 */
async function sendDepositPayment(deposit, payer) {
  const rpc = rpcUrl();
  if (!rpc) return { ok: false, reason: 'SOLANA_RPC_URL unset' };

  const connection = new Connection(rpc, 'confirmed');
  const to = new PublicKey(deposit.depositAddress);
  const asset = (deposit.asset || 'USDC').toUpperCase();

  if (asset === 'SOL') {
    const lamports = Math.round(Number(deposit.depositAmount) * LAMPORTS_PER_SOL);
    if (lamports <= 0) return { ok: false, reason: 'Invalid SOL depositAmount' };
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: to,
        lamports,
      }),
    );
    const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
    return { ok: true, signature, asset: 'SOL', amount: deposit.depositAmount };
  }

  // USDC (or other SPL) — dynamic import so build still works if spl-token missing briefly
  let spl;
  try {
    spl = await import('@solana/spl-token');
  } catch {
    return {
      ok: false,
      reason: 'Install @solana/spl-token to send USDC Helio deposits',
    };
  }

  const mint = new PublicKey(deposit.mint || USDC_MINT_MAINNET);
  const amountRaw = BigInt(
    Math.round(Number(deposit.depositAmount) * 10 ** USDC_DECIMALS),
  );
  if (amountRaw <= 0n) return { ok: false, reason: 'Invalid USDC depositAmount' };

  const fromAta = await spl.getAssociatedTokenAddress(mint, payer.publicKey);
  const toAta = await spl.getAssociatedTokenAddress(mint, to);

  const tx = new Transaction();
  const toInfo = await connection.getAccountInfo(toAta);
  if (!toInfo) {
    tx.add(
      spl.createAssociatedTokenAccountInstruction(
        payer.publicKey,
        toAta,
        to,
        mint,
      ),
    );
  }
  tx.add(
    spl.createTransferInstruction(fromAta, toAta, payer.publicKey, amountRaw),
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
  return {
    ok: true,
    signature,
    asset: 'USDC',
    amount: deposit.depositAmount,
    mint: mint.toBase58(),
  };
}

/**
 * Resolve Helio deposit on order instruction and pay from ops/keeper wallet.
 * On payer block signal, failover to next ops wallet once and retry.
 *
 * @param {{ order: object, instruction?: object }} args
 */
export async function settleHelioDeposit({ order, instruction }) {
  const instr = instruction || order?.payment_instruction;
  const resolved = await resolveHelioDeposit(instr);
  if (!resolved.ok) {
    return { ok: false, reason: resolved.reason, stage: 'resolve' };
  }

  let payer = await resolvePayerKeypair();
  if (!payer.ok) {
    return { ok: false, reason: payer.reason, stage: 'payer' };
  }

  const attemptPay = async (p) => {
    try {
      const sent = await sendDepositPayment(resolved, p.keypair);
      if (!sent.ok) return sent;
      if (p.walletRow?.id) {
        await markOpsWalletSuccess(p.walletRow.id);
      }
      await audit(
        'helio_deposit_paid',
        {
          orderId: order?.id,
          signature: sent.signature,
          depositAddress: resolved.depositAddress,
          amount: resolved.depositAmount,
          asset: sent.asset,
          payer: p.keypair.publicKey.toBase58(),
          payerSource: p.source,
        },
        order?.project_id,
      );
      return {
        ok: true,
        ...sent,
        depositAddress: resolved.depositAddress,
        payer: p.keypair.publicKey.toBase58(),
        payerSource: p.source,
        opsWalletId: p.walletRow?.id || null,
      };
    } catch (err) {
      return { ok: false, reason: err.message || String(err), error: err };
    }
  };

  let result = await attemptPay(payer);
  if (result.ok) return result;

  // Failover once if we have a pool wallet
  if (payer.walletRow?.id) {
    const fromId = payer.walletRow.id;
    const fail = await failoverOpsWallet(fromId, result.reason);
    if (fail.ok) {
      const secret = loadOpsWalletSecret(fail.nextWallet);
      if (secret.ok) {
        const nextPayer = {
          ok: true,
          keypair: Keypair.fromSecretKey(secret.secretKey),
          walletRow: fail.nextWallet,
          source: 'ops_pool_failover',
        };
        result = await attemptPay(nextPayer);
        if (result.ok) {
          return {
            ...result,
            failedOverFrom: fromId,
            blockedReason: fail.blockedReason,
          };
        }
      }
    } else {
      return {
        ok: false,
        reason: result.reason,
        failover: fail,
        stage: 'pay',
      };
    }
  }

  return { ok: false, reason: result.reason, stage: 'pay' };
}
