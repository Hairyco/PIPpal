/**
 * Ensure Polessia roadmap catalog rows exist in Supabase.
 * Dex packs: boost tiers, token-ad view tiers, trending durations, ETI, update-socials.
 */

import { sbFetch } from './supabase.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Legacy / short keys → canonical offer_key in ROADMAP_CATALOG. */
export const OFFER_KEY_ALIASES = {
  'dex-token-ad': 'dex-token-ad-20k',
  'dex-trending': 'dex-trending-24h',
  /** Socials is its own SKU (not Token Ad) */
  'dex-socials': 'dex-update-socials',
};

export function looksLikeUuid(value) {
  return UUID_RE.test(String(value || '').trim());
}

export function canonicalOfferKey(key) {
  const k = String(key || '').trim();
  return OFFER_KEY_ALIASES[k] || k;
}

const DEX_PLAYBOOK = 'docs/suppliers/dexscreener.md';
const DEX_AD_URL = 'https://marketplace.dexscreener.com/product/ad';
const DEX_TRENDING_URL = 'https://marketplace.dexscreener.com/product/trending-bar-ad';
const DEX_INFO_URL = 'https://marketplace.dexscreener.com/product/token-info';
const DEX_HOME = 'https://dexscreener.com';

function dexBoost(offerKey, label, priceUsd, notes) {
  return {
    slug: 'dexscreener-boost',
    displayName: 'DexScreener Boosts',
    adapterType: 'dexscreener',
    offerKey,
    label,
    priceUsd,
    playbookPath: DEX_PLAYBOOK,
    checkoutEntryUrl: DEX_HOME,
    notes: notes || 'Pair-page Boost (web only). No Marketplace form.',
  };
}

function dexTokenAd(offerKey, label, priceUsd) {
  return {
    slug: 'dexscreener-token-ad',
    displayName: 'DexScreener Token Advertising',
    adapterType: 'dexscreener',
    offerKey,
    label,
    priceUsd,
    playbookPath: DEX_PLAYBOOK,
    checkoutEntryUrl: DEX_AD_URL,
  };
}

function dexTrending(offerKey, label, priceUsd) {
  return {
    slug: 'dexscreener-trending',
    displayName: 'DexScreener trending',
    adapterType: 'dexscreener',
    offerKey,
    label,
    priceUsd,
    playbookPath: DEX_PLAYBOOK,
    checkoutEntryUrl: DEX_TRENDING_URL,
  };
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
  dexBoost('dex-boost-10', 'Boosts · 10× / 12h', 99),
  dexBoost('dex-boost-30', 'Boosts · 30×', 249),
  dexBoost('dex-boost-50', 'Boosts · 50×', 399),
  dexBoost('dex-boost-100', 'Boosts · 100×', 899),
  dexBoost('dex-boost-500', 'Boosts · 500× · Golden Ticker', 3999),
  dexTokenAd('dex-token-ad-20k', 'Token Advertising · 20k views', 299),
  dexTokenAd('dex-token-ad-50k', 'Token Advertising · 50k views', 699),
  dexTokenAd('dex-token-ad-100k', 'Token Advertising · 100k views', 999),
  dexTokenAd('dex-token-ad-200k', 'Token Advertising · 200k views', 1999),
  dexTokenAd('dex-token-ad-400k', 'Token Advertising · 400k views', 3999),
  dexTokenAd('dex-token-ad-800k', 'Token Advertising · 800k views', 6999),
  {
    slug: 'dexscreener-token-info',
    displayName: 'DexScreener Enhanced Token Info',
    adapterType: 'dexscreener',
    offerKey: 'dex-token-info',
    label: 'Enhanced Token Info',
    priceUsd: 299,
    playbookPath: DEX_PLAYBOOK,
    checkoutEntryUrl: DEX_INFO_URL,
  },
  dexTrending('dex-trending-24h', 'Trending Bar · 24h', 2000),
  dexTrending('dex-trending-48h', 'Trending Bar · 48h', 4000),
  dexTrending('dex-trending-7d', 'Trending Bar · 7d', 14000),
  {
    slug: 'dexscreener-update-socials',
    displayName: 'DexScreener Update socials',
    adapterType: 'dexscreener',
    offerKey: 'dex-update-socials',
    label: 'Update socials · CTOgo fulfilment',
    priceUsd: 99,
    playbookPath: DEX_PLAYBOOK,
    checkoutEntryUrl: DEX_HOME,
    notes:
      'Dex update form is free. CTOgo $99 fulfilment. Founder owns Dex — prefer founder login; never claim profile with Polessia Google.',
  },
  /** Legacy short keys kept as DB rows that mirror cheapest packs */
  {
    slug: 'dexscreener-token-ad',
    displayName: 'DexScreener Token Advertising (legacy key)',
    adapterType: 'dexscreener',
    offerKey: 'dex-token-ad',
    label: 'Token Advertising · 20k views (legacy)',
    priceUsd: 299,
    playbookPath: DEX_PLAYBOOK,
    checkoutEntryUrl: DEX_AD_URL,
  },
  {
    slug: 'dexscreener-trending',
    displayName: 'DexScreener trending (legacy key)',
    adapterType: 'dexscreener',
    offerKey: 'dex-trending',
    label: 'Trending Bar · 24h (legacy)',
    priceUsd: 2000,
    playbookPath: DEX_PLAYBOOK,
    checkoutEntryUrl: DEX_TRENDING_URL,
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

  // Alias map for short / legacy keys
  const ad20 = byKey.get('dex-token-ad-20k');
  if (ad20) {
    byKey.set('dex-token-ad', ad20);
  }
  const trend24 = byKey.get('dex-trending-24h');
  if (trend24) {
    byKey.set('dex-trending', trend24);
  }
  const socials = byKey.get('dex-update-socials');
  if (socials) {
    byKey.set('dex-socials', socials);
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
