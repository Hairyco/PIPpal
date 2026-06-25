import { banner } from './marketplaceBanners';

export interface Influencer {
  id: string;
  name: string;
  role: string;
  specialty: string;
  platforms: string[];
  followers: string;
  rating: number;
  campaigns: number;
  avatar: string;
  banner: string;
  yearsExperience: number;
  rate: string;
  available: boolean;
}

export const influencers: Influencer[] = [
  {
    id: 'inf1',
    name: 'Zara Blake',
    role: 'Crypto creator',
    specialty: 'Token launches & Twitter/X threads',
    platforms: ['X', 'YouTube'],
    followers: '142K',
    rating: 4.9,
    campaigns: 34,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
    banner: banner('inf1'),
    yearsExperience: 4,
    rate: 'From $800/post',
    available: true,
  },
  {
    id: 'inf2',
    name: 'Dre Martinez',
    role: 'TikTok growth',
    specialty: 'Viral short-form & meme coin hype',
    platforms: ['TikTok', 'Instagram'],
    followers: '890K',
    rating: 4.8,
    campaigns: 61,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
    banner: banner('inf2'),
    yearsExperience: 5,
    rate: 'From $1.2K/video',
    available: true,
  },
  {
    id: 'inf3',
    name: 'Nina Okoro',
    role: 'YouTube reviewer',
    specialty: 'Deep-dive app & SaaS reviews',
    platforms: ['YouTube', 'Newsletter'],
    followers: '56K',
    rating: 5.0,
    campaigns: 28,
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=256&h=256&fit=crop&crop=faces',
    banner: banner('inf3'),
    yearsExperience: 6,
    rate: 'From $2K/integration',
    available: true,
  },
  {
    id: 'inf4',
    name: 'Kai Rivers',
    role: 'Streamer',
    specialty: 'Live launch events & community AMAs',
    platforms: ['Twitch', 'Discord'],
    followers: '210K',
    rating: 4.7,
    campaigns: 19,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
    banner: banner('inf4'),
    yearsExperience: 3,
    rate: 'From $1.5K/stream',
    available: false,
  },
  {
    id: 'inf5',
    name: 'Lena Park',
    role: 'Instagram lifestyle',
    specialty: 'Brand storytelling & product drops',
    platforms: ['Instagram', 'Pinterest'],
    followers: '320K',
    rating: 4.9,
    campaigns: 45,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
    banner: banner('inf5'),
    yearsExperience: 7,
    rate: 'From $950/post',
    available: true,
  },
  {
    id: 'inf6',
    name: 'Jordan Lee',
    role: 'Podcast host',
    specialty: 'Founder interviews & launch spotlights',
    platforms: ['Spotify', 'Apple Podcasts'],
    followers: '78K',
    rating: 4.8,
    campaigns: 22,
    avatar:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=256&h=256&fit=crop&crop=faces',
    banner: banner('inf6'),
    yearsExperience: 5,
    rate: 'From $600/episode',
    available: true,
  },
];
