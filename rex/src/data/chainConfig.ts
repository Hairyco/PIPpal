/** On-chain fee constants — keep in sync with rex-contracts/programs/rex-mvp/src/constants.rs */

export const BPS_DENOMINATOR = 10_000;

/** Launch-phase defaults (under $100k mcap) — used when no tier is resolved yet. */
export const PLATFORM_FEE_BPS = 35;
export const CREATOR_FEE_BPS = 20;
export const MARKETING_FEE_BPS = 40;
export const TRADE_FEE_BPS = PLATFORM_FEE_BPS + CREATOR_FEE_BPS + MARKETING_FEE_BPS;

export const TRADE_FEE_LABEL =
  '0.40%–0.95% dynamic (marketing + creator/trader pool + Rex)';

export type FeeTierId = 'launch' | 'growth' | 'scale';

export type FeeTier = {
  id: FeeTierId;
  label: string;
  marketCap: string;
  marketingBps: number;
  creatorPoolBps: number;
  platformBps: number;
};

/** Dynamic per-trade fee schedule from the final CTO launchpad spec. */
export const FEE_TIERS: FeeTier[] = [
  {
    id: 'launch',
    label: 'Launch',
    marketCap: 'Under $100k',
    marketingBps: 40,
    creatorPoolBps: 20,
    platformBps: 35,
  },
  {
    id: 'growth',
    label: 'Growth',
    marketCap: '$100k – $500k',
    marketingBps: 25,
    creatorPoolBps: 15,
    platformBps: 30,
  },
  {
    id: 'scale',
    label: 'Scale',
    marketCap: 'Over $500k',
    marketingBps: 15,
    creatorPoolBps: 5,
    platformBps: 20,
  },
];

export function totalFeeBps(tier: FeeTier): number {
  return tier.marketingBps + tier.creatorPoolBps + tier.platformBps;
}

export function formatBpsPercent(bps: number): string {
  const pct = bps / 100;
  const text = pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(2).replace(/0$/, '');
  return `${text}%`;
}

/**
 * Irreversible on-chain toggle at deployment.
 * Mode A — creator keeps the creator/trader pool cut (CTO migration enabled).
 * Mode B — cut is auto-swept to trader cashback vault (CTO migration disabled).
 */
export type CreatorFeeMode = 'creator' | 'traders';

export const CREATOR_FEE_MODES: {
  id: CreatorFeeMode;
  title: string;
  subtitle: string;
  destination: string;
  ctoMigration: string;
  useCase: string;
}[] = [
  {
    id: 'creator',
    title: 'Keep creator fees',
    subtitle: 'Mode A · Creator fee',
    destination: 'Creator / deployer wallet (withdraw anytime)',
    ctoMigration: 'V1→V2 CTO migration enabled',
    useCase: 'Active teams, narratives, long-term CTO potential',
  },
  {
    id: 'traders',
    title: 'Split with traders',
    subtitle: 'Mode B · Automated cashback',
    destination: 'Trader volume vault — rebates to traders',
    ctoMigration: 'CTO migration disabled',
    useCase: 'High-frequency / sniper / PVP volume coins',
  },
];

export function splitTradeFeesLamports(
  grossLamports: number,
  tier: FeeTier = FEE_TIERS[0],
): {
  platform: number;
  creatorPool: number;
  marketing: number;
  net: number;
} {
  const platform = Math.floor((grossLamports * tier.platformBps) / BPS_DENOMINATOR);
  const creatorPool = Math.floor((grossLamports * tier.creatorPoolBps) / BPS_DENOMINATOR);
  const marketing = Math.floor((grossLamports * tier.marketingBps) / BPS_DENOMINATOR);
  const net = grossLamports - platform - creatorPool - marketing;
  return { platform, creatorPool, marketing, net };
}

/** Placeholder — replace after `anchor deploy` */
export const REX_MVP_PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
