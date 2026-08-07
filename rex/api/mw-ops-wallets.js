/**
 * Ops API for contingency payer wallet pool.
 * GET  — list wallets + pool health (opsSecret)
 * POST action=register — { label, publicKey, secretEnvKey, priority?, opsSecret }
 * POST action=block — { id, reason?, error?, opsSecret }
 * POST action=activate — { id, opsSecret }  (unblock / unretire → active)
 */

import { mwConfigured, sbFetch, audit } from '../lib/mw/supabase.js';
import {
  BLOCK_REASONS,
  MIN_ACTIVE_OPS_WALLETS,
  ensureOpsWalletPoolHealthy,
  listOpsWallets,
  markOpsWalletBlocked,
} from '../lib/mw/opsWallets.js';

function json(res, status, body) {
  return res.status(status).json(body);
}

function assertOps(body, req) {
  const secret = process.env.MW_OPS_SECRET;
  if (!secret) return;
  const fromBody = body?.opsSecret;
  const fromHeader = req.headers['x-mw-ops-secret'];
  if (fromBody !== secret && fromHeader !== secret) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    if (!mwConfigured()) {
      return json(res, 503, { error: 'Supabase not configured' });
    }

    const body =
      req.method === 'GET'
        ? { opsSecret: req.headers['x-mw-ops-secret'] || req.query?.opsSecret }
        : typeof req.body === 'string'
          ? JSON.parse(req.body || '{}')
          : req.body || {};

    assertOps(body, req);

    if (req.method === 'GET') {
      const wallets = await listOpsWallets();
      const health = await ensureOpsWalletPoolHealthy();
      return json(res, 200, {
        ok: true,
        minActive: MIN_ACTIVE_OPS_WALLETS,
        health,
        wallets: (wallets || []).map((w) => ({
          id: w.id,
          label: w.label,
          publicKey: w.public_key,
          secretEnvKey: w.secret_env_key,
          role: w.role,
          priority: w.priority,
          status: w.status,
          blockReason: w.block_reason,
          blockedAt: w.blocked_at,
          coolingUntil: w.cooling_until,
          lastSuccessAt: w.last_success_at,
          lastAttemptAt: w.last_attempt_at,
          lastError: w.last_error,
          notes: w.notes,
        })),
        hint:
          health.ok
            ? null
            : `Create ${health.need} more active payer wallet(s). Put secrets in Vercel env; register public keys here.`,
      });
    }

    if (req.method !== 'POST') {
      return json(res, 405, { error: 'Method not allowed' });
    }

    const { action } = body;

    if (action === 'register') {
      const {
        label,
        publicKey,
        secretEnvKey,
        priority = 100,
        notes = null,
      } = body;
      if (!label || !publicKey || !secretEnvKey) {
        return json(res, 400, { error: 'label, publicKey, secretEnvKey required' });
      }
      if (!process.env[secretEnvKey]) {
        return json(res, 400, {
          error: `Env ${secretEnvKey} is not set on the server — add the JSON secret key in Vercel first`,
        });
      }
      const created = await sbFetch('mw_ops_wallets', {
        method: 'POST',
        body: JSON.stringify({
          label,
          public_key: publicKey,
          secret_env_key: secretEnvKey,
          priority: Number(priority) || 100,
          status: 'active',
          role: 'helio_payer',
          notes,
        }),
      });
      await audit('ops_wallet_registered', { publicKey, secretEnvKey, priority });
      const health = await ensureOpsWalletPoolHealthy();
      return json(res, 200, {
        ok: true,
        wallet: Array.isArray(created) ? created[0] : created,
        health,
      });
    }

    if (action === 'block') {
      const { id, reason = 'unknown', error = null, permanent = true } = body;
      if (!id) return json(res, 400, { error: 'id required' });
      if (reason && !BLOCK_REASONS.includes(reason)) {
        return json(res, 400, { error: `reason must be one of ${BLOCK_REASONS.join(', ')}` });
      }
      await markOpsWalletBlocked(id, { reason, error, permanent });
      return json(res, 200, { ok: true, health: await ensureOpsWalletPoolHealthy() });
    }

    if (action === 'activate') {
      const { id } = body;
      if (!id) return json(res, 400, { error: 'id required' });
      await sbFetch(`mw_ops_wallets?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'active',
          block_reason: null,
          blocked_at: null,
          cooling_until: null,
          last_error: null,
          updated_at: new Date().toISOString(),
        }),
      });
      await audit('ops_wallet_activated', { id });
      return json(res, 200, { ok: true, health: await ensureOpsWalletPoolHealthy() });
    }

    return json(res, 400, { error: 'Unknown action — use register | block | activate' });
  } catch (err) {
    const status = err.statusCode || 500;
    return json(res, status, { error: err.message || String(err) });
  }
}
