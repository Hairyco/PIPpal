export interface MarketingSpendNode {
  id: string;
  label: string;
  cost: number;
  /** Partner logo under /images/partners */
  logo: string;
  /** 0–1 position along the chart x-axis */
  x: number;
  /** 0–1 wallet fill level on y-axis (higher = more balance) */
  y: number;
}

/** Example automated marketing spend sequence as the wallet fills from trading tax. */
export const MARKETING_SPEND_FLOW: MarketingSpendNode[] = [
  {
    id: 'telegram',
    label: 'Telegram call-out',
    cost: 150,
    logo: '/images/partners/telegram.svg',
    x: 0.14,
    y: 0.28,
  },
  {
    id: 'dexscreener',
    label: 'Update socials',
    cost: 99,
    logo: '/images/partners/dexscreener.ico',
    x: 0.38,
    y: 0.48,
  },
  {
    id: 'ds-trending',
    label: 'DexScreener trending bar',
    cost: 300,
    logo: '/images/partners/dexscreener.ico',
    x: 0.58,
    y: 0.62,
  },
  {
    id: 'coingecko-cto',
    label: 'Register CTO',
    cost: 250,
    logo: '/images/partners/coingecko.png',
    x: 0.84,
    y: 0.9,
  },
];

export function formatSpendCost(amount: number): string {
  return amount >= 1000 ? `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K` : `$${amount}`;
}
