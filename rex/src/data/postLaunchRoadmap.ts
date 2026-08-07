/** Post-launch marketing spend thresholds — Polessia + Manual roadmap. */

import { invoiceUsdWithServiceFee } from './chainConfig';
import {
  POLESSIA_DEFAULT_DEX_PACKS,
  canonicalDexOfferKey,
  getDexPack,
  type SelectedDexPack,
} from './dexProductCatalog';

export type SpendItemId =
  | 'tg-pinned'
  | 'dex-boost-10'
  | 'dex-boost-30'
  | 'dex-boost-50'
  | 'dex-boost-100'
  | 'dex-boost-500'
  | 'dex-token-ad'
  | 'dex-token-ad-20k'
  | 'dex-token-ad-50k'
  | 'dex-token-ad-100k'
  | 'dex-token-ad-200k'
  | 'dex-token-ad-400k'
  | 'dex-token-ad-800k'
  | 'dex-token-info'
  | 'dex-trending'
  | 'dex-trending-24h'
  | 'dex-trending-48h'
  | 'dex-trending-7d'
  | 'dex-update-socials'
  /** @deprecated Alias for dex-update-socials */
  | 'dex-socials';

export type SpendItem = {
  id: SpendItemId;
  label: string;
  logo: string;
  /** Supplier invoice (USD). Polessia adds sliding fee on top at disbursement. */
  priceUsd: number;
  /** True when exact pack is chosen on /dex-ads */
  configureOnDexAds?: boolean;
};

export type SpendThreshold = {
  id: string;
  label: string;
  /** Wallet balance required to unlock this tier. */
  thresholdUsd: number;
  items: SpendItem[];
};

const DEX_LOGO = '/images/partners/dexscreener.ico';

/**
 * Roadmap checklist shows family placeholders — exact packs live on /dex-ads.
 * Prices shown = entry (cheapest) pack for that family.
 */
export const POST_LAUNCH_SPEND_THRESHOLDS: SpendThreshold[] = [
  {
    id: 'tier-500',
    label: 'Tier 1',
    thresholdUsd: 500,
    items: [
      {
        id: 'tg-pinned',
        label: 'Pinned message · CTOgo Telegram',
        logo: '/images/partners/telegram.svg',
        priceUsd: 150,
      },
      {
        id: 'dex-boost-10',
        label: 'DexScreener Boosts (pick pack)',
        logo: DEX_LOGO,
        priceUsd: 99,
        configureOnDexAds: true,
      },
      {
        id: 'dex-token-ad-20k',
        label: 'DexScreener Token Advertising (pick views)',
        logo: DEX_LOGO,
        priceUsd: 299,
        configureOnDexAds: true,
      },
      {
        id: 'dex-update-socials',
        label: 'DexScreener Update socials',
        logo: DEX_LOGO,
        priceUsd: 99,
        configureOnDexAds: true,
      },
    ],
  },
  {
    id: 'tier-1000',
    label: 'Tier 2',
    thresholdUsd: 1000,
    items: [
      {
        id: 'dex-token-info',
        label: 'DexScreener Enhanced Token Info',
        logo: DEX_LOGO,
        priceUsd: 299,
        configureOnDexAds: true,
      },
    ],
  },
  {
    id: 'tier-2000',
    label: 'Tier 3',
    thresholdUsd: 2000,
    items: [
      {
        id: 'dex-trending-24h',
        label: 'DexScreener Trending Bar (pick duration)',
        logo: DEX_LOGO,
        priceUsd: 2000,
        configureOnDexAds: true,
      },
    ],
  },
];

/** Spends that need creative media (not Boosts). */
export const DEX_AD_PACK_REQUIRED_SPEND_IDS: SpendItemId[] = [
  'dex-token-ad',
  'dex-token-ad-20k',
  'dex-token-ad-50k',
  'dex-token-ad-100k',
  'dex-token-ad-200k',
  'dex-token-ad-400k',
  'dex-token-ad-800k',
  'dex-token-info',
  'dex-trending',
  'dex-trending-24h',
  'dex-trending-48h',
  'dex-trending-7d',
  'dex-update-socials',
  'dex-socials',
];

export function spendRequiresDexAdPack(itemId: SpendItemId | string): boolean {
  const key = canonicalDexOfferKey(String(itemId));
  return (
    key.startsWith('dex-token-ad') ||
    key.startsWith('dex-trending') ||
    key === 'dex-token-info' ||
    key === 'dex-update-socials'
  );
}

export function spendRequiresMintOnly(itemId: SpendItemId | string): boolean {
  return canonicalDexOfferKey(String(itemId)).startsWith('dex-boost');
}

export function isDexSpend(itemId: SpendItemId | string): boolean {
  return (
    spendRequiresDexAdPack(itemId) ||
    spendRequiresMintOnly(itemId) ||
    String(itemId).startsWith('dex-')
  );
}

/** Canonical catalog offer key (aliases resolved). */
export function canonicalOfferKey(spendId: string): string {
  return canonicalDexOfferKey(spendId);
}

/** Polessia defaults: TG pin + cheapest Dex packs (incl. update socials). */
export const POLESSIA_DEFAULT_SELECTED: SpendItemId[] = [
  'tg-pinned',
  ...POLESSIA_DEFAULT_DEX_PACKS.map((p) => p.offerKey as SpendItemId),
];

export const POLESSIA_DEFAULT_SELECTED_DEX_PACKS: SelectedDexPack[] =
  POLESSIA_DEFAULT_DEX_PACKS;

export function formatThresholdUsd(amount: number): string {
  return amount >= 1000
    ? `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`
    : `$${amount}`;
}

export function formatActivityPrice(amount: number): string {
  return formatThresholdUsd(amount);
}

export function tierTotalUsd(tier: SpendThreshold): number {
  return tier.items.reduce((sum, item) => sum + item.priceUsd, 0);
}

/** Supplier invoice + Polessia sliding fee on top for display before Approve. */
export function spendItemAllIn(item: SpendItem) {
  return invoiceUsdWithServiceFee(item.priceUsd);
}

/**
 * Invoice total for selected spend ids.
 * Prefer exact pack prices from dex catalog when offer keys are pack-level.
 */
export function selectedSpendAllIn(ids: Iterable<SpendItemId | string>) {
  const set = new Set([...ids].map((id) => canonicalDexOfferKey(String(id))));
  let invoiceUsd = 0;
  const counted = new Set<string>();

  for (const key of set) {
    if (counted.has(key)) continue;
    const pack = getDexPack(key);
    if (pack) {
      invoiceUsd += pack.priceUsd;
      counted.add(key);
      continue;
    }
    for (const tier of POST_LAUNCH_SPEND_THRESHOLDS) {
      for (const item of tier.items) {
        const itemKey = canonicalDexOfferKey(item.id);
        if (itemKey === key || set.has(item.id)) {
          if (!counted.has(itemKey)) {
            invoiceUsd += item.priceUsd;
            counted.add(itemKey);
          }
        }
      }
    }
  }

  return invoiceUsdWithServiceFee(invoiceUsd);
}

/** Merge checklist toggles with exact packs from /dex-ads. */
export function offerIdsForApprove(args: {
  selectedChecklist: Iterable<string>;
  selectedDexPacks: SelectedDexPack[];
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const add = (raw: string) => {
    const key = canonicalDexOfferKey(raw);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  };

  for (const id of args.selectedChecklist) {
    if (id === 'tg-pinned') add(id);
  }

  for (const pack of args.selectedDexPacks) {
    add(pack.offerKey);
  }

  return out;
}
