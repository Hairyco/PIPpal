/**
 * Advertise on CTOgo — board boosts + launch creatives.
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

/** Pin / amplify a coin on the CTOgo board (boosts). */
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
  available: true,
  payOptions: ['sol', 'marketing-wallet'],
};

/** Creatives + channel callout for launch day. */
export const LAUNCH_PACK: DirectService = {
  id: 'launch-pack',
  title: 'Launch pack',
  tagline: 'Site, logo, banner, and a CTOgo channel callout — paid in SOL.',
  priceSol: 4,
  includes: [
    'Cloned or simple 1-pager hosted by CTOgo',
    'Logo clone or upload refinement',
    'Social banner (clone, upload, or generate)',
    'One callout in the CTOgo master Telegram channel',
  ],
  excludes: ['Board boosts (buy separately)', 'CoinGecko CTO fee'],
  available: true,
  payOptions: ['sol'],
};

export const directServices: DirectService[] = [BOARD_BOOST, LAUNCH_PACK];

export function getDirectService(id: DirectServiceId): DirectService | undefined {
  return directServices.find((s) => s.id === id);
}

export function formatSolPrice(sol: number): string {
  return `${sol} SOL`;
}
