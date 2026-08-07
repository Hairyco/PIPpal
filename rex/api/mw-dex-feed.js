/**
 * Ops API: DexScreener form feed sheet + Helio QR capture.
 *
 * GET  ?opsSecret=…&orderId=…     → fill sheet for one order
 * GET  ?opsSecret=…&pending=1     → list queued dexscreener orders needing feed/capture
 * POST action=mark_fed            → { orderId, opsSecret } note that Dex form was submitted
 * POST action=capture             → { orderId, chargeUrl, depositAddress, depositAmount, opsSecret }
 */

import { mwConfigured, sbFetch, audit } from '../lib/mw/supabase.js';
import { buildDexFeedSheet } from '../lib/mw/dexFeed.js';
import {
  parseHelioChargeUrl,
  helioPaymentInstruction,
  withHelioDeposit,
} from '../lib/mw/helio.js';

function json(res, status, body) {
  return res.status(status).json(body);
}

function headerSecret(req) {
  const raw = req.headers['x-mw-ops-secret'] ?? req.headers['X-Mw-Ops-Secret'];
  if (Array.isArray(raw)) return String(raw[0] || '').trim();
  return raw != null ? String(raw).trim() : '';
}

function assertOps(bodyOrQuery, req) {
  const secret = String(process.env.MW_OPS_SECRET || '').trim();
  if (!secret) {
    const err = new Error('MW_OPS_SECRET not configured on server');
    err.statusCode = 503;
    throw err;
  }
  const provided = String(
    bodyOrQuery?.opsSecret || headerSecret(req) || req.query?.opsSecret || '',
  ).trim();
  if (!provided || provided !== secret) {
    const err = new Error('Unauthorized — ops secret does not match MW_OPS_SECRET');
    err.statusCode = 401;
    throw err;
  }
}

async function loadOrderBundle(orderId) {
  const rows = await sbFetch(
    `mw_campaign_orders?id=eq.${orderId}&select=*,mw_projects(*),mw_provider_offers(*),mw_providers(*)`,
  );
  return Array.isArray(rows) ? rows[0] : null;
}

export default async function handler(req, res) {
  try {
    if (!mwConfigured()) {
      return json(res, 503, { error: 'Supabase not configured' });
    }

    if (req.method === 'GET') {
      assertOps(req.query || {}, req);
      const orderId = req.query?.orderId;
      const pending = req.query?.pending === '1' || req.query?.pending === 'true';

      if (pending) {
        const rows = await sbFetch(
          `mw_campaign_orders?select=id,status,creatives,payment_instruction,created_at,mw_providers!inner(adapter_type,slug,display_name),mw_projects(mint,ticker),mw_provider_offers(label,price_usd)&mw_providers.adapter_type=eq.dexscreener&status=in.(queued,awaiting_payment_instruction,retrying)&order=created_at.asc&limit=50`,
        );
        const list = (rows || []).map((o) => ({
          orderId: o.id,
          status: o.status,
          ticker: o.mw_projects?.ticker,
          mint: o.mw_projects?.mint,
          offer: o.mw_provider_offers?.label,
          priceUsd: o.mw_provider_offers?.price_usd,
          hasCreatives: Boolean(o.creatives && Object.keys(o.creatives).length),
          hasDeposit: Boolean(o.payment_instruction?.depositAddress),
          hasCharge: Boolean(o.payment_instruction?.deeplink),
        }));
        return json(res, 200, { ok: true, pending: list });
      }

      if (!orderId) {
        return json(res, 400, { error: 'orderId or pending=1 required' });
      }
      const order = await loadOrderBundle(orderId);
      if (!order) return json(res, 404, { error: 'Order not found' });
      const sheet = buildDexFeedSheet({
        order,
        project: order.mw_projects,
        offer: order.mw_provider_offers,
        provider: order.mw_providers,
      });
      return json(res, 200, {
        ok: true,
        sheet,
        paymentInstruction: order.payment_instruction || null,
        status: order.status,
      });
    }

    if (req.method !== 'POST') {
      return json(res, 405, { error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    assertOps(body, req);
    const { action, orderId } = body;
    if (!orderId) return json(res, 400, { error: 'orderId required' });

    const order = await loadOrderBundle(orderId);
    if (!order) return json(res, 404, { error: 'Order not found' });

    if (action === 'mark_fed') {
      const creatives = {
        ...(order.creatives || {}),
        dexFormFedAt: new Date().toISOString(),
        dexFormFedNote: body.note || 'Dex order form submitted by ops',
      };
      await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          creatives,
          status: order.payment_instruction?.depositAddress
            ? order.status
            : 'awaiting_payment_instruction',
          updated_at: new Date().toISOString(),
        }),
      });
      await audit('dex_form_fed', { orderId }, order.project_id);
      return json(res, 200, { ok: true, status: 'awaiting_payment_instruction' });
    }

    if (action === 'capture') {
      const { chargeUrl, depositAddress, depositAmount, amountUsd, asset = 'USDC' } = body;
      if (!chargeUrl && !depositAddress) {
        return json(res, 400, { error: 'chargeUrl and/or depositAddress required' });
      }

      let instruction = order.payment_instruction || {};
      if (chargeUrl) {
        const parsed = parseHelioChargeUrl(chargeUrl);
        if (!parsed.ok) return json(res, 400, { error: parsed.reason });
        instruction = {
          ...instruction,
          ...helioPaymentInstruction({
            chargeToken: parsed.chargeToken,
            deeplink: parsed.deeplink,
            network: parsed.network,
            amountUsd: amountUsd != null ? Number(amountUsd) : depositAmount,
            asset,
            depositAddress: depositAddress || instruction.depositAddress,
            depositAmount: depositAmount ?? amountUsd ?? instruction.depositAmount,
          }),
        };
      }
      if (depositAddress || depositAmount != null) {
        instruction = withHelioDeposit(instruction, {
          depositAddress,
          depositAmount: depositAmount ?? amountUsd,
          asset,
        });
      }

      const creatives = {
        ...(order.creatives || {}),
        dexFormFedAt: order.creatives?.dexFormFedAt || new Date().toISOString(),
        helioCapturedAt: new Date().toISOString(),
      };

      await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          payment_instruction: instruction,
          creatives,
          status: instruction.depositAddress ? 'queued' : 'awaiting_payment_instruction',
          last_error: null,
          updated_at: new Date().toISOString(),
        }),
      });
      await audit(
        'dex_helio_captured',
        {
          orderId,
          chargeToken: instruction.chargeToken || null,
          hasDeposit: Boolean(instruction.depositAddress),
        },
        order.project_id,
      );

      return json(res, 200, {
        ok: true,
        paymentInstruction: instruction,
        next: instruction.depositAddress
          ? 'POST /api/mw-helio-settle with orderId (dryRun:true first)'
          : 'Add depositAddress from Dex QR / transfer UI',
      });
    }

    return json(res, 400, { error: 'Unknown action — use mark_fed | capture' });
  } catch (err) {
    const status = err.statusCode || 500;
    return json(res, status, { error: err.message || String(err) });
  }
}
