/**
 * Ops API: attach Helio / Dex payment_instruction (+ optional deposit fields) to an order.
 * POST {
 *   orderId,
 *   chargeUrl?,           // Helio charge deeplink from Dex QR
 *   depositAddress?,      // Solana address shown on QR / transfer UI
 *   depositAmount?,       // e.g. 299 for USDC
 *   amountUsd?,
 *   asset?,               // USDC | SOL
 *   mint?,
 *   opsSecret
 * }
 */

import { mwConfigured, sbFetch, audit } from '../lib/mw/supabase.js';
import {
  parseHelioChargeUrl,
  helioPaymentInstruction,
  withHelioDeposit,
} from '../lib/mw/helio.js';

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

    const {
      orderId,
      chargeUrl,
      depositAddress,
      depositAmount,
      amountUsd,
      asset = 'USDC',
      mint,
    } = body;
    if (!orderId) {
      return json(res, 400, { error: 'orderId required' });
    }
    if (!chargeUrl && !depositAddress) {
      return json(res, 400, { error: 'chargeUrl and/or depositAddress required' });
    }

    const existingRows = await sbFetch(
      `mw_campaign_orders?id=eq.${orderId}&select=id,payment_instruction`,
    );
    const existing = Array.isArray(existingRows) ? existingRows[0] : null;
    if (!existing) {
      return json(res, 404, { error: 'Order not found' });
    }

    let instruction = existing.payment_instruction || {};

    if (chargeUrl) {
      const parsed = parseHelioChargeUrl(chargeUrl);
      if (!parsed.ok) {
        return json(res, 400, { error: parsed.reason });
      }
      instruction = {
        ...helioPaymentInstruction({
          chargeToken: parsed.chargeToken,
          deeplink: parsed.deeplink,
          network: parsed.network,
          amountUsd: amountUsd != null ? Number(amountUsd) : instruction.amountUsd,
          asset,
          depositAddress,
          depositAmount:
            depositAmount != null
              ? Number(depositAmount)
              : amountUsd != null
                ? Number(amountUsd)
                : null,
          mint,
        }),
        ...instruction,
        chargeToken: parsed.chargeToken,
        deeplink: parsed.deeplink,
        network: parsed.network || instruction.network,
      };
    }

    if (depositAddress || depositAmount != null || amountUsd != null) {
      instruction = withHelioDeposit(instruction, {
        depositAddress: depositAddress || instruction.depositAddress,
        depositAmount:
          depositAmount != null
            ? Number(depositAmount)
            : amountUsd != null
              ? Number(amountUsd)
              : instruction.depositAmount,
        asset,
        mint,
      });
    }

    await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        payment_instruction: instruction,
        status: instruction.depositAddress ? 'queued' : 'awaiting_payment_instruction',
        last_error: null,
        updated_at: new Date().toISOString(),
      }),
    });

    await audit('payment_instruction_captured', {
      orderId,
      chargeToken: instruction.chargeToken || null,
      hasDeposit: Boolean(instruction.depositAddress),
    });

    return json(res, 200, { ok: true, paymentInstruction: instruction });
  } catch (err) {
    const status = err.statusCode || 500;
    return json(res, status, { error: err.message || String(err) });
  }
}
