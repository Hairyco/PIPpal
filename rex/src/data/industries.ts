import { industryImage, industryIcon } from './industryImages';

export interface Industry {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  tag: string;
  image: string;
  /** Wide header image; falls back to `image` when omitted */
  banner?: string;
  /** Square profile image on category page; falls back to `image` when omitted */
  icon?: string;
}

export const industries: Industry[] = [
  {
    id: 'ai-tech',
    name: 'Artificial Intelligence',
    description: 'Machine learning tools and AI-powered products',
    projectCount: 621,
    tag: 'Innovation',
    image: industryImage('ai-tech', '/images/industries/ai.jpg'),
    icon: industryIcon('ai-tech', '/images/industries/icons/ai-tech.svg'),
  },
  {
    id: 'meme-coins',
    name: 'Meme Coins',
    description: 'Community-driven tokens with automated marketing engines',
    projectCount: 2847,
    tag: 'Trending',
    image: '/images/industries/meme-coins.png',
    icon: industryIcon('meme-coins', '/images/industries/icons/meme-coins.svg'),
  },
  {
    id: 'celebrity-coins',
    name: 'Celebrity Coins',
    description:
      'Fan tokens and parody coins tied to celebrities, influencers, and viral moments — or launched by verified celebrities themselves',
    projectCount: 1243,
    tag: 'Hot',
    image: industryImage('celebrity-coins', '/images/industries/celebrity-coins.jpg'),
    icon: industryIcon('celebrity-coins', '/images/industries/icons/celebrity-coins.svg'),
  },
  {
    id: 'apps',
    name: 'Apps',
    description: 'Mobile, web, and social apps with real users and revenue',
    projectCount: 892,
    tag: 'High Demand',
    image: industryImage('apps', '/images/industries/apps.jpg'),
    icon: industryIcon('apps', '/images/industries/icons/apps.svg'),
  },
  {
    id: 'media',
    name: 'Media & Ent',
    description: 'Content platforms, streaming, and creator economies',
    projectCount: 412,
    tag: 'High Growth',
    image: industryImage('media', '/images/industries/media.jpg'),
    icon: industryIcon('media', '/images/industries/icons/media.svg'),
  },
  {
    id: 'sport',
    name: 'Sports',
    description: 'Fan tokens, fantasy leagues, and sports betting apps',
    projectCount: 328,
    tag: 'Popular',
    image: '/images/industries/sports.jpg',
    icon: industryIcon('sport', '/images/industries/icons/sport.svg'),
  },
  {
    id: 'aerospace',
    name: 'Aerospace',
    description: 'Space tech, satellite data, and aviation innovation',
    projectCount: 89,
    tag: 'Deep Tech',
    image: '/images/industries/aerospace.jpg',
    icon: industryIcon('aerospace', '/images/industries/icons/aerospace.svg'),
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Play-to-earn, mobile games, and game studios',
    projectCount: 756,
    tag: 'Interactive',
    image: '/images/industries/gaming.jpg',
    icon: industryIcon('gaming', '/images/industries/icons/gaming.svg'),
  },
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized finance protocols and yield platforms',
    projectCount: 534,
    tag: 'High Volume',
    image: industryImage('defi', '/images/industries/defi.jpg'),
    icon: industryIcon('defi', '/images/industries/icons/defi.svg'),
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Streetwear brands, NFT fashion, and digital collectibles',
    projectCount: 198,
    tag: 'Emerging',
    image: '/images/industries/fashion.jpg',
    icon: industryIcon('fashion', '/images/industries/icons/fashion.svg'),
  },
  {
    id: 'music',
    name: 'Music',
    description: 'Artist tokens, label platforms, and music NFTs',
    projectCount: 267,
    tag: 'Creator Economy',
    image: '/images/industries/music.jpg',
    icon: industryIcon('music', '/images/industries/icons/music.svg'),
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Property tokenization and fractional ownership',
    projectCount: 143,
    tag: 'Asset Backed',
    image: '/images/industries/real-estate.jpg',
    icon: industryIcon('real-estate', '/images/industries/icons/real-estate.svg'),
  },
];
