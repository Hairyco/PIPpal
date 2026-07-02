export interface LaunchingSoonProject {
  id: string;
  name: string;
  symbol: string;
  categoryId: string;
  categoryName: string;
  tagline: string;
  targetLaunchDate: string;
  followerCount: number;
  likeCount: number;
  commentCount: number;
}

export const demoLaunchingSoonProjects: LaunchingSoonProject[] = [
  {
    id: 'pulse-ai',
    name: 'Pulse AI',
    symbol: 'PULSE',
    categoryId: 'ai',
    categoryName: 'AI',
    tagline: 'On-chain agent marketplace for small businesses',
    targetLaunchDate: '2026-07-12',
    followerCount: 842,
    likeCount: 312,
    commentCount: 48,
  },
  {
    id: 'arcade-works',
    name: 'Arcade Works',
    symbol: 'ARCADE',
    categoryId: 'gaming',
    categoryName: 'Gaming',
    tagline: 'Player-owned arcade with token-gated tournaments',
    targetLaunchDate: '2026-07-18',
    followerCount: 1204,
    likeCount: 589,
    commentCount: 91,
  },
  {
    id: 'orbit-pay',
    name: 'Orbit Pay',
    symbol: 'ORBIT',
    categoryId: 'defi',
    categoryName: 'DeFi',
    tagline: 'Cross-chain payments wallet with built-in yield',
    targetLaunchDate: '2026-08-01',
    followerCount: 567,
    likeCount: 203,
    commentCount: 34,
  },
];

export function formatLaunchDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
