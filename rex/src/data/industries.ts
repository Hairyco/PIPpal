export interface Industry {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  tag: string;
  image: string;
}

export const industries: Industry[] = [
  {
    id: 'meme-coins',
    name: 'Meme Coins',
    description: 'Community-driven tokens with automated marketing engines',
    projectCount: 2847,
    tag: 'Trending',
    image: '/images/industries/meme-coins.png',
  },
  {
    id: 'apps',
    name: 'Apps',
    description: 'Mobile, web, and social apps with real users and revenue',
    projectCount: 892,
    tag: 'High Demand',
    image: '/images/industries/apps.jpg',
  },
  {
    id: 'media',
    name: 'Media & Ent',
    description: 'Content platforms, streaming, and creator economies',
    projectCount: 412,
    tag: 'High Growth',
    image: '/images/industries/media.jpg',
  },
  {
    id: 'sport',
    name: 'Sports',
    description: 'Fan tokens, fantasy leagues, and sports betting apps',
    projectCount: 328,
    tag: 'Popular',
    image: '/images/industries/sports.jpg',
  },
  {
    id: 'aerospace',
    name: 'Aerospace',
    description: 'Space tech, satellite data, and aviation innovation',
    projectCount: 89,
    tag: 'Deep Tech',
    image: '/images/industries/aerospace.jpg',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Play-to-earn, mobile games, and game studios',
    projectCount: 756,
    tag: 'Interactive',
    image: '/images/industries/gaming.jpg',
  },
  {
    id: 'ai-tech',
    name: 'Artificial Intelligence',
    description: 'Machine learning tools and AI-powered products',
    projectCount: 621,
    tag: 'Innovation',
    image: '/images/industries/ai.jpg',
  },
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized finance protocols and yield platforms',
    projectCount: 534,
    tag: 'High Volume',
    image: '/images/industries/defi.jpg',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Streetwear brands, NFT fashion, and digital collectibles',
    projectCount: 198,
    tag: 'Emerging',
    image: '/images/industries/fashion.jpg',
  },
  {
    id: 'music',
    name: 'Music',
    description: 'Artist tokens, label platforms, and music NFTs',
    projectCount: 267,
    tag: 'Creator Economy',
    image: '/images/industries/music.jpg',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Property tokenization and fractional ownership',
    projectCount: 143,
    tag: 'Asset Backed',
    image: '/images/industries/real-estate.jpg',
  },
];
