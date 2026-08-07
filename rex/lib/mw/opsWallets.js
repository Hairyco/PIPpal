/**
 * Contingency ops payer wallet pool (Helio / Dex).
 * Pick active wallet by priority; mark blocked; alert when active < MIN_ACTIVE.
 * Private keys never stored in DB — only secret_env_key → process.env.
 */

import { audit, sbFetch } from './supabase.js';

export const MIN_ACTIVE_OPS_WALLETS = 3;

export const BLOCK_REASONS = /** @type {const} */ ([
  'wallet_flag',
  'dex_session',
  'ip_session',
  'helio_reject',
  'unknown',
]);

/**
 * Classify settle/checkout failure into a block reason (best-effort).
 * @param {string} message
 */
export function classifyBlockReason(message) {
  const m = String(message || '').toLowerCase();
  if (/ip|proxy|cloudflare|datacenter|vpn|rate.?limit.*geo/.test(m)) return 'ip_session';
  if (/google|oauth|sign.?in|session|cookie|captcha/.test(m)) return 'dex_session';
  if (/helio|charge|deposit|moonpay/.test(m) && /reject|denied|block|fraud|risk/.test(m)) {
    return 'helio_reject';
  }
  if (/wallet|pubkey|address|blacklist|sanction/.test(m) && /block|flag|ban|deny/.test(m)) {
    return 'wallet_flag';
  }
  return 'unknown';
}

/**
 * @returns {Promise<object[]>}
 */
export async function listOpsWallets() {
  return (
    (await sbFetch(
      'mw_ops_wallets?select=*&order=priority.asc,created_at.asc',
    )) || []
  );
}

/**
 * Next wallet to pay Helio from (active, lowest priority number).
 * Reactivates cooling wallets whose cooling_until has passed.
 */
export async function pickActiveOpsWallet() {
  const now = new Date().toISOString();
  const cooling = await sbFetch(
    `mw_ops_wallets?status=eq.cooling&cooling_until=lte.${encodeURIComponent(now)}&select=id`,
  );
  for (const w of cooling || []) {
    await sbFetch(`mw_ops_wallets?id=eq.${w.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'active',
        block_reason: null,
        cooling_until: null,
        updated_at: now,
      }),
    });
  }

  const rows = await sbFetch(
    'mw_ops_wallets?status=eq.active&role=eq.helio_payer&select=*&order=priority.asc&limit=1',
  );
  const wallet = Array.isArray(rows) ? rows[0] : null;
  if (!wallet) {
    await audit('ops_wallet_pool_empty', { at: now });
    return { ok: false, reason: 'No active ops payer wallets — register at least 3' };
  }
  return { ok: true, wallet };
}

/**
 * @param {string} walletId
 * @param {{ reason?: string, error?: string, permanent?: boolean, coolingMinutes?: number }} opts
 */
export async function markOpsWalletBlocked(walletId, opts = {}) {
  const reason = opts.reason || 'unknown';
  const now = new Date();
  const permanent = opts.permanent !== false && reason !== 'unknown';
  const coolingMinutes = opts.coolingMinutes ?? 60;
  const patch = {
    last_attempt_at: now.toISOString(),
    last_error: opts.error || null,
    updated_at: now.toISOString(),
  };
  if (permanent) {
    patch.status = 'blocked';
    patch.block_reason = reason;
    patch.blocked_at = now.toISOString();
  } else {
    patch.status = 'cooling';
    patch.block_reason = reason;
    patch.cooling_until = new Date(now.getTime() + coolingMinutes * 60_000).toISOString();
  }

  await sbFetch(`mw_ops_wallets?id=eq.${walletId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  await audit('ops_wallet_blocked', { walletId, reason, permanent, error: opts.error });
  await ensureOpsWalletPoolHealthy();
}

/**
 * @param {string} walletId
 */
export async function markOpsWalletSuccess(walletId) {
  const now = new Date().toISOString();
  await sbFetch(`mw_ops_wallets?id=eq.${walletId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      last_success_at: now,
      last_attempt_at: now,
      last_error: null,
      updated_at: now,
    }),
  });
}

/**
 * Alert when active helio payers drop below MIN_ACTIVE_OPS_WALLETS.
 */
export async function ensureOpsWalletPoolHealthy() {
  const active = await sbFetch(
    'mw_ops_wallets?status=eq.active&role=eq.helio_payer&select=id',
  );
  const count = Array.isArray(active) ? active.length : 0;
  if (count < MIN_ACTIVE_OPS_WALLETS) {
    await audit('ops_wallet_pool_low', {
      active: count,
      min: MIN_ACTIVE_OPS_WALLETS,
      need: MIN_ACTIVE_OPS_WALLETS - count,
    });
    return { ok: false, active: count, min: MIN_ACTIVE_OPS_WALLETS };
  }
  return { ok: true, active: count, min: MIN_ACTIVE_OPS_WALLETS };
}

/**
 * Load secret key bytes for a wallet row (JSON array in env).
 * @param {object} wallet
 */
export function loadOpsWalletSecret(wallet) {
  const envKey = wallet?.secret_env_key;
  if (!envKey) return { ok: false, reason: 'secret_env_key missing' };
  const raw = process.env[envKey];
  if (!raw) {
    return { ok: false, reason: `Env ${envKey} not set for wallet ${wallet.public_key}` };
  }
  try {
    const parsed = JSON.parse(raw);
    return { ok: true, secretKey: Uint8Array.from(parsed), envKey };
  } catch {
    return { ok: false, reason: `${envKey} must be a JSON byte array` };
  }
}

/**
 * After a wallet is blocked mid-settle: pick next active wallet for failover funding.
 * Actual SOL/USDC transfer is caller responsibility (keeper / settle job).
 */
export async function failoverOpsWallet(fromWalletId, errorMessage) {
  const reason = classifyBlockReason(errorMessage);
  await markOpsWalletBlocked(fromWalletId, {
    reason,
    error: errorMessage,
    permanent: reason !== 'unknown',
  });
  const next = await pickActiveOpsWallet();
  if (!next.ok) {
    return {
      ok: false,
      reason: next.reason,
      blockedReason: reason,
      pool: await ensureOpsWalletPoolHealthy(),
    };
  }
  return {
    ok: true,
    blockedReason: reason,
    nextWallet: next.wallet,
    pool: await ensureOpsWalletPoolHealthy(),
  };
}
