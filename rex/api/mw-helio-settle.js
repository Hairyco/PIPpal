/**
 * Ops API: settle Helio deposit for a campaign order from ops wallet pool.
 * POST { orderId, opsSecret, dryRun? }
 *
 * Requires payment_instruction with chargeToken and/or depositAddress + depositAmount.
 * Dry-run only resolves deposit (no Solana SDK load). Live settle lazy-loads helioSettle.
 * Until contingency wallets are registered, uses KEEPER_SECRET_KEY as payer fallback.
 */

import { mwConfigured, sbFetch, audit } from '../lib/mw/supabase.js';
import { resolveHelioDeposit } from '../lib/mw/helio.js';

function json(res, status, body) {
  return res.status(status).json(body);
}

function assertOps(body, req) {
  const secret = String(process.env.MW_OPS_SECRET || '').trim();
  if (!secret) {
    const err = new Error('MW_OPS_SECRET not configured on server');
    err.statusCode = 503;
    throw err;
  }
  const header = req?.headers?.['x-mw-ops-secret'];
  const provided = String(
    body?.opsSecret || (Array.isArray(header) ? header[0] : header) || '',
  ).trim();
  if (!provided || provided !== secret) {
    const err = new Error('Unauthorized — ops secret does not match MW_OPS_SECRET');
    err.statusCode = 401;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return json(res, 405, { error: 'Method not allowed' });
    }
    if (!mwConfigured()) {
      return json(res, 503, { error: 'Supabase not configured' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    assertOps(body, req);

    const { orderId, dryRun = false } = body;
    if (!orderId) return json(res, 400, { error: 'orderId required' });

    const rows = await sbFetch(
      `mw_campaign_orders?id=eq.${orderId}&select=*,mw_projects(id,mint,ticker)`,
    );
    const order = Array.isArray(rows) ? rows[0] : null;
    if (!order) return json(res, 404, { error: 'Order not found' });

    const resolved = await resolveHelioDeposit(order.payment_instruction);
    if (!resolved.ok) {
      return json(res, 400, { ok: false, error: resolved.reason, stage: 'resolve' });
    }

    if (dryRun) {
      const { raw: _raw, ...deposit } = resolved;
      return json(res, 200, {
        ok: true,
        dryRun: true,
        deposit,
        hint: 'Pass dryRun:false to broadcast USDC/SOL transfer from ops/keeper wallet',
      });
    }

    // Lazy-load Solana settle path — top-level @solana/web3.js breaks this serverless function (ERR_REQUIRE_ESM).
    const { settleHelioDeposit } = await import('../lib/mw/helioSettle.js');

    await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'paying',
        updated_at: new Date().toISOString(),
      }),
    });

    const result = await settleHelioDeposit({ order });
    if (!result.ok) {
      await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'retrying',
          last_error: result.reason,
          updated_at: new Date().toISOString(),
        }),
      });
      await audit('helio_settle_failed', { orderId, reason: result.reason, stage: result.stage });
      return json(res, 502, { ok: false, error: result.reason, stage: result.stage, detail: result });
    }

    const instruction = {
      ...(order.payment_instruction || {}),
      depositAddress: result.depositAddress,
      lastPaySignature: result.signature,
      lastPaidAt: new Date().toISOString(),
      lastPayer: result.payer,
    };

    await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'paid_unconfirmed',
        payment_instruction: instruction,
        ops_wallet_id: result.opsWalletId,
        last_error: null,
        updated_at: new Date().toISOString(),
      }),
    });

    return json(res, 200, {
      ok: true,
      signature: result.signature,
      depositAddress: result.depositAddress,
      amount: result.amount,
      asset: result.asset,
      payer: result.payer,
      payerSource: result.payerSource,
      status: 'paid_unconfirmed',
      note: 'Helio deposit sent — confirm Dex order live via orders API / marketplace',
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return json(res, status, { error: err.message || String(err) });
  }
}
