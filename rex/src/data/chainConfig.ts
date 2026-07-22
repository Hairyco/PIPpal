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
 * Mode A — creator keeps the creator/trader pool cut.
 * Mode B — cut is auto-swept to trader cashback vault.
 * Neither mode blocks bonding-curve → Raydium migration or V1→V2 CTO relaunch.
 */
export type CreatorFeeMode = 'creator' | 'traders';

export const CREATOR_FEE_MODES: {
  id: CreatorFeeMode;
  title: string;
  subtitle: string;
  destination: string;
  migration: string;
  useCase: string;
}[] = [
  {
    id: 'creator',
    title: 'Keep creator fees',
    subtitle: 'Mode A · Creator fee',
    destination: 'Creator / deployer wallet (withdraw anytime)',
    migration: 'Raydium graduation + V1→V2 CTO path available',
    useCase: 'Active teams, narratives, long-term CTO potential',
  },
  {
    id: 'traders',
    title: 'Split with traders',
    subtitle: 'Mode B · Automated cashback',
    destination: 'Trader volume vault — rebates to traders',
    migration: 'Raydium graduation + V1→V2 CTO path available',
    useCase: 'High-frequency / sniper / PVP volume coins',
  },
];

/**
 * Abandonment trigger — revoke creator cut only (not all trade fees).
 * If the creator wallet holds under 10% of initial allocation (dumped 90%+),
 * the creator/trader pool share is diverted away from the dumped wallet.
 * Platform + marketing fees keep collecting so volume and recovery spend continue.
 */
export const CREATOR_MIN_HOLD_PCT = 10;
export const CREATOR_DUMP_TRIGGER_PCT = 90;
/** Where the revoked creator cut is redirected after abandonment. */
export type CreatorFeeRedirect = 'marketing' | 'traders';
export const CREATOR_FEE_REDIRECT_DEFAULT: CreatorFeeRedirect = 'marketing';

export const ABANDONMENT_RULE = {
  title: 'Abandonment trigger',
  thresholdLabel: `Creator holds under ${CREATOR_MIN_HOLD_PCT}% (dumped ${CREATOR_DUMP_TRIGGER_PCT}%+)`,
  action:
    'Creator fee cut is permanently revoked for that wallet — total trade tax stays on. Rex platform fee and marketing wallet keep collecting.',
  redirectMarketing:
    'Option A — revoked cut boosts the marketing wallet (e.g. 0.40% → 0.60% at launch) to fund community recovery.',
  redirectTraders:
    'Option B — revoked cut routes into the trader volume / cashback pool.',
  contrast:
    'Unlike Pump.fun (dev keeps collecting until a manual fee-key change), Rex revokes the dump wallet’s cut on-chain automatically.',
} as const;

export const FEE_GUIDELINES = [
  'Dynamic tiers: total trade tax scales down with market cap; marketing never turns off.',
  'Mode A / Mode B is locked at deploy — keep creator fees or auto-cashback traders.',
  `Abandonment: if the creator dumps ${CREATOR_DUMP_TRIGGER_PCT}%+ of holdings, only their fee cut is revoked — platform and marketing fees continue.`,
  'Revoked creator cut redirects to marketing (default) or the trader rebate pool — not to the dumped wallet.',
] as const;

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
