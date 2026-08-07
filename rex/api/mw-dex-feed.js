/**
 * Ops API: DexScreener form feed sheet + Helio QR capture.
 *
 * GET  ?opsSecret=…&orderId=…     → fill sheet for one order
 * GET  ?opsSecret=…&pending=1     → list queued dexscreener orders needing feed/capture
 * POST action=mark_fed            → { orderId, opsSecret } note that Dex form was submitted
 * POST action=capture             → { orderId, chargeUrl, depositAddress, depositAmount, opsSecret }
 */

import { randomUUID } from 'crypto';
import { mwConfigured, sbFetch, audit } from '../lib/mw/supabase.js';
import { buildDexFeedSheet } from '../lib/mw/dexFeed.js';
import {
  parseHelioChargeUrl,
  helioPaymentInstruction,
  withHelioDeposit,
  resolveHelioDeposit,
} from '../lib/mw/helio.js';
import { invoiceWithServiceFee, usdWithServiceFee } from '../lib/mw/fees.js';
import { ensureRoadmapOffers, resolveOffer } from '../lib/mw/catalog.js';
import { invoiceIdFromParts } from '../lib/mw/auth.js';

const LAMPORTS_PER_SOL = 1_000_000_000;
const SOL_USD = Number(process.env.SOL_USD_RATE || 150);
/** Placeholder mint for ops dry-run seed — override via set_mint / autofill. */
const SEED_PLACEHOLDER_MINT =
  process.env.MW_SEED_MINT || 'So11111111111111111111111111111111111111112';

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

    /** Ops-only: queue a Dex Token Ad order for autofill / dry-run (no founder signature). */
    if (action === 'seed_dex_order') {
      try {
        await ensureRoadmapOffers();
      } catch (err) {
        console.warn('ensureRoadmapOffers:', err.message || err);
      }
      const offerKey = body.offerKey || 'dex-token-ad-20k';
      const offer = await resolveOffer(offerKey);
      if (!offer?.id) {
        return json(res, 400, { error: `Offer not found: ${offerKey}` });
      }
      const mint = String(body.mint || SEED_PLACEHOLDER_MINT).trim();
      const ticker = String(body.ticker || 'CTOGO').trim().slice(0, 12);
      let projects = await sbFetch(
        `mw_projects?mint=eq.${encodeURIComponent(mint)}&select=*&limit=1`,
      );
      let project = Array.isArray(projects) ? projects[0] : null;
      if (!project) {
        const created = await sbFetch('mw_projects', {
          method: 'POST',
          body: JSON.stringify({
            mint,
            ticker,
            engine: 'launch',
            founder_wallet: body.founderWallet || 'OPS_SEED',
            marketing_attached: true,
            spend_paused: false,
            spend_unlocked: true,
            last_marketing_activity_at: new Date().toISOString(),
          }),
        });
        project = Array.isArray(created) ? created[0] : created;
      }
      const planId = body.planId || randomUUID();
      const existingPlans = await sbFetch(`mw_spend_plans?id=eq.${planId}&select=id`);
      if (!Array.isArray(existingPlans) || !existingPlans[0]) {
        await sbFetch('mw_spend_plans', {
          method: 'POST',
          body: JSON.stringify({
            id: planId,
            project_id: project.id,
            mode: 'polessia',
            status: 'approved',
            selected_offer_ids: [offer.id],
            approved_by_wallet: 'OPS_SEED',
            approved_at: new Date().toISOString(),
          }),
        });
      }
      const priceUsd = Number(offer.price_usd);
      const usdFees = usdWithServiceFee(priceUsd);
      const invoiceLamports = BigInt(Math.floor((priceUsd / SOL_USD) * LAMPORTS_PER_SOL));
      const fees = invoiceWithServiceFee(invoiceLamports, usdFees.feeBps);
      const invoiceId = invoiceIdFromParts(mint, `${planId}:${offer.id}:${Date.now()}`);
      const creatives = {
        spendItemId: offer.offer_key,
        offerKey: offer.offer_key,
        packageLabel: offer.label,
        priceUsd,
        feeBps: usdFees.feeBps,
        feePercent: usdFees.feePercent,
        dexMint: body.dexMint || mint,
        title: body.title || `${ticker} Token Ad`,
        pitch: body.pitch || 'CTOgo ops dry-run seed — replace creatives before live buy.',
        squareImageUrl: body.squareImageUrl || '/meme-logos/batcat.png',
        seededByOps: true,
        seededAt: new Date().toISOString(),
      };
      const orderRows = await sbFetch('mw_campaign_orders', {
        method: 'POST',
        body: JSON.stringify({
          project_id: project.id,
          plan_id: planId,
          provider_id: offer.provider_id,
          offer_id: offer.id,
          invoice_id: invoiceId,
          invoice_lamports: Number(fees.invoiceLamports),
          service_fee_lamports: Number(fees.serviceFeeLamports),
          total_debit_lamports: Number(fees.totalDebitLamports),
          status: 'queued',
          creatives,
        }),
      });
      const order = Array.isArray(orderRows) ? orderRows[0] : orderRows;
      await audit('ops_seed_dex_order', { orderId: order?.id, offerKey, mint }, project.id);
      return json(res, 200, {
        ok: true,
        orderId: order?.id,
        planId,
        mint,
        offer: { id: offer.id, key: offer.offer_key, label: offer.label, priceUsd },
        fees: {
          invoiceUsd: usdFees.invoiceUsd,
          serviceFeeUsd: usdFees.serviceFeeUsd,
          totalDebitUsd: usdFees.totalDebitUsd,
          feeBps: usdFees.feeBps,
          feePercent: usdFees.feePercent,
        },
        hint: 'Pending Dex order queued. Run dex:autofill dry-run (no --live-settle). Override mint via set_mint if needed.',
      });
    }

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
      const { chargeUrl, depositAddress, asset = 'USDC', dexMint } = body;
      if (!chargeUrl && !depositAddress && !dexMint) {
        return json(res, 400, {
          error: 'chargeUrl and/or depositAddress required (or dexMint to update fill sheet)',
        });
      }

      // Invoice locked to approved offer price (Approve menu) — ignore manual body amounts.
      const offerPrice = Number(
        order.mw_provider_offers?.price_usd || order.creatives?.priceUsd || 0,
      );
      if (!(offerPrice > 0)) {
        return json(res, 400, {
          error: 'Order has no offer price_usd — re-Approve with a priced Dex package',
        });
      }

      let instruction = order.payment_instruction || {};
      let helioAmountMismatch = null;

      if (chargeUrl) {
        const parsed = parseHelioChargeUrl(chargeUrl);
        if (!parsed.ok) return json(res, 400, { error: parsed.reason });
        instruction = {
          ...instruction,
          ...helioPaymentInstruction({
            chargeToken: parsed.chargeToken,
            deeplink: parsed.deeplink,
            network: parsed.network,
            amountUsd: offerPrice,
            asset,
            depositAddress: depositAddress || instruction.depositAddress,
            depositAmount: offerPrice,
          }),
        };
      }
      if (depositAddress) {
        instruction = withHelioDeposit(instruction, {
          depositAddress,
          depositAmount: offerPrice,
          asset,
        });
      }

      // Resolve deposit wallet from Helio; keep amount = approved offer (not Helio UI drift).
      if (instruction.chargeToken && !instruction.depositAddress) {
        const resolved = await resolveHelioDeposit({
          ...instruction,
          depositAmount: null,
        });
        if (resolved.ok) {
          if (
            resolved.depositAmount != null &&
            Math.abs(Number(resolved.depositAmount) - offerPrice) > 0.01
          ) {
            helioAmountMismatch = {
              helioAmount: Number(resolved.depositAmount),
              offerPrice,
              note: 'Helio charge amount differs from approved offer — CTOgo keeps offer price for vault math; pick the matching Dex package.',
            };
          }
          instruction = withHelioDeposit(instruction, {
            depositAddress: resolved.depositAddress,
            depositAmount: offerPrice,
            asset: resolved.asset || asset,
          });
        }
      } else if (instruction.chargeToken) {
        // Still stamp locked amount even when address already present
        instruction = withHelioDeposit(instruction, {
          depositAddress: instruction.depositAddress,
          depositAmount: offerPrice,
          asset,
        });
      }

      instruction.amountUsd = offerPrice;
      instruction.depositAmount = offerPrice;

      const creatives = {
        ...(order.creatives || {}),
        dexFormFedAt: order.creatives?.dexFormFedAt || new Date().toISOString(),
        helioCapturedAt: chargeUrl || depositAddress ? new Date().toISOString() : order.creatives?.helioCapturedAt,
        priceUsd: offerPrice,
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
          offerPrice,
          helioAmountMismatch,
        },
        order.project_id,
      );

      return json(res, 200, {
        ok: true,
        paymentInstruction: instruction,
        offerPrice,
        fees: (() => {
          const f = usdWithServiceFee(offerPrice);
          return {
            invoiceUsd: f.invoiceUsd,
            serviceFeeUsd: f.serviceFeeUsd,
            totalDebitUsd: f.totalDebitUsd,
          };
        })(),
        helioAmountMismatch,
        dexMint: creatives.dexMint || null,
        next: instruction.depositAddress
          ? `Capture OK — ${instruction.depositAddress} · $${offerPrice} USDC (offer) · vault $${usdWithServiceFee(offerPrice).totalDebitUsd}. Next: Dry-run settle.`
          : instruction.chargeToken
            ? 'Charge URL saved. Could not auto-resolve deposit yet — paste deposit address or retry.'
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
