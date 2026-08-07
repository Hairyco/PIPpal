/**
 * Wallet-signed approval challenges for spend plans.
 * Uses Node crypto ed25519 verify with raw Solana keys (no extra deps).
 * LocalStorage preview auth must never authorize money movement.
 */

import { createHash, createPublicKey, randomBytes, verify as cryptoVerify } from 'crypto';
import { sbFetch } from './supabase.js';

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function decodeBase58(str) {
  const bytes = [];
  for (const c of str) {
    let carry = BASE58.indexOf(c);
    if (carry < 0) throw new Error('Invalid base58');
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const c of str) {
    if (c !== '1') break;
    bytes.push(0);
  }
  return Buffer.from(bytes.reverse());
}

/** SPKI DER prefix for raw 32-byte ed25519 public keys. */
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

export function buildApprovalMessage({ wallet, nonce, planId, purpose }) {
  return [
    'CTOgo Marketing Wallet Approval',
    `Purpose: ${purpose}`,
    `Wallet: ${wallet}`,
    `Plan: ${planId}`,
    `Nonce: ${nonce}`,
    'Signing authorizes automatic supplier payments (invoice + Polessia sliding fee on top).',
  ].join('\n');
}

export async function createChallenge(wallet, purpose, planId) {
  const nonce = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const rows = await sbFetch('mw_auth_challenges', {
    method: 'POST',
    body: JSON.stringify({
      wallet,
      nonce,
      purpose,
      expires_at: expiresAt,
    }),
  });
  const challenge = Array.isArray(rows) ? rows[0] : rows;
  const message = buildApprovalMessage({ wallet, nonce, planId, purpose });
  return { challenge, message };
}

export function verifyEd25519Signature(message, signatureBase58, walletBase58) {
  try {
    const msg = Buffer.from(message, 'utf8');
    const sig = decodeBase58(signatureBase58);
    const pubkey = decodeBase58(walletBase58);
    if (sig.length !== 64 || pubkey.length !== 32) return false;
    const keyObject = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, pubkey]),
      format: 'der',
      type: 'spki',
    });
    return cryptoVerify(null, msg, keyObject, sig);
  } catch {
    return false;
  }
}

export async function consumeChallenge(nonce, wallet) {
  const params = new URLSearchParams({
    select: '*',
    nonce: `eq.${nonce}`,
    wallet: `eq.${wallet}`,
    consumed_at: 'is.null',
    limit: '1',
  });
  const rows = await sbFetch(`mw_auth_challenges?${params}`);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) throw new Error('Challenge not found or already used');
  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw new Error('Challenge expired');
  }
  await sbFetch(`mw_auth_challenges?id=eq.${row.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ consumed_at: new Date().toISOString() }),
  });
  return row;
}

export function invoiceIdFromParts(mint, orderKey) {
  return createHash('sha256').update(`${mint}:${orderKey}`).digest('hex');
}
