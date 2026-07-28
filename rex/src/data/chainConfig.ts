/** On-chain fee constants — keep in sync with rex-contracts/programs/rex-mvp/src/constants.rs */

export const BPS_DENOMINATOR = 10_000;

/** Launch-phase defaults (under $100k mcap) — used when no tier is resolved yet. */
export const PLATFORM_FEE_BPS = 35;
export const CREATOR_FEE_BPS = 20;
export const MARKETING_FEE_BPS = 40;
export const TRADE_FEE_BPS = PLATFORM_FEE_BPS + CREATOR_FEE_BPS + MARKETING_FEE_BPS;

export const TRADE_FEE_LABEL =
  '0.40%–0.95% dynamic (marketing + creator/trader pool + CTOgo)';

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

/** Marketing vault auto-spend threshold (USD). */
export const MARKETING_AUTO_SPEND_USD = 500;
/** Hours of $0 volume before an under-threshold vault is swept. */
export const MARKETING_INACTIVITY_HOURS = 72;
/** Days after a Rex V1 mint without Native V2 CTO before reserve funds go to treasury. */
export const MARKETING_V2_DEADLINE_DAYS = 30;

export const FEE_GUIDELINES = [
  'Dynamic tiers: total trade tax scales down with market cap; marketing never turns off.',
  'Mode A / Mode B is locked at deploy — keep creator fees or auto-cashback traders.',
  `Abandonment: if the creator dumps ${CREATOR_DUMP_TRIGGER_PCT}%+ of holdings, only their fee cut is revoked — platform and marketing fees continue.`,
  'Revoked creator cut redirects to marketing (default) or the trader rebate pool — not to the dumped wallet.',
  'After Raydium graduation, the same fee schedule still applies — migration does not turn off tax.',
  'Graduation is Raydium-first. A 2 SOL Rex migration protocol fee plus ~0.20 SOL Raydium pool creation come out of curve SOL; remaining curve SOL + tokens seed the Raydium pool and LP is burned/locked (Pump-style locked liquidity — required).',
  `Marketing vault: at $${MARKETING_AUTO_SPEND_USD} auto-spend fires; under $${MARKETING_AUTO_SPEND_USD} with $0 volume for ${MARKETING_INACTIVITY_HOURS}h sweeps to the Rex CTO Reserve (restored 100% on Native V2 migration). No V2 within ${MARKETING_V2_DEADLINE_DAYS} days of a Rex V1 mint → funds go to the Rex treasury.`,
] as const;

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

/**
 * Product decision: graduate bonding-curve coins to Raydium for discovery
 * (Jupiter / DexScreener / bots). Do not build a private CTOgo AMM until
 * organic volume makes fee control worth more than aggregator visibility.
 */
export const GRADUATION_POLICY = {
  title: 'Raydium-first graduation',
  summary:
    'Coins graduate from the CTOgo bonding curve to a Raydium pool. We are not building a private CTOgo DEX yet — Raydium keeps coins visible on Jupiter, DexScreener, and Solana routers.',
  why:
    'For a standalone CTO platform, post-graduate discovery matters more than owning the AMM. Pump.fun built PumpSwap after it already owned the attention funnel; CTOgo does not.',
  engineeringPriority:
    'Ship migrate_to_raydium that (1) takes the 2 SOL Rex migration fee, (2) pays Raydium create fee, (3) seeds the pool with remaining curve SOL + tokens, (4) burns LP, (5) keeps post-migration fee hooks — before any custom AMM.',
  revisitWhen: [
    'Steady graduating volume (not a handful of coins)',
    'Most volume already happens on CTOgo UI rather than Jupiter',
    'Fee leakage on Raydium is material versus build and audit cost',
    'Custom pools can still be indexed by DexScreener / Jupiter',
  ],
} as const;

/**
 * One-time migrate fee — required to create the Raydium CPMM pool.
 * Without this, graduation fails: Raydium charges ~0.15 SOL create-pool fee + rent.
 * Paid from bonding-curve SOL reserves at migrate — pass-through only. CTOgo's own
 * migration revenue is REX_MIGRATION_PROTOCOL_FEE_SOL below, charged separately.
 * Source: https://docs.raydium.io/reference/fee-comparison · protocol-fees
 */
export const RAYDIUM_CREATE_POOL_FEE_SOL = 0.15;
/** Account rent + priority-fee buffer on top of Raydium's create-pool fee. */
export const RAYDIUM_MIGRATE_RENT_BUFFER_SOL = 0.05;
/** Total reserved from curve at graduate (~0.20 SOL typical). */
export const MIGRATION_FEE_SOL =
  RAYDIUM_CREATE_POOL_FEE_SOL + RAYDIUM_MIGRATE_RENT_BUFFER_SOL;
/** Hard ceiling if Raydium raises create fee or congestion needs more priority fees. */
export const MIGRATION_FEE_SOL_CAP = 0.25;

/** Rex protocol revenue charged once at graduation, on top of the Raydium pass-through cost. */
export const REX_MIGRATION_PROTOCOL_FEE_SOL = 2;

/** Everything taken out of curve SOL at graduate: Rex fee + Raydium create cost. */
export const TOTAL_MIGRATION_COST_SOL =
  REX_MIGRATION_PROTOCOL_FEE_SOL + MIGRATION_FEE_SOL;

export const MIGRATION_FEE_POLICY = {
  title: 'Migration fees (required)',
  rexProtocolSol: REX_MIGRATION_PROTOCOL_FEE_SOL,
  defaultSol: MIGRATION_FEE_SOL,
  capSol: MIGRATION_FEE_SOL_CAP,
  totalSol: TOTAL_MIGRATION_COST_SOL,
  raydiumCreatePoolSol: RAYDIUM_CREATE_POOL_FEE_SOL,
  rentBufferSol: RAYDIUM_MIGRATE_RENT_BUFFER_SOL,
  summary:
    'Graduation deducts two things from curve SOL: the Rex migration protocol fee (2 SOL, CTOgo revenue) and the Raydium pool-creation cost (~0.20 SOL, pass-through). Everything left plus the remaining tokens seeds the Raydium pool as locked liquidity.',
  contrast:
    'The 2 SOL is CTOgo’s migration charge; the ~0.20 SOL simply pays Raydium to open the pool. The core graduate step (Pump-style) is unchanged: curve liquidity → AMM pool → burn LP.',
  paidFrom: 'Bonding-curve SOL reserves at migrate_to_raydium',
} as const;

/**
 * Core graduation invariant (Pump.fun-style): curve reserves become Raydium liquidity; LP is burned.
 * Without this, graduated coins have no tradable pool and founders could rug LP.
 */
export const GRADUATION_LIQUIDITY_POLICY = {
  title: 'Graduation liquidity (required)',
  summary:
    'When a coin graduates, almost all bonding-curve SOL and the remaining curve tokens move into a Raydium pool as initial liquidity. The LP tokens are burned (or permanently locked) so nobody — founder or CTOgo — can pull that liquidity.',
  steps: [
    `Deduct the Rex migration protocol fee (${REX_MIGRATION_PROTOCOL_FEE_SOL} SOL) to the protocol treasury.`,
    'Pay Raydium create-pool cost (~0.20 SOL) from curve SOL.',
    'Deposit remaining curve SOL + remaining bonding-curve tokens into the new Raydium CPMM pool.',
    'Burn (or permanently lock) 100% of LP tokens received.',
    'Close the bonding curve — further trades go through Raydium / Jupiter.',
  ],
  rules: [
    'Liquidity seed is mandatory — migrate must fail if curve SOL/tokens are not deposited into the pool.',
    'LP burn/lock is mandatory — migrate must fail if LP remains withdrawable by any EOA.',
    `Only the Rex migration fee (${REX_MIGRATION_PROTOCOL_FEE_SOL} SOL) and Raydium create cost (~0.20 SOL) leave the curve; the rest is pool liquidity.`,
    'Same model Pump.fun used: graduate with deep locked liquidity, not an empty chart.',
  ],
} as const;

/** Confirmed product rule: graduation does not end Rex taxation. */
export const POST_MIGRATION_FEES = {
  title: 'After Raydium migration',
  summary:
    'Bonding-curve → Raydium graduation does not disable fees. Platform, marketing, and creator/trader pool cuts keep applying on post-migration volume.',
  mechanism:
    'Enforced via Token-2022 transfer-fee / post-migration AMM hooks so swaps on Raydium still route Rex + marketing + pool cuts to the same PDAs. Engineering priority: migrate_to_raydium (seed pool + burn LP + fee hooks) — not a custom AMM.',
  rules: [
    'Destination is Raydium (Raydium-first) — not a private CTOgo AMM.',
    'Curve SOL + remaining tokens seed the Raydium pool; LP is burned/locked (required).',
    `Rex migration protocol fee is ${REX_MIGRATION_PROTOCOL_FEE_SOL} SOL, taken once at graduate.`,
    'Only ~0.20 SOL of curve SOL pays Raydium create fee; the rest is pool liquidity.',
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
    title: 'LP seed + burn on graduation',
    detail:
      'migrate_to_raydium deposits remaining curve SOL and curve tokens into Raydium, then burns or permanently locks 100% of LP. Instruction fails if liquidity is not seeded or LP remains withdrawable — same core guarantee as Pump.fun graduation.',
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
