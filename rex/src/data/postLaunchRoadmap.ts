/** Post-launch marketing spend thresholds — Polessia + Manual roadmap. */

import { invoiceUsdWithServiceFee } from './chainConfig';

export type SpendItemId =
  | 'tg-pinned'
  | 'dex-boost-10'
  | 'dex-token-ad'
  | 'dex-token-info'
  | 'dex-trending'
  /** @deprecated Alias for dex-token-ad — kept for queued orders / localStorage */
  | 'dex-socials';

export type SpendItem = {
  id: SpendItemId;
  label: string;
  logo: string;
  /** Supplier invoice (USD). Polessia adds sliding fee on top at disbursement. */
  priceUsd: number;
};

export type SpendThreshold = {
  id: string;
  label: string;
  /** Wallet balance required to unlock this tier. */
  thresholdUsd: number;
  items: SpendItem[];
};

/** Default Polessia / Manual wizard — Dex products match live Marketplace + Boost UI. */
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
        label: 'DexScreener Boosts · 10× / 12h',
        logo: '/images/partners/dexscreener.ico',
        priceUsd: 99,
      },
      {
        id: 'dex-token-ad',
        label: 'DexScreener Token Advertising · 20k views',
        logo: '/images/partners/dexscreener.ico',
        priceUsd: 299,
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
        logo: '/images/partners/dexscreener.ico',
        priceUsd: 299,
      },
    ],
  },
  {
    id: 'tier-2000',
    label: 'Tier 3',
    thresholdUsd: 2000,
    items: [
      {
        id: 'dex-trending',
        label: 'DexScreener Trending Bar · 24h',
        logo: '/images/partners/dexscreener.ico',
        priceUsd: 2000,
      },
    ],
  },
];

/** Spends that need creative media (not Boosts). */
export const DEX_AD_PACK_REQUIRED_SPEND_IDS: SpendItemId[] = [
  'dex-token-ad',
  'dex-token-info',
  'dex-trending',
];

export function spendRequiresDexAdPack(itemId: SpendItemId | string): boolean {
  return (
    itemId === 'dex-trending' ||
    itemId === 'dex-token-ad' ||
    itemId === 'dex-socials' ||
    itemId === 'dex-token-info'
  );
}

export function spendRequiresMintOnly(itemId: SpendItemId | string): boolean {
  return itemId === 'dex-boost-10';
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
  if (spendId === 'dex-socials') return 'dex-token-ad';
  return spendId;
}

export const POLESSIA_DEFAULT_SELECTED: SpendItemId[] =
  POST_LAUNCH_SPEND_THRESHOLDS.flatMap((t) => t.items.map((i) => i.id));

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

export function selectedSpendAllIn(ids: Iterable<SpendItemId>) {
  const set = new Set(ids);
  let invoiceUsd = 0;
  for (const tier of POST_LAUNCH_SPEND_THRESHOLDS) {
    for (const item of tier.items) {
      if (set.has(item.id)) invoiceUsd += item.priceUsd;
    }
  }
  return invoiceUsdWithServiceFee(invoiceUsd);
}
