/** On-chain fee constants — keep in sync with rex-contracts/programs/rex-mvp/src/constants.rs */

/** Model A: 0.90% total trade fee */

/** 0.35% Rex platform fee on buys and sells (basis points). */
export const PLATFORM_FEE_BPS = 35;

/** 0.15% creator / V2 CTO fee on buys and sells (basis points). */
export const CREATOR_FEE_BPS = 15;

/** 0.40% marketing wallet fee on buys and sells (basis points). */
export const MARKETING_FEE_BPS = 40;

export const TRADE_FEE_BPS = PLATFORM_FEE_BPS + CREATOR_FEE_BPS + MARKETING_FEE_BPS;

export const BPS_DENOMINATOR = 10_000;

export const TRADE_FEE_LABEL =
  '0.9% total (0.35% Rex + 0.15% creator + 0.40% marketing)';

export function splitTradeFeesLamports(grossLamports: number): {
  platform: number;
  creator: number;
  marketing: number;
  net: number;
} {
  const platform = Math.floor((grossLamports * PLATFORM_FEE_BPS) / BPS_DENOMINATOR);
  const creator = Math.floor((grossLamports * CREATOR_FEE_BPS) / BPS_DENOMINATOR);
  const marketing = Math.floor((grossLamports * MARKETING_FEE_BPS) / BPS_DENOMINATOR);
  const net = grossLamports - platform - creator - marketing;
  return { platform, creator, marketing, net };
}

/** Placeholder — replace after `anchor deploy` */
export const REX_MVP_PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
