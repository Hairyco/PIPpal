import type { ActiveProject } from './categoryContent';

export type MilestoneIcon =
  | 'megaphone'
  | 'badge'
  | 'banner'
  | 'display'
  | 'spotlight'
  | 'rocket';

export interface WalletChartMilestone {
  id: string;
  amount: number;
  title: string;
  description: string;
  vendor: 'DexScreener' | 'Coinzilla' | 'DEXTools';
  icon: MilestoneIcon;
  status: 'completed' | 'active' | 'upcoming';
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartMilestoneMarker {
  milestone: WalletChartMilestone;
  pointIndex: number;
  x: number;
  y: number;
}

const WALLET_MILESTONE_TIERS: Omit<WalletChartMilestone, 'status'>[] = [
  {
    id: 'ds-promo',
    amount: 300,
    title: 'DexScreener token promotion',
    description: 'Trending bar placement & social boost on DexScreener',
    vendor: 'DexScreener',
    icon: 'megaphone',
  },
  {
    id: 'ds-enhanced',
    amount: 500,
    title: 'Enhanced token info',
    description: 'Logo, links, and verified info on DexScreener token page',
    vendor: 'DexScreener',
    icon: 'badge',
  },
  {
    id: 'ds-banner',
    amount: 2500,
    title: 'DexScreener banner ad',
    description: 'Homepage banner campaign on DexScreener',
    vendor: 'DexScreener',
    icon: 'banner',
  },
  {
    id: 'cz-display',
    amount: 5000,
    title: 'Coinzilla display campaign',
    description: 'Crypto display ads across Coinzilla publisher network',
    vendor: 'Coinzilla',
    icon: 'display',
  },
  {
    id: 'dx-tools',
    amount: 7500,
    title: 'DEXTools spotlight',
    description: 'Featured placement and pair spotlight on DEXTools',
    vendor: 'DEXTools',
    icon: 'spotlight',
  },
  {
    id: 'multi-push',
    amount: 10000,
    title: 'Multi-platform push',
    description: 'Coordinated burst across DexScreener, Coinzilla & DEXTools',
    vendor: 'DexScreener',
    icon: 'rocket',
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
  const days = 28;
  const points: ChartPoint[] = [];

  const spendTiers = WALLET_MILESTONE_TIERS.filter((t) => t.amount <= currentBalance * 1.1).map(
    (t) => t.amount,
  );

  let balance = Math.max(12, Math.round(currentBalance * 0.04));
  const targetSteps: number[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));

    const dailyTax = Math.round((currentBalance / days) * (0.7 + ((seed + i * 13) % 10) / 20));
    const volatility = (((seed + i * 7) % 9) - 4) * (currentBalance * 0.008);
    balance = Math.max(0, balance + dailyTax + volatility);

    for (const tier of spendTiers) {
      if (balance >= tier && !targetSteps.includes(tier)) {
        targetSteps.push(tier);
        balance = Math.max(tier * 0.12, balance - tier * (0.55 + ((seed + i) % 5) * 0.08));
      }
    }

    if (i === days - 1) balance = currentBalance;

    points.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(Math.min(balance, currentBalance * 1.05)),
    });
  }

  points[points.length - 1].value = currentBalance;

  for (let i = 1; i < points.length; i++) {
    points[i].value = Math.max(points[i].value, points[i - 1].value * 0.82);
  }

  return points;
}

export function getChartMilestoneMarkers(
  history: ChartPoint[],
  milestones: WalletChartMilestone[],
  maxY: number,
  width: number,
  chartHeight: number,
  padding: { top: number; right: number; bottom: number; left: number },
): ChartMilestoneMarker[] {
  const innerW = width - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;
  const markers: ChartMilestoneMarker[] = [];

  for (const milestone of milestones) {
    if (milestone.status === 'upcoming') continue;

    let pointIndex = history.findIndex((p) => p.value >= milestone.amount);
    if (pointIndex === -1 && milestone.status === 'active') {
      pointIndex = history.length - 1;
    }
    if (pointIndex === -1) continue;

    const point = history[pointIndex];
    const x = padding.left + (pointIndex / Math.max(history.length - 1, 1)) * innerW;
    const y = padding.top + innerH - (point.value / maxY) * innerH;

    markers.push({ milestone, pointIndex, x, y });
  }

  return markers;
}

export function generatePriceHistory(project: ActiveProject): ChartPoint[] {
  const seed = hashSeed(project.symbol);
  const endPrice = parseFloat(project.price.replace(/[$,]/g, ''));
  const startPrice = endPrice / (1 + project.change24h / 100);
  const points = 48;
  const history: ChartPoint[] = [];
  let price = startPrice;

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const trend = startPrice + (endPrice - startPrice) * t;
    const wave = Math.sin((i + seed) * 0.55) * endPrice * 0.06;
    const spike = i % 11 === 0 ? endPrice * (((seed + i) % 3) - 1) * 0.03 : 0;
    price = Math.max(endPrice * 0.45, trend + wave + spike);
    history.push({
      label: i % 8 === 0 ? `${48 - i}m` : '',
      value: price,
    });
  }

  history[history.length - 1].value = endPrice;
  return history;
}

export function parseDollar(value: string): number {
  return parseFloat(value.replace(/[$,]/g, ''));
}
