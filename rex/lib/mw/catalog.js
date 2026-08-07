/**
 * Ensure Polessia roadmap catalog rows exist in Supabase.
 * Roadmap spend ids (tg-pinned, dex-socials, dex-trending) map to offer_key.
 */

import { sbFetch } from './supabase.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function looksLikeUuid(value) {
  return UUID_RE.test(String(value || '').trim());
}

export const ROADMAP_CATALOG = [
  {
    slug: 'ctogo-telegram-pin',
    displayName: 'CTOgo Telegram pin',
    adapterType: 'telegram',
    offerKey: 'tg-pinned',
    label: 'Pinned message · CTOgo Telegram',
    priceUsd: 150,
  },
  {
    slug: 'dexscreener-socials',
    displayName: 'DexScreener socials',
    adapterType: 'dexscreener',
    offerKey: 'dex-socials',
    label: 'DexScreener socials update',
    priceUsd: 350,
    playbookPath: 'docs/suppliers/dexscreener.md',
    checkoutEntryUrl: 'https://marketplace.dexscreener.com/product/ad',
  },
  {
    slug: 'dexscreener-trending',
    displayName: 'DexScreener trending',
    adapterType: 'dexscreener',
    offerKey: 'dex-trending',
    label: 'DexScreener trending bar',
    priceUsd: 2000,
    playbookPath: 'docs/suppliers/dexscreener.md',
    checkoutEntryUrl: 'https://marketplace.dexscreener.com/product/trending-bar-ad',
  },
  {
    slug: 'dexscreener-token-ad',
    displayName: 'DexScreener Token Advertising',
    adapterType: 'dexscreener',
    offerKey: 'dex-token-ad-20k',
    label: 'Token Advertising · 20k views',
    priceUsd: 299,
    playbookPath: 'docs/suppliers/dexscreener.md',
    checkoutEntryUrl: 'https://marketplace.dexscreener.com/product/ad',
  },
];

/**
 * Upsert providers + offers for roadmap keys. Safe to call on every Approve.
 * @returns {Promise<Map<string, object>>} offer_key → offer row with mw_providers
 */
export async function ensureRoadmapOffers() {
  const byKey = new Map();

  for (const row of ROADMAP_CATALOG) {
    let providers = await sbFetch(
      `mw_providers?slug=eq.${encodeURIComponent(row.slug)}&select=*`,
    );
    let provider = Array.isArray(providers) ? providers[0] : null;
    if (!provider) {
      try {
        const created = await sbFetch('mw_providers', {
          method: 'POST',
          body: JSON.stringify({
            slug: row.slug,
            display_name: row.displayName,
            wallet_address: 'PENDING_WHITELIST',
            adapter_type: row.adapterType,
            active: false,
            notes: 'Auto-seeded from roadmap catalog',
            playbook_path: row.playbookPath || null,
            checkout_entry_url: row.checkoutEntryUrl || null,
          }),
        });
        provider = Array.isArray(created) ? created[0] : created;
      } catch {
        const created = await sbFetch('mw_providers', {
          method: 'POST',
          body: JSON.stringify({
            slug: row.slug,
            display_name: row.displayName,
            wallet_address: 'PENDING_WHITELIST',
            adapter_type: row.adapterType,
            active: false,
            notes: 'Auto-seeded from roadmap catalog',
          }),
        });
        provider = Array.isArray(created) ? created[0] : created;
      }
    } else if (row.playbookPath || row.checkoutEntryUrl) {
      try {
        await sbFetch(`mw_providers?id=eq.${provider.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            playbook_path: row.playbookPath || provider.playbook_path,
            checkout_entry_url: row.checkoutEntryUrl || provider.checkout_entry_url,
            updated_at: new Date().toISOString(),
          }),
        });
      } catch {
        /* columns may be missing if dex migration not applied */
      }
    }

    let offers = await sbFetch(
      `mw_provider_offers?provider_id=eq.${provider.id}&offer_key=eq.${encodeURIComponent(row.offerKey)}&select=*,mw_providers(*)`,
    );
    let offer = Array.isArray(offers) ? offers[0] : null;
    if (!offer) {
      const created = await sbFetch('mw_provider_offers', {
        method: 'POST',
        body: JSON.stringify({
          provider_id: provider.id,
          offer_key: row.offerKey,
          label: row.label,
          price_usd: row.priceUsd,
          active: true,
        }),
      });
      const createdOffer = Array.isArray(created) ? created[0] : created;
      offers = await sbFetch(
        `mw_provider_offers?id=eq.${createdOffer.id}&select=*,mw_providers(*)`,
      );
      offer = Array.isArray(offers) ? offers[0] : createdOffer;
    } else if (!offer.active) {
      await sbFetch(`mw_provider_offers?id=eq.${offer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: true }),
      });
      offer = { ...offer, active: true };
    }

    byKey.set(row.offerKey, offer);
  }

  return byKey;
}

/**
 * Resolve offer by UUID or offer_key, ensuring catalog first.
 * Never query uuid columns with roadmap keys like "tg-pinned".
 */
export async function resolveOffer(offerIdOrKey) {
  const key = String(offerIdOrKey || '').trim();
  if (!key) return null;

  try {
    const catalog = await ensureRoadmapOffers();
    if (catalog.has(key)) return catalog.get(key);
  } catch {
    /* fall through to direct lookup */
  }

  // Roadmap keys are offer_key strings — not UUIDs.
  const byKey = await sbFetch(
    `mw_provider_offers?offer_key=eq.${encodeURIComponent(key)}&select=*,mw_providers(*)`,
  );
  if (Array.isArray(byKey) && byKey[0]) return byKey[0];

  if (looksLikeUuid(key)) {
    const byId = await sbFetch(
      `mw_provider_offers?id=eq.${encodeURIComponent(key)}&select=*,mw_providers(*)`,
    );
    if (Array.isArray(byId) && byId[0]) return byId[0];
  }

  return null;
}
