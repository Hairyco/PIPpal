/**
 * Direct-pay Rex services (not marketing-wallet disbursements).
 * Founders can buy these separately from launching a CTO.
 */

export type DirectServiceId = 'launch-pack';

export type DirectService = {
  id: DirectServiceId;
  title: string;
  tagline: string;
  /** Fixed SOL price for direct checkout */
  priceSol: number;
  includes: string[];
  excludes: string[];
  available: boolean;
};

/** Bundle 1 — site + creatives + channel callout. DexScreener is sold separately. */
export const LAUNCH_PACK: DirectService = {
  id: 'launch-pack',
  title: 'Launch pack',
  tagline: 'Site, logo, banner, and a Rex channel callout — paid direct in SOL.',
  priceSol: 4,
  includes: [
    'Cloned or simple 1-pager hosted by Rex',
    'Logo clone or upload refinement',
    'Social banner (clone, upload, or generate)',
    'One callout in the Rex master Telegram channel',
    'Change-request form after payment (edit fee TBD)',
  ],
  excludes: ['DexScreener socials / ads (buy separately)', 'CoinGecko CTO fee'],
  available: true,
};

export const directServices: DirectService[] = [LAUNCH_PACK];

export function getDirectService(id: DirectServiceId): DirectService | undefined {
  return directServices.find((s) => s.id === id);
}

export function formatSolPrice(sol: number): string {
  return `${sol} SOL`;
}
