/** Hybrid feed: native V2 CTOs, external tracked CTOs, and native launches. */

export type ProjectOrigin = 'native_cto' | 'external_cto' | 'native_launch';

/** Launchpads / DEXes we index for the hybrid feed (DexScreener-style filter). */
export type SourceVenue =
  | 'CTOgo'
  | 'PumpSwap'
  | 'Pump.fun'
  | 'Raydium'
  | 'Moonshot'
  | 'LetsBonk';

export type SourceVenueFilter = 'all' | SourceVenue;

/** Platforms shown above the coin board — “All” plus every venue we scan. */
export const SOURCE_VENUE_FILTERS: {
  id: SourceVenueFilter;
  label: string;
  title: string;
  /** Local mark under /images/exchanges — omitted for “All”. */
  logoSrc?: string;
}[] = [
  { id: 'all', label: 'All exchanges', title: 'Coins from every venue we scan' },
  {
    id: 'CTOgo',
    label: 'CTOgo',
    title: 'Native CTOgo curve and graduated coins',
    logoSrc: '/images/exchanges/ctogo.svg',
  },
  {
    id: 'PumpSwap',
    label: 'PumpSwap',
    title: 'Coins trading on PumpSwap',
    logoSrc: '/images/exchanges/pumpswap.png',
  },
  {
    id: 'Pump.fun',
    label: 'Pump.fun',
    title: 'Coins still on the Pump.fun bonding curve',
    logoSrc: '/images/exchanges/pumpfun.png',
  },
  {
    id: 'Raydium',
    label: 'Raydium',
    title: 'Coins trading on Raydium',
    logoSrc: '/images/exchanges/raydium.png',
  },
  {
    id: 'Moonshot',
    label: 'Moonshot',
    title: 'Coins sourced from Moonshot',
    logoSrc: '/images/exchanges/moonshot.png',
  },
  {
    id: 'LetsBonk',
    label: 'LetsBonk',
    title: 'Coins sourced from LetsBonk',
    logoSrc: '/images/exchanges/letsbonk.png',
  },
];

export type FeeModeKind = 'creator' | 'traders';

export type CtoProject = {
  rank: number;
  name: string;
  ticker: string;
  chain: 'SOL';
  category: 'Meme' | 'AI' | 'DeFi';
  stage: 'Forming' | 'Voting' | 'Relaunching' | 'Live';
  /** Where this listing lives in the hybrid feed */
  origin: ProjectOrigin;
  sourceVenue: SourceVenue;
  /** External only — % of supply dumped by original dev */
  devDumpedPct?: number;
  /** Native launches — Mode A / Mode B */
  feeMode?: FeeModeKind;
  community: string;
  votes: number;
  votesToday: number;
  launchInHours: number | null;
  price: string;
  change5m: number | null;
  change30m: number | null;
  change1h: number | null;
  change6h: number | null;
  change24h: number;
  marketCap: string;
  fdv: string;
  volume24h: string;
  txs: string;
  holders: string;
  marketingWallet?: string;
  /** Full Solana address for Solscan (preferred over truncated marketingWallet) */
  marketingWalletAddress?: string;
  marketingBalance?: string;
  nextAdTargetUsd?: number;
  nextAdSpend?: string;
  /** External / pre-migration mint (API-sourced V1 CA) */
  v1Mint?: string;
  /** Quoted liquidity on the V1 venue */
  v1Liquidity?: string;
  mph: number;
  raidsActive: number;
  raidsJoined: string;
  roadmapMilestone: string;
  roadmapDone: number;
  roadmapTotal: number;
  score: number;
  colors: string;
  logo: string;
  verified?: boolean;
  boost?: number;
  promoted?: boolean;
};

export const ORIGIN_META: Record<
  ProjectOrigin,
  {
    short: string;
    label: string;
    emoji: string;
    title: string;
    description: string;
    badgeClass: string;
  }
> = {
  native_cto: {
    short: 'Native V2',
    label: 'Native CTO',
    emoji: '🔥',
    title: 'Native CTO (V2)',
    description: 'Migrated or launched on CTOgo. V1 burned → V2. Creator fees to the community wallet.',
    badgeClass: 'border-orange-400/35 bg-orange-400/15 text-orange-200',
  },
  external_cto: {
    short: 'External',
    label: 'External CTO',
    emoji: '🚨',
    title: 'External CTO (V1 Tracked)',
    description: 'Abandoned coin on another venue. Trade on CTOgo anytime — or Launch Native V2 for a fresh mint with a marketing wallet.',
    badgeClass: 'border-rose-400/40 bg-rose-500/15 text-rose-200',
  },
  native_launch: {
    short: 'Launch',
    label: 'Native Launch',
    emoji: '⚡',
    title: 'Native Launch',
    description: 'Deployed on CTOgo with Mode A or Mode B fees. Dynamic 0.95%→0.40% schedule.',
    badgeClass: 'border-sky-400/35 bg-sky-400/15 text-sky-200',
  },
};

export const MIGRATE_BANNER =
  'Still on another venue? Launch a Native V2 on CTOgo with a marketing wallet built in — and keep discovery here.';

export type HybridFeedTab = 'all' | 'native_cto' | 'external_cto' | 'native_launch';

export const HYBRID_FEED_TABS: {
  id: HybridFeedTab;
  label: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'all',
    label: 'All Tokens',
    title: 'All tokens',
    subtitle: 'Discover new coins & trade with ready made communities',
  },
  {
    id: 'native_cto',
    label: 'Native CTOs',
    title: 'Native CTOs (V2)',
    subtitle: 'Coins on CTOgo with marketing wallets and community fees.',
  },
  {
    id: 'external_cto',
    label: 'External Watch',
    title: 'External CTO Watch',
    subtitle: 'Coins from other venues — tradeable on CTOgo today.',
  },
  {
    id: 'native_launch',
    label: 'New Launches',
    title: 'New Launches',
    subtitle: 'Fresh Mode A & Mode B deployments on CTOgo.',
  },
];

export function matchesHybridTab(project: CtoProject, tab: HybridFeedTab): boolean {
  if (tab === 'all') return true;
  return project.origin === tab;
}

export function matchesSourceVenue(
  project: CtoProject,
  venue: SourceVenueFilter,
): boolean {
  if (venue === 'all') return true;
  return project.sourceVenue === venue;
}

/** Day-one hybrid catalog — fills the board with native + tracked external CTOs. */
export const ctoProjects: CtoProject[] = [
  {
    rank: 1,
    name: 'Moon Pigeon',
    ticker: 'MPEG',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Voting',
    origin: 'native_cto',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '4.8K',
    votes: 3660,
    votesToday: 50,
    launchInHours: 18,
    price: '$0.000421',
    change5m: 1.2,
    change30m: 3.1,
    change1h: 2.4,
    change6h: 9.98,
    change24h: 34.8,
    marketCap: '$842K',
    fdv: '$1.2M',
    volume24h: '$186K',
    txs: '12.4K',
    holders: '8.2K',
    marketingWallet: '7xA2…mPeg',
    marketingBalance: '$482',
    nextAdTargetUsd: 500,
    nextAdSpend: 'Update socials',
    mph: 186,
    raidsActive: 3,
    raidsJoined: '1.2K',
    roadmapMilestone: 'Marketing fund threshold',
    roadmapDone: 3,
    roadmapTotal: 8,
    score: 92,
    colors: 'from-fuchsia-400 to-violet-700',
    logo: '/meme-logos/peponk.png',
    verified: true,
    boost: 50,
  },
  {
    rank: 2,
    name: 'Terminal Frog',
    ticker: 'TFROG',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Forming',
    origin: 'native_cto',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '2.1K',
    votes: 1860,
    votesToday: 36,
    launchInHours: 42,
    price: '$0.000187',
    change5m: -0.3,
    change30m: 0.8,
    change1h: -1.1,
    change6h: 4.2,
    change24h: 22.4,
    marketCap: '$412K',
    fdv: '$690K',
    volume24h: '$94K',
    txs: '6.1K',
    holders: '3.4K',
    marketingWallet: 'Fg9k…frog',
    marketingBalance: '$216',
    nextAdTargetUsd: 300,
    nextAdSpend: 'Update socials',
    mph: 94,
    raidsActive: 2,
    raidsJoined: '840',
    roadmapMilestone: 'Community channels live',
    roadmapDone: 2,
    roadmapTotal: 8,
    score: 87,
    colors: 'from-lime-300 to-emerald-700',
    logo: '/meme-logos/tendies.png',
    verified: true,
    boost: 36,
  },
  {
    rank: 3,
    name: 'Lunar Martian',
    ticker: 'LMARS',
    chain: 'SOL',
    category: 'AI',
    stage: 'Relaunching',
    origin: 'native_cto',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '8.4K',
    votes: 1190,
    votesToday: 25,
    launchInHours: 6,
    price: '$0.001104',
    change5m: 2.1,
    change30m: 1.4,
    change1h: 0.8,
    change6h: -2.4,
    change24h: 18.1,
    marketCap: '$1.1M',
    fdv: '$2.4M',
    volume24h: '$255K',
    txs: '18.9K',
    holders: '14.1K',
    marketingWallet: 'Lm9r…mars',
    marketingBalance: '$624',
    nextAdTargetUsd: 750,
    nextAdSpend: 'Update socials',
    mph: 142,
    raidsActive: 5,
    raidsJoined: '2.4K',
    roadmapMilestone: 'Supplier assigned',
    roadmapDone: 5,
    roadmapTotal: 10,
    score: 79,
    colors: 'from-sky-400 to-blue-700',
    logo: '/meme-logos/lunar-lad.png',
    verified: true,
    boost: 25,
  },
  {
    rank: 4,
    name: 'Degen Hotline',
    ticker: 'CALL',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Voting',
    origin: 'external_cto',
    sourceVenue: 'Pump.fun',
    devDumpedPct: 97,
    community: '1.6K',
    votes: 1400,
    votesToday: 13,
    launchInHours: 24,
    price: '$0.000062',
    change5m: 0.4,
    change30m: null,
    change1h: null,
    change6h: 1.6,
    change24h: 11.6,
    marketCap: '$220K',
    fdv: '$410K',
    volume24h: '$41K',
    txs: '2.8K',
    holders: '1.9K',
    v1Mint: 'CALL7xKp9mN2qR4sT6uV8wX0yZ1aB3cD5eF7gH9jK',
    v1Liquidity: '$38K',
    mph: 61,
    raidsActive: 1,
    raidsJoined: '310',
    roadmapMilestone: 'Bonding curve launch',
    roadmapDone: 1,
    roadmapTotal: 6,
    score: 73,
    colors: 'from-orange-300 to-red-700',
    logo: '/meme-logos/unicorn-fart-dust.png',
    boost: 13,
  },
  {
    rank: 5,
    name: 'Pixel Goblin',
    ticker: 'GOB',
    chain: 'SOL',
    category: 'AI',
    stage: 'Forming',
    origin: 'native_launch',
    sourceVenue: 'CTOgo',
    feeMode: 'traders',
    community: '6.2K',
    votes: 341,
    votesToday: 12,
    launchInHours: 36,
    price: '$0.000891',
    change5m: 3.8,
    change30m: 4.5,
    change1h: 5.2,
    change6h: 12.4,
    change24h: 8.3,
    marketCap: '$560K',
    fdv: '$780K',
    volume24h: '$72K',
    txs: '9.3K',
    holders: '5.6K',
    marketingWallet: 'Gob1…pixl',
    marketingBalance: '$330',
    nextAdTargetUsd: 400,
    nextAdSpend: 'Update socials',
    mph: 118,
    raidsActive: 4,
    raidsJoined: '1.8K',
    roadmapMilestone: 'Roadmap wallet unlock',
    roadmapDone: 4,
    roadmapTotal: 9,
    score: 68,
    colors: 'from-cyan-300 to-teal-700',
    logo: '/meme-logos/wiki-cat.png',
    verified: true,
    boost: 12,
    promoted: true,
  },
  {
    rank: 6,
    name: 'Exit Liquidity',
    ticker: 'EXIT',
    chain: 'SOL',
    category: 'DeFi',
    stage: 'Live',
    origin: 'external_cto',
    sourceVenue: 'Raydium',
    devDumpedPct: 94,
    community: '3.7K',
    votes: 230,
    votesToday: 11,
    launchInHours: null,
    price: '$0.000244',
    change5m: -1.2,
    change30m: -2.0,
    change1h: -3.4,
    change6h: -8.1,
    change24h: -4.2,
    marketCap: '$198K',
    fdv: '$310K',
    volume24h: '$29K',
    txs: '4.2K',
    holders: '2.7K',
    mph: 28,
    raidsActive: 0,
    raidsJoined: '96',
    roadmapMilestone: 'Alpha prototype',
    roadmapDone: 6,
    roadmapTotal: 10,
    score: 61,
    colors: 'from-amber-300 to-orange-700',
    logo: '/meme-logos/robinhood-dog.png',
    boost: 11,
    promoted: true,
  },
  {
    rank: 7,
    name: 'Night Shift',
    ticker: 'NITE',
    chain: 'SOL',
    category: 'DeFi',
    stage: 'Voting',
    origin: 'native_launch',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '980',
    votes: 264,
    votesToday: 9,
    launchInHours: 12,
    price: '$0.000055',
    change5m: 0.6,
    change30m: 0.9,
    change1h: 1.1,
    change6h: null,
    change24h: 6.8,
    marketCap: '$88K',
    fdv: '$140K',
    volume24h: '$18K',
    txs: '1.1K',
    holders: '860',
    marketingWallet: 'Ni7e…shft',
    marketingBalance: '$94',
    nextAdTargetUsd: 150,
    nextAdSpend: 'Update socials',
    mph: 47,
    raidsActive: 2,
    raidsJoined: '420',
    roadmapMilestone: 'Marketing wave 2',
    roadmapDone: 2,
    roadmapTotal: 7,
    score: 58,
    colors: 'from-indigo-300 to-purple-800',
    logo: '/meme-logos/choctopus.png',
    boost: 9,
    promoted: true,
  },
  {
    rank: 8,
    name: 'Rug Survivor',
    ticker: 'SURV',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Forming',
    origin: 'native_cto',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '1.2K',
    votes: 215,
    votesToday: 7,
    launchInHours: 48,
    price: '$0.000019',
    change5m: 0.2,
    change30m: -0.1,
    change1h: -0.4,
    change6h: 3.3,
    change24h: 3.1,
    marketCap: '$64K',
    fdv: '$95K',
    volume24h: '$11K',
    txs: '740',
    holders: '520',
    marketingWallet: 'SuRv…live',
    marketingBalance: '$41',
    nextAdTargetUsd: 100,
    nextAdSpend: 'Update socials',
    mph: 39,
    raidsActive: 1,
    raidsJoined: '188',
    roadmapMilestone: 'Community channels live',
    roadmapDone: 1,
    roadmapTotal: 6,
    score: 54,
    colors: 'from-rose-300 to-pink-700',
    logo: '/meme-logos/batcat.png',
    boost: 7,
    promoted: true,
  },
  {
    rank: 9,
    name: 'Dev Dump Daily',
    ticker: 'DUMP',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Forming',
    origin: 'external_cto',
    sourceVenue: 'PumpSwap',
    devDumpedPct: 99,
    community: '9.1K',
    votes: 890,
    votesToday: 44,
    launchInHours: 8,
    price: '$0.000031',
    change5m: 4.2,
    change30m: 7.1,
    change1h: 11.4,
    change6h: 28.0,
    change24h: 61.2,
    marketCap: '$310K',
    fdv: '$480K',
    volume24h: '$220K',
    txs: '22.1K',
    holders: '11.4K',
    mph: 210,
    raidsActive: 6,
    raidsJoined: '3.1K',
    roadmapMilestone: 'Community vote forming',
    roadmapDone: 0,
    roadmapTotal: 5,
    score: 88,
    colors: 'from-red-400 to-rose-800',
    logo: '/meme-logos/peponk.png',
    boost: 44,
  },
  {
    rank: 10,
    name: 'Ghost Founder',
    ticker: 'GHOST',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Voting',
    origin: 'external_cto',
    sourceVenue: 'Moonshot',
    devDumpedPct: 96,
    community: '5.4K',
    votes: 720,
    votesToday: 28,
    launchInHours: 20,
    price: '$0.000108',
    change5m: 1.1,
    change30m: 2.0,
    change1h: -0.6,
    change6h: 5.4,
    change24h: 19.7,
    marketCap: '$155K',
    fdv: '$240K',
    volume24h: '$67K',
    txs: '5.8K',
    holders: '4.1K',
    mph: 77,
    raidsActive: 3,
    raidsJoined: '980',
    roadmapMilestone: 'Telegram takeover',
    roadmapDone: 1,
    roadmapTotal: 6,
    score: 71,
    colors: 'from-slate-300 to-zinc-700',
    logo: '/meme-logos/batcat.png',
    boost: 28,
  },
  {
    rank: 11,
    name: 'Cabal Watch',
    ticker: 'CABAL',
    chain: 'SOL',
    category: 'DeFi',
    stage: 'Live',
    origin: 'external_cto',
    sourceVenue: 'Raydium',
    devDumpedPct: 92,
    community: '2.8K',
    votes: 410,
    votesToday: 15,
    launchInHours: null,
    price: '$0.000077',
    change5m: -0.8,
    change30m: 0.3,
    change1h: 1.9,
    change6h: -3.2,
    change24h: 9.4,
    marketCap: '$92K',
    fdv: '$140K',
    volume24h: '$24K',
    txs: '1.9K',
    holders: '1.5K',
    mph: 52,
    raidsActive: 2,
    raidsJoined: '410',
    roadmapMilestone: 'DexScreener paid by community',
    roadmapDone: 2,
    roadmapTotal: 7,
    score: 63,
    colors: 'from-violet-300 to-purple-800',
    logo: '/meme-logos/choctopus.png',
    boost: 15,
  },
  {
    rank: 12,
    name: 'Abandoned AI',
    ticker: 'AAI',
    chain: 'SOL',
    category: 'AI',
    stage: 'Forming',
    origin: 'external_cto',
    sourceVenue: 'LetsBonk',
    devDumpedPct: 98,
    community: '3.3K',
    votes: 560,
    votesToday: 31,
    launchInHours: 14,
    price: '$0.000205',
    change5m: 2.6,
    change30m: 5.1,
    change1h: 8.8,
    change6h: 14.2,
    change24h: 41.0,
    marketCap: '$275K',
    fdv: '$400K',
    volume24h: '$110K',
    txs: '8.7K',
    holders: '6.2K',
    mph: 133,
    raidsActive: 4,
    raidsJoined: '1.5K',
    roadmapMilestone: 'CTO wallet proposal',
    roadmapDone: 0,
    roadmapTotal: 5,
    score: 76,
    colors: 'from-cyan-400 to-blue-800',
    logo: '/meme-logos/lunar-lad.png',
    boost: 31,
  },
  {
    rank: 13,
    name: 'Cashback Cat',
    ticker: 'CBACK',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Live',
    origin: 'native_launch',
    sourceVenue: 'CTOgo',
    feeMode: 'traders',
    community: '1.9K',
    votes: 180,
    votesToday: 22,
    launchInHours: null,
    price: '$0.000144',
    change5m: 0.9,
    change30m: 1.4,
    change1h: 2.2,
    change6h: 6.1,
    change24h: 15.5,
    marketCap: '$128K',
    fdv: '$190K',
    volume24h: '$48K',
    txs: '3.6K',
    holders: '2.2K',
    marketingWallet: 'Cb4k…cats',
    marketingBalance: '$188',
    nextAdTargetUsd: 250,
    nextAdSpend: 'Telegram',
    mph: 64,
    raidsActive: 1,
    raidsJoined: '220',
    roadmapMilestone: 'Trader rebate live',
    roadmapDone: 3,
    roadmapTotal: 6,
    score: 66,
    colors: 'from-yellow-300 to-amber-700',
    logo: '/meme-logos/wiki-cat.png',
    verified: true,
    boost: 22,
    promoted: true,
  },
  {
    rank: 14,
    name: 'Mode Alpha',
    ticker: 'MODA',
    chain: 'SOL',
    category: 'DeFi',
    stage: 'Live',
    origin: 'native_launch',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '740',
    votes: 95,
    votesToday: 18,
    launchInHours: null,
    price: '$0.000088',
    change5m: 1.5,
    change30m: 2.8,
    change1h: 3.6,
    change6h: 7.9,
    change24h: 12.1,
    marketCap: '$74K',
    fdv: '$110K',
    volume24h: '$21K',
    txs: '1.4K',
    holders: '910',
    marketingWallet: 'MoDa…alph',
    marketingBalance: '$72',
    nextAdTargetUsd: 150,
    nextAdSpend: 'Update socials',
    mph: 41,
    raidsActive: 0,
    raidsJoined: '64',
    roadmapMilestone: 'Mode A fees live',
    roadmapDone: 2,
    roadmapTotal: 5,
    score: 59,
    colors: 'from-emerald-300 to-teal-800',
    logo: '/meme-logos/tendies.png',
    verified: true,
    boost: 18,
  },
  {
    rank: 15,
    name: 'Raid Rabbit',
    ticker: 'RRBT',
    chain: 'SOL',
    category: 'Meme',
    stage: 'Forming',
    origin: 'native_launch',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '1.1K',
    votes: 140,
    votesToday: 26,
    launchInHours: 4,
    price: '$0.000052',
    change5m: 5.4,
    change30m: 9.2,
    change1h: 12.0,
    change6h: null,
    change24h: 27.8,
    marketCap: '$51K',
    fdv: '$80K',
    volume24h: '$33K',
    txs: '2.1K',
    holders: '680',
    marketingWallet: 'RrBt…raid',
    marketingBalance: '$55',
    nextAdTargetUsd: 100,
    nextAdSpend: 'Telegram',
    mph: 98,
    raidsActive: 5,
    raidsJoined: '760',
    roadmapMilestone: 'Fresh Mode A deploy',
    roadmapDone: 1,
    roadmapTotal: 4,
    score: 70,
    colors: 'from-pink-300 to-fuchsia-800',
    logo: '/meme-logos/unicorn-fart-dust.png',
    boost: 26,
  },
  {
    rank: 16,
    name: 'Burn Bridge',
    ticker: 'BRDG',
    chain: 'SOL',
    category: 'AI',
    stage: 'Relaunching',
    origin: 'native_cto',
    sourceVenue: 'CTOgo',
    feeMode: 'creator',
    community: '4.1K',
    votes: 980,
    votesToday: 19,
    launchInHours: 30,
    price: '$0.000366',
    change5m: 0.7,
    change30m: 1.1,
    change1h: 0.4,
    change6h: 2.9,
    change24h: 7.6,
    marketCap: '$390K',
    fdv: '$520K',
    volume24h: '$58K',
    txs: '4.9K',
    holders: '3.8K',
    marketingWallet: 'BrDg…burn',
    marketingBalance: '$410',
    nextAdTargetUsd: 500,
    nextAdSpend: 'Update socials',
    mph: 71,
    raidsActive: 2,
    raidsJoined: '540',
    roadmapMilestone: 'V1 burn window open',
    roadmapDone: 4,
    roadmapTotal: 8,
    score: 74,
    colors: 'from-orange-400 to-red-800',
    logo: '/meme-logos/robinhood-dog.png',
    verified: true,
    boost: 19,
  },
];

type V1Source = Pick<CtoProject, 'ticker' | 'v1Mint' | 'origin' | 'v1Liquidity' | 'volume24h' | 'name' | 'sourceVenue'>;

function demoAddress(seedKey: string): string {
  const seed = seedKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let out = '';
  let n = seed * 7919 + 104729;
  for (let i = 0; i < 44; i++) {
    n = (n * 1103515245 + 12345) >>> 0;
    out += alphabet[n % alphabet.length];
  }
  return out;
}

/** Deterministic demo V1 mint until live API wiring. Prefer project.v1Mint when set. */
export function resolveV1Mint(project: Pick<V1Source, 'ticker' | 'v1Mint'>): string {
  if (project.v1Mint) return project.v1Mint;
  return demoAddress(`${project.ticker}-v1`);
}

export function resolveV1Liquidity(project: Pick<V1Source, 'v1Liquidity' | 'volume24h' | 'origin'>): string {
  if (project.v1Liquidity) return project.v1Liquidity;
  if (project.origin === 'native_cto') return 'Burned';
  return project.volume24h;
}

export function shortMint(mint: string): string {
  if (mint.length <= 12) return mint;
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

/** Full marketing vault address for explorers. Demo-derived until live PDA wiring. */
export function resolveMarketingWalletAddress(
  project: Pick<CtoProject, 'ticker' | 'marketingWallet' | 'marketingWalletAddress'>,
): string | null {
  if (project.marketingWalletAddress && project.marketingWalletAddress.length >= 32) {
    return project.marketingWalletAddress;
  }
  if (
    project.marketingWallet &&
    !project.marketingWallet.includes('…') &&
    project.marketingWallet.length >= 32
  ) {
    return project.marketingWallet;
  }
  if (!project.marketingWallet) return null;
  return demoAddress(`${project.ticker}-mkt`);
}

export function solscanAccountUrl(address: string): string {
  return `https://solscan.io/account/${address}`;
}

export function launchCtoHref(project: Pick<V1Source, 'name' | 'ticker' | 'v1Mint' | 'origin'>): string {
  const params = new URLSearchParams({
    name: project.name,
    ticker: project.ticker,
    ca: resolveV1Mint(project),
  });
  return `/launch?${params.toString()}`;
}
