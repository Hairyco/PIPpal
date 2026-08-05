/**
 * GET /api/mw-project-status?mint=...
 * Live vault/plan/queue/receipts for the founder dashboard.
 */

import { mwConfigured, sbFetch } from '../lib/mw/supabase.js';
import { usdWithServiceFee } from '../lib/mw/fees.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!mwConfigured()) {
      return res.status(200).json({
        configured: false,
        demo: true,
        message: 'Supabase not configured — UI shows demo badge until env is set.',
      });
    }

    const mint = req.query?.mint;
    if (!mint) return res.status(400).json({ error: 'mint required' });

    const projects = await sbFetch(
      `mw_projects?mint=eq.${encodeURIComponent(mint)}&select=*&limit=1`,
    );
    const project = Array.isArray(projects) ? projects[0] : null;
    if (!project) {
      return res.status(200).json({ configured: true, demo: false, project: null, orders: [], receipts: [] });
    }

    const orders = await sbFetch(
      `mw_campaign_orders?project_id=eq.${project.id}&select=*,mw_provider_offers(label,price_usd),mw_providers(display_name,adapter_type)&order=created_at.desc`,
    );
    const receipts = await sbFetch(
      `mw_payment_receipts?order_id=in.(${(orders || []).map((o) => o.id).join(',') || '00000000-0000-0000-0000-000000000000'})&select=*&order=confirmed_at.desc`,
    );

    const enrichedOrders = (orders || []).map((o) => {
      const priceUsd = Number(o.mw_provider_offers?.price_usd || 0);
      const breakdown = priceUsd > 0 ? usdWithServiceFee(priceUsd) : null;
      return { ...o, breakdown };
    });

    return res.status(200).json({
      configured: true,
      demo: false,
      project,
      orders: enrichedOrders,
      receipts: receipts || [],
      feeNote: 'Supplier 100% + CTOgo 20% on top = vault debit.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
