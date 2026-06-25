export interface MarketingSpendNode {
  id: string;
  label: string;
  cost: number;
  /** 0–1 position along the chart x-axis */
  x: number;
  /** 0–1 wallet fill level on y-axis (higher = more balance) */
  y: number;
}

/** Example automated marketing spend sequence as the wallet fills from trading tax. */
export const MARKETING_SPEND_FLOW: MarketingSpendNode[] = [
  { id: 'telegram', label: 'Telegram call-out', cost: 150, x: 0.14, y: 0.28 },
  { id: 'dexscreener', label: 'DexScreener', cost: 500, x: 0.38, y: 0.48 },
  { id: 'ds-trending', label: 'DexScreener trending bar', cost: 300, x: 0.58, y: 0.62 },
  { id: 'coinzilla', label: 'Coinzilla', cost: 2500, x: 0.84, y: 0.9 },
];

export function formatSpendCost(amount: number): string {
  return amount >= 1000 ? `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K` : `$${amount}`;
}
