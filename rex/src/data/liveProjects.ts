export interface FeaturedLiveProject {
  id: string;
  projectId: string;
  name: string;
  symbol: string;
  category: string;
  categoryId: string;
  marketCap: string;
  change24h: number;
  verified: boolean;
}

export const liveProjects: FeaturedLiveProject[] = [
  {
    id: 'cwh',
    projectId: '1',
    name: 'CatWifHat',
    symbol: 'CWH',
    category: 'Meme Coins',
    categoryId: 'meme-coins',
    marketCap: '$4.2M',
    change24h: 142.5,
    verified: true,
  },
  {
    id: 'fbet',
    projectId: '1',
    name: 'FanBet Pro',
    symbol: 'FBET',
    category: 'Sports',
    categoryId: 'sport',
    marketCap: '$3.4M',
    change24h: 22.8,
    verified: true,
  },
  {
    id: 'fit',
    projectId: '1',
    name: 'FitTrack',
    symbol: 'FIT',
    category: 'Apps',
    categoryId: 'apps',
    marketCap: '$2.6M',
    change24h: 41.2,
    verified: true,
  },
  {
    id: 'strm',
    projectId: '1',
    name: 'StreamVault',
    symbol: 'STRM',
    category: 'Media & Ent',
    categoryId: 'media',
    marketCap: '$2.1M',
    change24h: 34.2,
    verified: true,
  },
  {
    id: 'prex',
    projectId: '2',
    name: 'PepeRex',
    symbol: 'PREX',
    category: 'Meme Coins',
    categoryId: 'meme-coins',
    marketCap: '$1.8M',
    change24h: 67.3,
    verified: true,
  },
  {
    id: 'study',
    projectId: '2',
    name: 'StudyPal',
    symbol: 'STUDY',
    category: 'Apps',
    categoryId: 'apps',
    marketCap: '$1.1M',
    change24h: 19.4,
    verified: true,
  },
  {
    id: 'cpay',
    projectId: '2',
    name: 'CreatorPay',
    symbol: 'CPAY',
    category: 'Media & Ent',
    categoryId: 'media',
    marketCap: '$980K',
    change24h: 18.6,
    verified: true,
  },
  {
    id: 'club',
    projectId: '2',
    name: 'ClubToken FC',
    symbol: 'CLUB',
    category: 'Sports',
    categoryId: 'sport',
    marketCap: '$1.2M',
    change24h: 8.4,
    verified: true,
  },
];
