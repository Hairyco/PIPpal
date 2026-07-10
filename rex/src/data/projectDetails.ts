import type { ActiveProject } from './categoryContent';
import { TRADE_FEE_LABEL } from './chainConfig';

export interface Milestone {
  id: string;
  title: string;
  target: string;
  status: 'completed' | 'active' | 'upcoming';
  unlocks: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  description: string;
  timeline: string;
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface TokenomicsSlice {
  label: string;
  percent: number;
}

export interface InvestorPerk {
  title: string;
  description: string;
  premium: boolean;
}

export interface ProjectSupplier {
  name: string;
  specialty: string;
  vetted: boolean;
  status: 'assigned' | 'pending' | 'open';
}

export interface ProjectDetails {
  tagline: string;
  /** Estimated full exit price — token, product, Rex listing, and marketing assets. */
  exitValuation: string;
  marketingWallet: {
    balance: string;
    threshold: string;
    nextAdSpend: string;
    taxRate: string;
    lifetimeSpent: string;
  };
  milestones: Milestone[];
  roadmap: RoadmapPhase[];
  tokenomics: TokenomicsSlice[];
  supplier: ProjectSupplier;
  investorPerks: InvestorPerk[];
  claimed: boolean;
}

const suppliers = [
  { name: 'Pixel Forge Studios', specialty: 'Mobile games & Web3 apps' },
  { name: 'Nova Labs', specialty: 'DeFi protocols & dashboards' },
  { name: 'Arcade Works', specialty: 'Meme games & social apps' },
  { name: 'Stackline Agency', specialty: 'Full-stack product teams' },
  { name: 'Vertex Games', specialty: 'Unity & Unreal game dev' },
];

function hashSeed(str: string): number {
  return str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function parseAgeDays(age: string): number {
  const match = age.match(/^(\d+)d$/);
  return match ? parseInt(match[1], 10) : 7;
}

const MILESTONE_TEMPLATES: Pick<Milestone, 'title' | 'target' | 'unlocks'>[] = [
  { title: 'Bonding curve launch', target: '$10K MCAP', unlocks: 'Live on Rex curve · DexScreener' },
  { title: 'Marketing fund threshold', target: 'Wallet threshold', unlocks: 'First auto ad campaign' },
  { title: 'Community channels live', target: '1K holders', unlocks: 'Discord · Telegram · X' },
  { title: 'Roadmap wallet unlock', target: '$100K MCAP', unlocks: 'Supplier build begins' },
  { title: 'Supplier assigned', target: 'Vetted studio', unlocks: 'Kickoff & spec locked' },
  { title: 'Wireframes approved', target: 'Design sign-off', unlocks: 'UI build starts' },
  { title: 'Alpha prototype', target: 'Internal demo', unlocks: 'Stakeholder review' },
  { title: 'Beta release', target: '$500K MCAP', unlocks: 'Beta release to holders' },
  { title: 'Marketing wave 2', target: 'Wallet refill', unlocks: 'Paid user acquisition' },
  { title: 'Public launch', target: '$1M MCAP', unlocks: 'Product goes live' },
  { title: 'Revenue milestone', target: 'First revenue', unlocks: 'Holder profit share' },
  { title: 'Scale & integrations', target: 'Partnerships', unlocks: 'API & ecosystem' },
];

function getMilestoneCount(mcapK: number, seed: number): number {
  if (mcapK >= 500_000) return 10 + (seed % 3);
  if (mcapK >= 50_000) return 8 + (seed % 3);
  if (mcapK >= 5_000) return 6 + (seed % 3);
  if (mcapK >= 500) return 4 + (seed % 2);
  return 4;
}

function getCompletedMilestoneCount(
  total: number,
  mcapK: number,
  ageDays: number,
  seed: number,
): number {
  let done: number;
  if (mcapK >= 500_000) done = 6 + (seed % 4);
  else if (mcapK >= 50_000) done = 4 + (seed % 4);
  else if (mcapK >= 5_000) done = 3 + (seed % 3);
  else if (mcapK >= 500) done = 2 + (seed % 2);
  else done = 1 + (seed % 2);

  if (ageDays >= 30) done += 1;
  if (ageDays >= 60) done += 1;
  if (ageDays >= 90) done += 1;

  return Math.min(total - 1, Math.max(1, done));
}

function buildMilestones(
  project: ActiveProject,
  seed: number,
  threshold: number,
): Milestone[] {
  const mcapK = parseMarketCapK(project.marketCap);
  const ageDays = parseAgeDays(project.age);
  const total = getMilestoneCount(mcapK, seed);
  const completed = getCompletedMilestoneCount(total, mcapK, ageDays, seed);

  return Array.from({ length: total }, (_, i) => {
    const template = MILESTONE_TEMPLATES[i % MILESTONE_TEMPLATES.length];
    let status: Milestone['status'];
    if (i < completed) status = 'completed';
    else if (i === completed) status = 'active';
    else status = 'upcoming';

    const target =
      template.title === 'Marketing fund threshold'
        ? `$${threshold.toLocaleString()} wallet`
        : template.target;

    return {
      id: `m${i + 1}`,
      title: template.title,
      target,
      status,
      unlocks: template.unlocks,
    };
  });
}

/** Market cap normalized to thousands (e.g. $1M → 1000, $1.2B → 1_200_000). */
export function parseMarketCapK(marketCap: string): number {
  const num = parseFloat(marketCap.replace(/[$,]/g, ''));
  if (marketCap.includes('B')) return num * 1_000_000;
  if (marketCap.includes('M')) return num * 1_000;
  if (marketCap.includes('K')) return num;
  return num;
}

export function formatCompactDollar(amount: number): string {
  if (amount >= 1_000_000_000) {
    const b = amount / 1_000_000_000;
    return `$${b >= 10 ? Math.round(b) : b.toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 10_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

/** Exit marketplace valuation — MCAP + product assets + marketing wallet. */
function computeExitValuation(
  project: ActiveProject,
  walletBalance: number,
  seed: number,
): string {
  const mcapK = parseMarketCapK(project.marketCap);
  const mcapDollars = mcapK * 1000;
  const ageDays = parseAgeDays(project.age);
  const productAssets = 150_000 + (seed % 100) * 8_000 + ageDays * 2_000;

  let total: number;
  if (mcapK >= 50_000) {
    const premium = 1.08 + (seed % 11) / 100;
    total = mcapDollars * premium + walletBalance;
  } else if (mcapK >= 1_000) {
    total = mcapDollars * 0.55 + walletBalance + productAssets * 3;
  } else {
    total = walletBalance * 4 + productAssets + mcapDollars * 0.35;
  }

  return formatCompactDollar(total);
}

export function getProjectDetails(project: ActiveProject): ProjectDetails {
  const seed = hashSeed(project.id + project.symbol);
  const supplier = suppliers[seed % suppliers.length];
  const mcapNum = parseMarketCapK(project.marketCap);
  const walletBalance = Math.round(mcapNum * 0.02 * (3 + (seed % 5)));
  const threshold = [2500, 5000, 10000][seed % 3];

  const milestones = buildMilestones(project, seed, threshold);

  const completedPhases = project.verified ? 1 : 0;

  return {
    tagline: `${project.name} is building on Rex with automated marketing and a vetted delivery pipeline.`,
    exitValuation: computeExitValuation(project, walletBalance, seed),
    marketingWallet: {
      balance: `$${walletBalance.toLocaleString()}`,
      threshold: `$${threshold.toLocaleString()}`,
      nextAdSpend: walletBalance >= threshold ? 'DexScreener banner — queued' : `$${(threshold - walletBalance).toLocaleString()} to threshold`,
      taxRate: TRADE_FEE_LABEL,
      lifetimeSpent: `$${Math.round(walletBalance * 0.4).toLocaleString()}`,
    },
    milestones,
    roadmap: [
      {
        phase: 'Phase 1',
        title: 'Bonding curve launch & community',
        description: 'Fair launch on the Rex bonding curve — mint on buy, burn on sell, community channels live.',
        timeline: 'Week 1–2',
        status: 'completed',
      },
      {
        phase: 'Phase 2',
        title: 'Automated marketing engine',
        description: 'Curve trading tax fills marketing wallet; ads auto-purchase at threshold.',
        timeline: 'Week 3–4',
        status: completedPhases >= 1 ? 'in_progress' : 'upcoming',
      },
      {
        phase: 'Phase 3',
        title: 'Supplier build & MVP',
        description: `Vetted studio ${supplier.name} delivers the core product.`,
        timeline: 'Month 2–3',
        status: 'upcoming',
      },
      {
        phase: 'Phase 4',
        title: 'Revenue & holder perks',
        description: 'Product goes live; profit-share and perks activate for investors.',
        timeline: 'Month 4+',
        status: 'upcoming',
      },
    ],
    tokenomics: [
      { label: 'Marketing wallet', percent: 3 + (seed % 2) },
      { label: 'Roadmap / build fund', percent: 5 },
      { label: 'Bonding curve supply', percent: 85 - (seed % 3) },
      { label: 'Team (locked)', percent: 5 + (seed % 3) },
    ],
    supplier: {
      name: supplier.name,
      specialty: supplier.specialty,
      vetted: true,
      status: project.verified ? (seed % 2 === 0 ? 'assigned' : 'pending') : 'open',
    },
    investorPerks: [
      {
        title: 'Profit share',
        description: '5% of product revenue distributed to top 100 holders monthly.',
        premium: true,
      },
      {
        title: 'Early beta access',
        description: 'Token holders get first access to the MVP before public launch.',
        premium: false,
      },
      {
        title: 'Governance votes',
        description: 'Vote on roadmap priorities and supplier milestone approvals.',
        premium: false,
      },
      ...(seed % 2 === 0
        ? [{
            title: 'NFT holder badge',
            description: 'Exclusive on-chain badge for investors at launch.',
            premium: true,
          }]
        : []),
    ],
    claimed: project.verified,
  };
}

export function getMilestoneProgress(milestones: Milestone[]): { done: number; total: number } {
  const done = milestones.filter((m) => m.status === 'completed').length;
  return { done, total: milestones.length };
}
