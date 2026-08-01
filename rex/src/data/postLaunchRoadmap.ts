/** Post-launch marketing spend thresholds — Polessia wizard defaults. */

export type SpendItemId = 'tg-pinned' | 'dex-socials' | 'dex-trending';

export type SpendItem = {
  id: SpendItemId;
  label: string;
  logo: string;
  /** Display price for this activity (USD). */
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

/** End-of-roadmap ops checklist shown before Approve. */
export const ROADMAP_OPS_CHECKLIST: { id: string; label: string }[] = [
  {
    id: 'tiers',
    label: 'Spend tiers and activity prices look right for this coin',
  },
  {
    id: 'fill-first',
    label: 'Wallet fills from trade fees before any spend unlocks',
  },
  {
    id: 'approve-gates',
    label: 'Auto spend stays off until you Approve this roadmap',
  },
  {
    id: 'double-fail',
    label:
      'If an auto payment fails once, it retries once; if it fails a second time, it is referred to you and we attempt manual payment',
  },
];

/** Ops to-dos after Approve. */
export const ROADMAP_OPS_TODOS: { id: string; label: string }[] = [
  {
    id: 'watch-unlocks',
    label: 'Watch wallet balance hit each unlock threshold',
  },
  {
    id: 'confirm-auto-pay',
    label: 'Confirm each auto payment lands (or retry)',
  },
  {
    id: 'manual-on-double-fail',
    label: 'On second auto-pay failure — take the referral and attempt manual payment',
  },
];
