import { banner } from './marketplaceBanners';

export interface DevStudio {
  id: string;
  name: string;
  specialty: string;
  projects: number;
  rating: number;
  initials: string;
  color: string;
  tags: string[];
  minBudget: string;
  avatar: string;
  banner: string;
  yearsExperience: number;
}

export const devStudios: DevStudio[] = [
  {
    id: 'pixel-forge',
    name: 'Pixel Forge Studios',
    specialty: 'Mobile games & Web3 apps',
    projects: 47,
    rating: 4.9,
    initials: 'PF',
    color: '#3b82f6',
    tags: ['Mobile', 'Web3', 'Games'],
    minBudget: '$15K',
    avatar:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=256&h=256&fit=crop&crop=faces',
    banner: banner('pixel-forge'),
    yearsExperience: 8,
  },
  {
    id: 'nova-labs',
    name: 'Nova Labs',
    specialty: 'DeFi protocols & dashboards',
    projects: 32,
    rating: 4.8,
    initials: 'NL',
    color: '#8b5cf6',
    tags: ['DeFi', 'Dashboards', 'Smart contracts'],
    minBudget: '$25K',
    avatar:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=256&h=256&fit=crop&crop=faces',
    banner: banner('nova-labs'),
    yearsExperience: 6,
  },
  {
    id: 'stackline',
    name: 'Stackline Agency',
    specialty: 'Full-stack product teams',
    projects: 43,
    rating: 4.8,
    initials: 'SA',
    color: '#6366f1',
    tags: ['Websites', 'SaaS', 'Marketplaces'],
    minBudget: '$10K',
    avatar:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=256&h=256&fit=crop&crop=faces',
    banner: banner('stackline'),
    yearsExperience: 7,
  },
  {
    id: 'arcade-works',
    name: 'Arcade Works',
    specialty: 'Meme games & social apps',
    projects: 61,
    rating: 4.9,
    initials: 'AW',
    color: '#06b6d4',
    tags: ['Games', 'Social', 'Meme'],
    minBudget: '$8K',
    avatar:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=256&h=256&fit=crop&crop=faces',
    banner: banner('arcade-works'),
    yearsExperience: 5,
  },
  {
    id: 'prism-ui',
    name: 'Prism UI Co.',
    specialty: 'Design systems & frontends',
    projects: 36,
    rating: 4.9,
    initials: 'PU',
    color: '#14b8a6',
    tags: ['UI/UX', 'Websites', 'Branding'],
    minBudget: '$5K',
    avatar:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=256&h=256&fit=crop&crop=faces',
    banner: banner('prism-ui'),
    yearsExperience: 4,
  },
  {
    id: 'chaincraft',
    name: 'ChainCraft Dev',
    specialty: 'Smart contracts & audits',
    projects: 28,
    rating: 4.7,
    initials: 'CC',
    color: '#10b981',
    tags: ['Solidity', 'Audits', 'Tokenomics'],
    minBudget: '$12K',
    avatar:
      'https://images.unsplash.com/photo-1519389950473-f47f0d6ba0a9?w=256&h=256&fit=crop&crop=faces',
    banner: banner('chaincraft'),
    yearsExperience: 5,
  },
  {
    id: 'orbit-digital',
    name: 'Orbit Digital',
    specialty: 'SaaS & marketplace builds',
    projects: 39,
    rating: 4.8,
    initials: 'OD',
    color: '#f59e0b',
    tags: ['SaaS', 'Websites', 'APIs'],
    minBudget: '$20K',
    avatar:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=256&h=256&fit=crop&crop=faces',
    banner: banner('orbit-digital'),
    yearsExperience: 6,
  },
  {
    id: 'vertex-games',
    name: 'Vertex Games',
    specialty: 'Unity & Unreal game dev',
    projects: 54,
    rating: 4.9,
    initials: 'VG',
    color: '#ec4899',
    tags: ['Games', '3D', 'Mobile'],
    minBudget: '$30K',
    avatar:
      'https://images.unsplash.com/photo-1556760544-740b53c3aafd?w=256&h=256&fit=crop&crop=faces',
    banner: banner('vertex-games'),
    yearsExperience: 9,
  },
];

export const projectDeliverables = [
  { id: 'website', label: 'Website', description: 'Marketing site, landing pages, or full web app' },
  { id: 'mobile-app', label: 'Mobile app', description: 'iOS & Android native or cross-platform' },
  { id: 'smart-contract', label: 'Smart contract', description: 'Token, staking, or on-chain logic' },
  { id: 'design', label: 'Brand & design', description: 'Logo, UI kit, and visual identity' },
  { id: 'dashboard', label: 'Admin dashboard', description: 'Internal tools and analytics panels' },
  { id: 'api', label: 'Backend & API', description: 'Server, database, and integrations' },
  { id: 'marketing', label: 'Growth & marketing', description: 'Launch campaigns and content' },
] as const;

export type DeliverableId = (typeof projectDeliverables)[number]['id'];
