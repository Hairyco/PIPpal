import type { ActiveProject } from './categoryContent';

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

export function getProjectDetails(project: ActiveProject): ProjectDetails {
  const seed = hashSeed(project.id + project.symbol);
  const supplier = suppliers[seed % suppliers.length];
  const mcapNum = parseFloat(project.marketCap.replace(/[$KM]/g, '')) *
    (project.marketCap.includes('M') ? 1000 : 1);
  const walletBalance = Math.round(mcapNum * 0.02 * (3 + (seed % 5)));
  const threshold = [2500, 5000, 10000][seed % 3];

  const milestones: Milestone[] = [
    {
      id: 'm1',
      title: 'Bonding curve launch',
      target: '$10K MCAP',
      status: 'completed',
      unlocks: 'Live on Rex curve · DexScreener',
    },
    {
      id: 'm2',
      title: 'Marketing fund threshold',
      target: `$${threshold.toLocaleString()} wallet`,
      status: walletBalance >= threshold ? 'completed' : 'active',
      unlocks: 'First auto ad campaign',
    },
    {
      id: 'm3',
      title: 'Roadmap wallet unlock',
      target: '$100K MCAP',
      status: mcapNum >= 100 ? 'active' : 'upcoming',
      unlocks: 'Supplier build begins',
    },
    {
      id: 'm4',
      title: 'Product MVP',
      target: '$500K MCAP',
      status: 'upcoming',
      unlocks: 'Beta release to holders',
    },
  ];

  const completedPhases = project.verified ? 1 : 0;

  return {
    tagline: `${project.name} is building on Rex with automated marketing and a vetted delivery pipeline.`,
    marketingWallet: {
      balance: `$${walletBalance.toLocaleString()}`,
      threshold: `$${threshold.toLocaleString()}`,
      nextAdSpend: walletBalance >= threshold ? 'DexScreener banner — queued' : `$${(threshold - walletBalance).toLocaleString()} to threshold`,
      taxRate: `${2 + (seed % 3)}% buy / ${2 + (seed % 2)}% sell`,
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
