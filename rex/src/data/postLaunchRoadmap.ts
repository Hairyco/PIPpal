/** Post-launch marketing spend thresholds — Polessia wizard defaults. */

import { invoiceUsdWithServiceFee } from './chainConfig';

export type SpendItemId = 'tg-pinned' | 'dex-socials' | 'dex-trending';

export type SpendItem = {
  id: SpendItemId;
  label: string;
  logo: string;
  /** Supplier invoice (USD). CTOgo adds 5% on top at disbursement. */
  priceUsd: number;
};

export type SpendThreshold = {
  id: string;
  label: string;
  /** Wallet balance required to unlock this tier. */
  thresholdUsd: number;
  items: SpendItem[];
};

/** Default Polessia wizard — one package per tier; activities listed with prices. */
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
        id: 'dex-socials',
        label: 'DexScreener socials update',
        logo: '/images/partners/dexscreener.ico',
        priceUsd: 350,
      },
    ],
  },
  {
    id: 'tier-2000',
    label: 'Tier 2',
    thresholdUsd: 2000,
    items: [
      {
        id: 'dex-trending',
        label: 'DexScreener trending bar',
        logo: '/images/partners/dexscreener.ico',
        priceUsd: 2000,
      },
    ],
  },
];

/** Spend items that require the Dex ad pack on file before Polessia can fulfil. */
export const DEX_AD_PACK_REQUIRED_SPEND_IDS: SpendItemId[] = ['dex-trending'];

/**
 * Token Advertising / socials-style Dex spends also need the square creative + title/pitch.
 * Map loosely until live product ids wire up.
 */
export function spendRequiresDexAdPack(itemId: SpendItemId): boolean {
  return itemId === 'dex-trending' || itemId === 'dex-socials';
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

/** Supplier invoice + 5% CTOgo fee on top for display before Approve. */
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
