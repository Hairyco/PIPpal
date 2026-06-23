export interface Studio {
  id: string;
  name: string;
  specialty: string;
  projects: number;
  rating: number;
  initials: string;
  color: string;
}

export const studios: Studio[] = [
  {
    id: 'pixel-forge',
    name: 'Pixel Forge Studios',
    specialty: 'Mobile games & Web3 apps',
    projects: 47,
    rating: 4.9,
    initials: 'PF',
    color: '#3b82f6',
  },
  {
    id: 'nova-labs',
    name: 'Nova Labs',
    specialty: 'DeFi protocols & dashboards',
    projects: 32,
    rating: 4.8,
    initials: 'NL',
    color: '#8b5cf6',
  },
  {
    id: 'arcade-works',
    name: 'Arcade Works',
    specialty: 'Meme games & social apps',
    projects: 61,
    rating: 4.9,
    initials: 'AW',
    color: '#06b6d4',
  },
  {
    id: 'chaincraft',
    name: 'ChainCraft Dev',
    specialty: 'Smart contracts & audits',
    projects: 28,
    rating: 4.7,
    initials: 'CC',
    color: '#10b981',
  },
  {
    id: 'orbit-digital',
    name: 'Orbit Digital',
    specialty: 'SaaS & marketplace builds',
    projects: 39,
    rating: 4.8,
    initials: 'OD',
    color: '#f59e0b',
  },
  {
    id: 'vertex-games',
    name: 'Vertex Games',
    specialty: 'Unity & Unreal game dev',
    projects: 54,
    rating: 4.9,
    initials: 'VG',
    color: '#ec4899',
  },
  {
    id: 'stackline',
    name: 'Stackline Agency',
    specialty: 'Full-stack product teams',
    projects: 43,
    rating: 4.8,
    initials: 'SA',
    color: '#6366f1',
  },
  {
    id: 'prism-ui',
    name: 'Prism UI Co.',
    specialty: 'Design systems & frontends',
    projects: 36,
    rating: 4.9,
    initials: 'PU',
    color: '#14b8a6',
  },
];
