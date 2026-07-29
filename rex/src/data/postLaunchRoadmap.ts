/** Post-launch marketing spend thresholds — Polessia wizard defaults. */

export type SpendItemId =
  | 'telegram'
  | 'dex-socials'
  | 'dex-ad'
  | 'coingecko-cto'
  | 'dex-trending'
  | 'coinzilla';

export type SpendItem = {
  id: SpendItemId;
  label: string;
  logo: string;
};

export type SpendThreshold = {
  id: string;
  label: string;
  thresholdUsd: number;
  items: SpendItem[];
};

/** Default Polessia wizard roadmap — unlocks as the vault fills. */
export const POST_LAUNCH_SPEND_THRESHOLDS: SpendThreshold[] = [
  {
    id: 'tier-500',
    label: 'Tier 1',
    thresholdUsd: 500,
    items: [
      {
        id: 'telegram',
        label: 'Telegram',
        logo: '/images/partners/telegram.svg',
      },
      {
        id: 'dex-socials',
        label: 'DexScreener socials update',
        logo: '/images/partners/dexscreener.ico',
      },
      {
        id: 'dex-ad',
        label: 'DexScreener ad',
        logo: '/images/partners/dexscreener.ico',
      },
      {
        id: 'coingecko-cto',
        label: 'CoinGecko CTO update',
        logo: '/images/partners/coingecko.svg',
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
      },
      {
        id: 'coinzilla',
        label: 'Coinzilla',
        logo: '/images/partners/coinzilla.svg',
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
