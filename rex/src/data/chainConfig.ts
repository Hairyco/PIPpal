/** On-chain fee constants — keep in sync with rex-contracts/programs/rex-mvp/src/state.rs */

/** 1% Rex platform fee on buys and sells (basis points). */
export const PLATFORM_FEE_BPS = 100;

/** 5% marketing wallet fee on buys and sells (basis points). */
export const MARKETING_FEE_BPS = 500;

export const TRADE_FEE_BPS = PLATFORM_FEE_BPS + MARKETING_FEE_BPS;

export const BPS_DENOMINATOR = 10_000;

export const TRADE_FEE_LABEL = '6% total (1% Rex + 5% marketing)';

export function splitTradeFeesLamports(grossLamports: number): {
  platform: number;
  marketing: number;
  net: number;
} {
  const platform = Math.floor((grossLamports * PLATFORM_FEE_BPS) / BPS_DENOMINATOR);
  const marketing = Math.floor((grossLamports * MARKETING_FEE_BPS) / BPS_DENOMINATOR);
  const net = grossLamports - platform - marketing;
  return { platform, marketing, net };
}

/** Placeholder — replace after `anchor deploy` */
export const REX_MVP_PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
