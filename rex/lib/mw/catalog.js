/**
 * Ensure Polessia roadmap catalog rows exist in Supabase.
 * Roadmap spend ids map to offer_key (dex-socials aliases to dex-token-ad).
 */

import { sbFetch } from './supabase.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Legacy / alternate keys → canonical offer_key in ROADMAP_CATALOG. */
export const OFFER_KEY_ALIASES = {
  'dex-socials': 'dex-token-ad',
  'dex-token-ad-20k': 'dex-token-ad',
};

export function looksLikeUuid(value) {
  return UUID_RE.test(String(value || '').trim());
}

export function canonicalOfferKey(key) {
  const k = String(key || '').trim();
  return OFFER_KEY_ALIASES[k] || k;
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
    slug: 'dexscreener-boost',
    displayName: 'DexScreener Boosts',
    adapterType: 'dexscreener',
    offerKey: 'dex-boost-10',
    label: 'Boosts · 10× / 12h',
    priceUsd: 99,
    playbookPath: 'docs/suppliers/dexscreener.md',
    checkoutEntryUrl: 'https://dexscreener.com',
    notes: 'Pair-page Boost button (web only). No Marketplace form / creatives.',
  },
  {
    slug: 'dexscreener-token-ad',
    displayName: 'DexScreener Token Advertising',
    adapterType: 'dexscreener',
    offerKey: 'dex-token-ad',
    label: 'Token Advertising · 20k views',
    priceUsd: 299,
    playbookPath: 'docs/suppliers/dexscreener.md',
    checkoutEntryUrl: 'https://marketplace.dexscreener.com/product/ad',
  },
  {
    slug: 'dexscreener-token-info',
    displayName: 'DexScreener Enhanced Token Info',
    adapterType: 'dexscreener',
    offerKey: 'dex-token-info',
    label: 'Enhanced Token Info',
    priceUsd: 299,
    playbookPath: 'docs/suppliers/dexscreener.md',
    checkoutEntryUrl: 'https://marketplace.dexscreener.com/product/token-info',
  },
  {
    slug: 'dexscreener-trending',
    displayName: 'DexScreener trending',
    adapterType: 'dexscreener',
    offerKey: 'dex-trending',
    label: 'Trending Bar · 24h',
    priceUsd: 2000,
    playbookPath: 'docs/suppliers/dexscreener.md',
    checkoutEntryUrl: 'https://marketplace.dexscreener.com/product/trending-bar-ad',
  },
  /** Legacy row — keep slug for existing DB providers; same fulfilment as dex-token-ad */
  {
    slug: 'dexscreener-socials',
    displayName: 'DexScreener Token Advertising (legacy)',
    adapterType: 'dexscreener',
    offerKey: 'dex-socials',
    label: 'Token Advertising · 20k views (legacy key)',
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
            notes: row.notes || 'Auto-seeded from roadmap catalog',
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
            notes: row.notes || 'Auto-seeded from roadmap catalog',
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
    } else {
      // Keep price/label in sync with live Dex catalog
      try {
        await sbFetch(`mw_provider_offers?id=eq.${offer.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            active: true,
            label: row.label,
            price_usd: row.priceUsd,
          }),
        });
        offer = { ...offer, active: true, label: row.label, price_usd: row.priceUsd };
      } catch {
        if (!offer.active) {
          await sbFetch(`mw_provider_offers?id=eq.${offer.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ active: true }),
          });
          offer = { ...offer, active: true };
        }
      }
    }

    byKey.set(row.offerKey, offer);
  }

  // Alias map so resolveOffer('dex-socials') / dex-token-ad-20k hit canonical rows
  const tokenAd = byKey.get('dex-token-ad');
  if (tokenAd) {
    byKey.set('dex-socials', tokenAd);
    byKey.set('dex-token-ad-20k', tokenAd);
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
  const canonical = canonicalOfferKey(key);

  try {
    const catalog = await ensureRoadmapOffers();
    if (catalog.has(key)) return catalog.get(key);
    if (catalog.has(canonical)) return catalog.get(canonical);
  } catch {
    /* fall through to direct lookup */
  }

  for (const tryKey of [canonical, key]) {
    const byKey = await sbFetch(
      `mw_provider_offers?offer_key=eq.${encodeURIComponent(tryKey)}&select=*,mw_providers(*)`,
    );
    if (Array.isArray(byKey) && byKey[0]) return byKey[0];
  }

  if (looksLikeUuid(key)) {
    const byId = await sbFetch(
      `mw_provider_offers?id=eq.${encodeURIComponent(key)}&select=*,mw_providers(*)`,
    );
    if (Array.isArray(byId) && byId[0]) return byId[0];
  }

  return null;
}
