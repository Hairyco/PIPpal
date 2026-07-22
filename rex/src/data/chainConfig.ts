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
  'After Raydium graduation, the same fee schedule still applies — migration does not turn off tax.',
  `Marketing vault: at $${MARKETING_AUTO_SPEND_USD} auto-spend fires; under $${MARKETING_AUTO_SPEND_USD} with $0 volume for ${MARKETING_INACTIVITY_HOURS}h sweeps to the Rex CTO Reserve (restored 100% on Native V2 migration). No V2 within ${MARKETING_V2_DEADLINE_DAYS} days of a Rex V1 mint → funds go to the Rex treasury.`,
] as const;

/** Marketing vault auto-spend threshold (USD). */
export const MARKETING_AUTO_SPEND_USD = 500;
/** Hours of $0 volume before an under-threshold vault is swept. */
export const MARKETING_INACTIVITY_HOURS = 72;
/** Days after a Rex V1 mint without Native V2 CTO before reserve funds go to treasury. */
export const MARKETING_V2_DEADLINE_DAYS = 30;

/**
 * Marketing Vault Inactivity & Sweep Lifecycle.
 * Unspent balances under the auto-spend threshold are not left stranded forever.
 */
export const MARKETING_VAULT_SWEEP_RULE = {
  title: 'Marketing vault inactivity & sweep',
  autoSpendLabel: `Automated threshold · $${MARKETING_AUTO_SPEND_USD}`,
  autoSpend:
    `When a vault accumulates $${MARKETING_AUTO_SPEND_USD}, programmatic spending (ads / trending) fires automatically — even if trading volume starts to slow.`,
  inactivityLabel: `${MARKETING_INACTIVITY_HOURS}-hour inactivity sweep`,
  inactivity:
    `If a token accumulates under $${MARKETING_AUTO_SPEND_USD} and records $0 trading volume for ${MARKETING_INACTIVITY_HOURS} consecutive hours, unspent funds are swept into the Rex Protocol CTO Reserve.`,
  ctoRestorationLabel: 'CTO restoration',
  ctoRestoration:
    'If the community executes a Native V2 CTO migration, Rex’s protocol reserve automatically credits 100% of the swept funds into the fresh V2 marketing vault.',
  v1RestartLabel: 'V1 trading restart (without V2)',
  v1Restart:
    'If trading resumes on the old V1 token without migrating, swept funds remain in the reserve and V1 accumulates fresh marketing fees from new volume.',
  v2DeadlineLabel: `${MARKETING_V2_DEADLINE_DAYS}-day V2 deadline`,
  v2Deadline:
    `If a V1 CTO was minted on Rex and no Native V2 CTO is created within ${MARKETING_V2_DEADLINE_DAYS} days, unspent / reserve funds for that V1 are automatically sent to the Rex protocol treasury.`,
} as const;

/** Confirmed product rule: graduation does not end Rex taxation. */
export const POST_MIGRATION_FEES = {
  title: 'After Raydium migration',
  summary:
    'Bonding-curve → Raydium graduation does not disable fees. Platform, marketing, and creator/trader pool cuts keep applying on post-migration volume.',
  mechanism:
    'Enforced via Token-2022 transfer-fee / post-migration AMM hooks so swaps on Raydium still route Rex + marketing + pool cuts to the same PDAs.',
  rules: [
    'Marketing floor stays on (never 0%) after graduation.',
    'Rex platform cut continues into the protocol treasury.',
    'Mode A / Mode B routing for the pool cut is unchanged by migration.',
    'Abandonment still applies — dumped creators cannot keep collecting after migrate.',
    'No migration instruction may zero, pause, or redirect fees to an attacker wallet.',
  ],
} as const;

/** Required controls so fee continuity cannot be rug-pulled or hacked around. */
export const SECURITY_CONTROLS = [
  {
    id: 'fee-lock',
    title: 'Fee schedule lock',
    detail:
      'Launch/Growth/Scale bps and Mode A/B are set at deploy. No single-key admin path to silently cut marketing or platform fees to zero.',
  },
  {
    id: 'migration-invariant',
    title: 'Migration fee invariant',
    detail:
      'migrate_to_raydium (when shipped) must assert post-migration tax still equals the live tier split. Instruction fails if fee accounts are missing or zeroed.',
  },
  {
    id: 'mint-authority',
    title: 'Mint authority revoke / lock',
    detail:
      'After launch (and again at graduation), mint authority is revoked or held by a non-upgradeable PDA so nobody can inflate supply post-migration.',
  },
  {
    id: 'lp-lock',
    title: 'LP lock / burn on graduation',
    detail:
      'Raydium LP tokens from curve migration are burned or time-locked — founder cannot pull liquidity and dump against taxed holders.',
  },
  {
    id: 'marketing-pda',
    title: 'Marketing vault PDA + whitelist',
    detail:
      'Marketing SOL only leaves via whitelisted supplier disburse under Rex authority — not a free EOA the deployer can drain.',
  },
  {
    id: 'creator-withdraw',
    title: 'Creator withdraw gates',
    detail:
      'Mode A only, founder signer required, abandonment check diverts the cut if holdings < 10%. Mode B never pays the founder vault.',
  },
  {
    id: 'checked-math',
    title: 'Checked fee math',
    detail:
      'All fee splits use checked arithmetic; buy/sell constrain protocol_treasury to the config PDA so fees cannot be redirected mid-tx.',
  },
  {
    id: 'upgrade-hygiene',
    title: 'Upgrade / authority hygiene',
    detail:
      'Program upgrade authority on a multisig or renounced for production; migration and fee config changes require the same hardened authority path.',
  },
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
