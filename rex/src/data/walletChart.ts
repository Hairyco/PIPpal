import type { ActiveProject } from './categoryContent';

export interface WalletChartMilestone {
  id: string;
  amount: number;
  title: string;
  description: string;
  vendor: 'DexScreener' | 'Coinzilla' | 'DEXTools';
  status: 'completed' | 'active' | 'upcoming';
}

export interface ChartPoint {
  label: string;
  value: number;
}

const WALLET_MILESTONE_TIERS: Omit<WalletChartMilestone, 'status'>[] = [
  {
    id: 'ds-promo',
    amount: 300,
    title: 'DexScreener token promotion',
    description: 'Trending bar placement & social boost on DexScreener',
    vendor: 'DexScreener',
  },
  {
    id: 'ds-enhanced',
    amount: 500,
    title: 'Enhanced token info',
    description: 'Logo, links, and verified info on DexScreener token page',
    vendor: 'DexScreener',
  },
  {
    id: 'ds-banner',
    amount: 2500,
    title: 'DexScreener banner ad',
    description: 'Homepage banner campaign on DexScreener',
    vendor: 'DexScreener',
  },
  {
    id: 'cz-display',
    amount: 5000,
    title: 'Coinzilla display campaign',
    description: 'Crypto display ads across Coinzilla publisher network',
    vendor: 'Coinzilla',
  },
  {
    id: 'dx-tools',
    amount: 7500,
    title: 'DEXTools spotlight',
    description: 'Featured placement and pair spotlight on DEXTools',
    vendor: 'DEXTools',
  },
  {
    id: 'multi-push',
    amount: 10000,
    title: 'Multi-platform push',
    description: 'Coordinated burst across DexScreener, Coinzilla & DEXTools',
    vendor: 'DexScreener',
  },
];

function hashSeed(str: string): number {
  return str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function getWalletMilestones(currentBalance: number): WalletChartMilestone[] {
  let foundActive = false;

  return WALLET_MILESTONE_TIERS.map((tier) => {
    let status: WalletChartMilestone['status'];
    if (currentBalance >= tier.amount) {
      status = 'completed';
    } else if (!foundActive) {
      status = 'active';
      foundActive = true;
    } else {
      status = 'upcoming';
    }

    return { ...tier, status };
  });
}

export function generateWalletHistory(
  project: ActiveProject,
  currentBalance: number,
): ChartPoint[] {
  const seed = hashSeed(project.id + project.symbol);
  const days = 14;
  const points: ChartPoint[] = [];

  for (let i = 0; i < days; i++) {
    const progress = (i + 1) / days;
    const noise = ((seed + i * 17) % 11) - 5;
    const balance = Math.max(0, Math.round(currentBalance * progress * (0.85 + noise * 0.02)));
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    points.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: balance,
    });
  }

  points[points.length - 1].value = currentBalance;
  return points;
}

export function generatePriceHistory(project: ActiveProject): ChartPoint[] {
  const seed = hashSeed(project.symbol);
  const endPrice = parseFloat(project.price.replace(/[$,]/g, ''));
  const startPrice = endPrice / (1 + project.change24h / 100);
  const hours = 24;
  const points: ChartPoint[] = [];

  for (let i = 0; i < hours; i++) {
    const t = i / (hours - 1);
    const wave = Math.sin((i + seed) * 0.7) * 0.04;
    const price = startPrice + (endPrice - startPrice) * t + startPrice * wave;
    points.push({
      label: i % 6 === 0 ? `${24 - i}h` : '',
      value: Math.max(price, endPrice * 0.5),
    });
  }

  points[points.length - 1].value = endPrice;
  return points;
}

export function parseDollar(value: string): number {
  return parseFloat(value.replace(/[$,]/g, ''));
}
