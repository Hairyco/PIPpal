/**
 * GET/POST /api/mw-providers — catalog + ops activate/suspend (service role).
 * Admin mutations require MW_OPS_SECRET header (not free public).
 */

import { audit, mwConfigured, sbFetch } from '../lib/mw/supabase.js';

function assertOps(req) {
  const secret = process.env.MW_OPS_SECRET;
  if (!secret) {
    const err = new Error('MW_OPS_SECRET not configured');
    err.statusCode = 503;
    throw err;
  }
  if (req.headers['x-mw-ops-secret'] !== secret) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    if (!mwConfigured()) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    if (req.method === 'GET') {
      const activeOnly = req.query?.all !== '1';
      const path = activeOnly
        ? 'mw_providers?active=eq.true&select=*,mw_provider_offers(*)'
        : 'mw_providers?select=*,mw_provider_offers(*)';
      const providers = await sbFetch(path);
      return res.status(200).json({
        providers,
        feeNote: 'Prices are supplier invoices. CTOgo adds 20% on top at disbursement.',
      });
    }

    if (req.method === 'POST') {
      assertOps(req);
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const { action } = body;

      if (action === 'upsert_provider') {
        const row = {
          slug: body.slug,
          display_name: body.displayName,
          wallet_address: body.walletAddress,
          adapter_type: body.adapterType || 'manual',
          active: !!body.active,
          whitelist_tx: body.whitelistTx || null,
          notes: body.notes || null,
          updated_at: new Date().toISOString(),
        };
        const existing = await sbFetch(`mw_providers?slug=eq.${encodeURIComponent(row.slug)}&select=id`);
        let result;
        if (Array.isArray(existing) && existing[0]) {
          result = await sbFetch(`mw_providers?id=eq.${existing[0].id}`, {
            method: 'PATCH',
            body: JSON.stringify(row),
          });
        } else {
          result = await sbFetch('mw_providers', { method: 'POST', body: JSON.stringify(row) });
        }
        await audit('provider_upsert', { slug: row.slug, active: row.active });
        return res.status(200).json({ ok: true, provider: result });
      }

      if (action === 'set_active') {
        await sbFetch(`mw_providers?id=eq.${body.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ active: !!body.active, updated_at: new Date().toISOString() }),
        });
        await audit('provider_set_active', { id: body.id, active: !!body.active });
        return res.status(200).json({ ok: true });
      }

      if (action === 'upsert_offer') {
        const row = {
          provider_id: body.providerId,
          offer_key: body.offerKey,
          label: body.label,
          price_usd: body.priceUsd,
          currency: body.currency || 'USD',
          active: body.active !== false,
          metadata: body.metadata || {},
        };
        const result = await sbFetch('mw_provider_offers', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(row),
        });
        return res.status(200).json({ ok: true, offer: result });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message || String(err) });
  }
}
