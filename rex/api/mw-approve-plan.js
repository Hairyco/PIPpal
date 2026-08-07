/**
 * POST /api/mw-approve-plan
 * Founder signs a challenge to approve a spend plan (not localStorage preview auth).
 */

import { audit, mwConfigured, sbFetch } from '../lib/mw/supabase.js';
import {
  consumeChallenge,
  createChallenge,
  invoiceIdFromParts,
  verifyEd25519Signature,
} from '../lib/mw/auth.js';
import { invoiceWithServiceFee, usdWithServiceFee } from '../lib/mw/fees.js';

const LAMPORTS_PER_SOL = 1_000_000_000;
/** Demo SOL/USD until price oracle wired — ops can override via SOL_USD_RATE. */
const SOL_USD = Number(process.env.SOL_USD_RATE || 150);

function json(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  try {
    if (!mwConfigured()) {
      return json(res, 503, {
        error: 'Supabase not configured',
        hint: 'Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    if (req.method === 'POST' && body.action === 'challenge') {
      const { wallet, planId, purpose = 'approve_spend_plan' } = body;
      if (!wallet || !planId) return json(res, 400, { error: 'wallet and planId required' });
      const { challenge, message } = await createChallenge(wallet, purpose, planId);
      return json(res, 200, { nonce: challenge.nonce, message, expiresAt: challenge.expires_at });
    }

    if (req.method === 'POST' && body.action === 'approve') {
      const {
        wallet,
        planId,
        nonce,
        signature,
        message,
        mint,
        ticker,
        engine = 'launch',
        marketingVault = null,
        selectedOfferIds = [],
        mode = 'polessia',
        creatives = null,
      } = body;

      if (!wallet || !planId || !nonce || !signature || !message || !mint) {
        return json(res, 400, { error: 'missing approval fields' });
      }
      if (!verifyEd25519Signature(message, signature, wallet)) {
        return json(res, 401, { error: 'Invalid wallet signature' });
      }
      await consumeChallenge(nonce, wallet);

      // Ensure spend plan row exists (client may send a fresh UUID).
      const existingPlans = await sbFetch(`mw_spend_plans?id=eq.${planId}&select=id`);
      if (!Array.isArray(existingPlans) || !existingPlans[0]) {
        // Need project first for FK — create temp then attach
      }

      // Upsert project
      let projects = await sbFetch(
        `mw_projects?mint=eq.${encodeURIComponent(mint)}&select=*&limit=1`,
      );
      let project = Array.isArray(projects) ? projects[0] : null;
      if (!project) {
        const created = await sbFetch('mw_projects', {
          method: 'POST',
          body: JSON.stringify({
            mint,
            ticker: ticker || 'CTO',
            engine,
            founder_wallet: wallet,
            marketing_vault: marketingVault,
            marketing_attached: engine === 'launch',
            spend_paused: false,
            spend_unlocked: true,
            last_marketing_activity_at: new Date().toISOString(),
          }),
        });
        project = Array.isArray(created) ? created[0] : created;
      } else {
        await sbFetch(`mw_projects?id=eq.${project.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            spend_paused: false,
            spend_unlocked: true,
            founder_wallet: wallet,
            updated_at: new Date().toISOString(),
          }),
        });
      }

      if (!Array.isArray(existingPlans) || !existingPlans[0]) {
        await sbFetch('mw_spend_plans', {
          method: 'POST',
          body: JSON.stringify({
            id: planId,
            project_id: project.id,
            mode,
            status: 'approved',
            selected_offer_ids: selectedOfferIds,
            approved_by_wallet: wallet,
            approval_message: message,
            approval_signature: signature,
            approved_at: new Date().toISOString(),
          }),
        });
      } else {
        await sbFetch(`mw_spend_plans?id=eq.${planId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            project_id: project.id,
            mode,
            status: 'approved',
            selected_offer_ids: selectedOfferIds,
            approved_by_wallet: wallet,
            approval_message: message,
            approval_signature: signature,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }

      // Queue campaign orders from selected offers (UUID or offer_key from roadmap).
      const queued = [];
      const missingOffers = [];
      for (const offerIdOrKey of selectedOfferIds) {
        const key = String(offerIdOrKey || '').trim();
        if (!key) continue;
        let offers = await sbFetch(
          `mw_provider_offers?id=eq.${encodeURIComponent(key)}&select=*,mw_providers(*)`,
        );
        if (!Array.isArray(offers) || !offers[0]) {
          offers = await sbFetch(
            `mw_provider_offers?offer_key=eq.${encodeURIComponent(key)}&select=*,mw_providers(*)`,
          );
        }
        const offer = Array.isArray(offers) ? offers[0] : null;
        if (!offer) {
          missingOffers.push(key);
          continue;
        }
        // Queue even if catalog row is inactive — ops/autofill still need the order row.
        const priceUsd = Number(offer.price_usd);
        const { serviceFeeUsd, totalDebitUsd } = usdWithServiceFee(priceUsd);
        const invoiceLamports = BigInt(Math.floor((priceUsd / SOL_USD) * LAMPORTS_PER_SOL));
        const fees = invoiceWithServiceFee(invoiceLamports);
        const invoiceId = invoiceIdFromParts(mint, `${planId}:${offer.id}`);
        const orderCreatives =
          creatives && typeof creatives === 'object'
            ? {
                ...creatives,
                spendItemId: offer.offer_key,
                offerKey: offer.offer_key,
              }
            : { spendItemId: offer.offer_key, offerKey: offer.offer_key };
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
            creatives: orderCreatives,
          }),
        });
        queued.push({
          order: Array.isArray(orderRows) ? orderRows[0] : orderRows,
          breakdown: { priceUsd, serviceFeeUsd, totalDebitUsd },
        });
      }

      await audit(
        'spend_plan_approved',
        { planId, queued: queued.length, missingOffers },
        project.id,
        wallet,
      );
      return json(res, 200, {
        ok: true,
        projectId: project.id,
        queued: queued.length,
        orders: queued,
        missingOffers,
        feeNote: 'Supplier receives 100% of invoice; CTOgo adds 20% on top from the marketing vault.',
      });
    }

    if (req.method === 'POST' && body.action === 'pause') {
      const { wallet, mint, spendPaused = true, signature, message, nonce } = body;
      if (!wallet || !mint || !signature || !message || !nonce) {
        return json(res, 400, { error: 'missing pause fields' });
      }
      if (!verifyEd25519Signature(message, signature, wallet)) {
        return json(res, 401, { error: 'Invalid wallet signature' });
      }
      await consumeChallenge(nonce, wallet);
      await sbFetch(`mw_projects?mint=eq.${encodeURIComponent(mint)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          spend_paused: !!spendPaused,
          updated_at: new Date().toISOString(),
        }),
      });
      await audit('spend_paused', { mint, spendPaused }, null, wallet);
      return json(res, 200, { ok: true, spendPaused: !!spendPaused });
    }

    return json(res, 400, { error: 'Unknown action — use challenge | approve | pause' });
  } catch (err) {
    return json(res, 500, { error: err.message || String(err) });
  }
}
