/**
 * Ops API: attach Helio / Dex payment_instruction to a campaign order.
 * POST { orderId, chargeUrl, amountUsd?, asset?, opsSecret }
 */

import { mwConfigured, sbFetch, audit } from '../lib/mw/supabase.js';
import { parseHelioChargeUrl, helioPaymentInstruction } from '../lib/mw/helio.js';

function json(res, status, body) {
  return res.status(status).json(body);
}

function assertOps(body) {
  const secret = process.env.MW_OPS_SECRET;
  if (!secret) return;
  if (body.opsSecret !== secret) {
    const err = new Error('Unauthorized');
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
    assertOps(body);

    const { orderId, chargeUrl, amountUsd, asset = 'USDC' } = body;
    if (!orderId || !chargeUrl) {
      return json(res, 400, { error: 'orderId and chargeUrl required' });
    }

    const parsed = parseHelioChargeUrl(chargeUrl);
    if (!parsed.ok) {
      return json(res, 400, { error: parsed.reason });
    }

    const instruction = helioPaymentInstruction({
      chargeToken: parsed.chargeToken,
      deeplink: parsed.deeplink,
      network: parsed.network,
      amountUsd: amountUsd != null ? Number(amountUsd) : null,
      asset,
    });

    await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        payment_instruction: instruction,
        status: 'queued',
        last_error: null,
        updated_at: new Date().toISOString(),
      }),
    });

    await audit('payment_instruction_captured', { orderId, chargeToken: parsed.chargeToken });

    return json(res, 200, { ok: true, paymentInstruction: instruction });
  } catch (err) {
    const status = err.statusCode || 500;
    return json(res, status, { error: err.message || String(err) });
  }
}
