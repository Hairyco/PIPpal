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
        // Dex-adapter orders that still need feed/capture/settle
        const rows = await sbFetch(
          `mw_campaign_orders?select=id,status,creatives,payment_instruction,created_at,mw_providers!inner(adapter_type,slug,display_name),mw_projects(mint,ticker),mw_provider_offers(label,price_usd)&mw_providers.adapter_type=eq.dexscreener&status=in.(queued,awaiting_payment_instruction,retrying,paying,paid_unconfirmed)&order=created_at.desc&limit=50`,
        );
        // Diagnostics: any campaign orders at all (helps when list looks "blank")
        let anyOrders = [];
        try {
          anyOrders = await sbFetch(
            `mw_campaign_orders?select=id,status,created_at,mw_providers(adapter_type,slug,display_name),mw_projects(ticker)&order=created_at.desc&limit=20`,
          );
        } catch {
          anyOrders = [];
        }
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
        return json(res, 200, {
          ok: true,
          pending: list,
          pendingCount: list.length,
          recentAnyCount: Array.isArray(anyOrders) ? anyOrders.length : 0,
          recentAny: (anyOrders || []).map((o) => ({
            orderId: o.id,
            status: o.status,
            ticker: o.mw_projects?.ticker,
            adapter: o.mw_providers?.adapter_type,
            provider: o.mw_providers?.display_name || o.mw_providers?.slug,
          })),
          hint:
            list.length === 0
              ? Array.isArray(anyOrders) && anyOrders.length
                ? `No Dex-adapter pending orders (${anyOrders.length} other CTOgo order(s) exist — open one below or Approve with Dex items selected).`
                : 'No CTOgo campaign orders yet. Hard-refresh the site, Approve the roadmap again (keep Dex items checked), and watch for “N order(s) queued”.'
              : null,
        });
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
      const { chargeUrl, depositAddress, depositAmount, amountUsd, asset = 'USDC', dexMint } =
        body;
      if (!chargeUrl && !depositAddress && !dexMint) {
        return json(res, 400, {
          error: 'chargeUrl and/or depositAddress required (or dexMint to update fill sheet)',
        });
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
        helioCapturedAt: chargeUrl || depositAddress ? new Date().toISOString() : order.creatives?.helioCapturedAt,
      };
      if (dexMint && String(dexMint).trim()) {
        creatives.dexMint = String(dexMint).trim();
      }

      const patch = {
        creatives,
        last_error: null,
        updated_at: new Date().toISOString(),
      };
      if (chargeUrl || depositAddress) {
        patch.payment_instruction = instruction;
        patch.status = instruction.depositAddress ? 'queued' : 'awaiting_payment_instruction';
      }

      try {
        await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      } catch (err) {
        return json(res, 502, {
          error: err.message || String(err),
          hint: 'If this mentions payment_instruction, re-run 20260807_dex_payment_automation.sql in Supabase',
        });
      }
      await audit(
        'dex_helio_captured',
        {
          orderId,
          chargeToken: instruction.chargeToken || null,
          hasDeposit: Boolean(instruction.depositAddress),
          dexMint: creatives.dexMint || null,
        },
        order.project_id,
      );

      return json(res, 200, {
        ok: true,
        paymentInstruction: instruction,
        dexMint: creatives.dexMint || null,
        next: instruction.depositAddress
          ? 'POST /api/mw-helio-settle with orderId (dryRun:true first)'
          : instruction.chargeToken
            ? 'Charge URL saved. Deposit address still missing for settle (Helio QR is a link, not a wallet).'
            : 'Saved',
      });
    }

    if (action === 'set_mint') {
      const dexMint = String(body.dexMint || '').trim();
      if (!dexMint) return json(res, 400, { error: 'dexMint required' });
      const creatives = { ...(order.creatives || {}), dexMint };
      await sbFetch(`mw_campaign_orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ creatives, updated_at: new Date().toISOString() }),
      });
      return json(res, 200, { ok: true, dexMint });
    }

    return json(res, 400, { error: 'Unknown action — use mark_fed | capture | set_mint' });
  } catch (err) {
    const status = err.statusCode || 500;
    return json(res, status, { error: err.message || String(err) });
  }
}
