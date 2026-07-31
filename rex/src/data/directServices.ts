/**
 * Advertise on CTOgo — launch creatives for now (audience first; board boosts later).
 * Pay with SOL directly, or route spend from a marketing wallet when available.
 */

export type DirectServiceId = 'board-boost' | 'launch-pack';

export type DirectService = {
  id: DirectServiceId;
  title: string;
  tagline: string;
  /** Fixed SOL price for direct checkout */
  priceSol: number;
  includes: string[];
  excludes: string[];
  available: boolean;
  /** How founders can pay */
  payOptions: Array<'sol' | 'marketing-wallet'>;
};

/** @deprecated Kept for historical orders only — not offered while we build audience. */
export const BOARD_BOOST: DirectService = {
  id: 'board-boost',
  title: 'Board boost',
  tagline: 'Push your coin up Trending and keep it visible while the community trades.',
  priceSol: 1,
  includes: [
    'Boost weight on the CTOgo board',
    'Lightning badge on your coin',
    'Pay with SOL or your marketing wallet',
  ],
  excludes: ['Off-platform ads (Telegram, Coinzilla, etc.)'],
  available: false,
  payOptions: ['sol', 'marketing-wallet'],
};

/** Creatives + channel callout for launch day. */
export const LAUNCH_PACK: DirectService = {
  id: 'launch-pack',
  title: 'Launch pack',
  tagline: 'Site, logo, banner, and a CTOgo channel callout — paid in SOL.',
  priceSol: 4,
  includes: [
    'Cloned site hosted by CTOgo',
    'Logo clone or upload refinement',
    'Social banner (clone, upload, or generate)',
    'One callout in the CTOgo master Telegram channel',
  ],
  excludes: ['CoinGecko CTO fee', 'Off-platform ads'],
  available: true,
  payOptions: ['sol'],
};

/** Services currently offered on Advertise. */
export const directServices: DirectService[] = [LAUNCH_PACK];

export function getDirectService(id: DirectServiceId): DirectService | undefined {
  if (id === 'board-boost') return BOARD_BOOST;
  return directServices.find((s) => s.id === id);
}

export function formatSolPrice(sol: number): string {
  return `${sol} SOL`;
}
