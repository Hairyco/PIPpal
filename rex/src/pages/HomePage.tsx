import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Bell,
  ChevronLeft,
  ChevronRight,
  Flame,
  Menu,
  Pin,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy,
  Wallet,
  Zap,
  Clock3,
  TrendingUp,
} from 'lucide-react';
import { ServicesBottomSheet } from '../components/services/ServicesBottomSheet';
import { LightningBundleArt } from '../components/services/LightningBundleArt';
import { ConnectWalletButton } from '../components/ConnectWalletButton';

type Project = {
  rank: number;
  name: string;
  ticker: string;
  chain: 'SOL';
  category: 'Meme' | 'AI' | 'DeFi';
  stage: 'Forming' | 'Voting' | 'Relaunching' | 'Live';
  community: string;
  votes: number;
  votesToday: number;
  /** Hours until scheduled launch; null if already live */
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
  marketingWallet?: string;
  marketingBalance?: string;
  /** USD needed in marketing wallet for the next auto ad buy */
  nextAdTargetUsd?: number;
  /** Short label for next spend (e.g. DexScreener) */
  nextAdSpend?: string;
  /** Telegram messages per hour */
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

const projects: Project[] = [
  { rank: 1, name: 'Moon Pigeon', ticker: 'MPEG', chain: 'SOL', category: 'Meme', stage: 'Voting', community: '4.8K', votes: 3660, votesToday: 50, launchInHours: 18, price: '$0.000421', change5m: 1.2, change30m: 3.1, change1h: 2.4, change6h: 9.98, change24h: 34.8, marketCap: '$842K', fdv: '$1.2M', volume24h: '$186K', marketingWallet: '7xA2…mPeg', marketingBalance: '$482', nextAdTargetUsd: 500, nextAdSpend: 'DexScreener', mph: 186, raidsActive: 3, raidsJoined: '1.2K', roadmapMilestone: 'Marketing fund threshold', roadmapDone: 3, roadmapTotal: 8, score: 92, colors: 'from-fuchsia-400 to-violet-700', logo: '/meme-logos/peponk.png', verified: true, boost: 50 },
  { rank: 2, name: 'Terminal Frog', ticker: 'TFROG', chain: 'SOL', category: 'Meme', stage: 'Forming', community: '2.1K', votes: 1860, votesToday: 36, launchInHours: 42, price: '$0.000187', change5m: -0.3, change30m: 0.8, change1h: -1.1, change6h: 4.2, change24h: 22.4, marketCap: '$412K', fdv: '$690K', volume24h: '$94K', marketingWallet: 'Fg9k…frog', marketingBalance: '$216', nextAdTargetUsd: 300, nextAdSpend: 'DexScreener', mph: 94, raidsActive: 2, raidsJoined: '840', roadmapMilestone: 'Community channels live', roadmapDone: 2, roadmapTotal: 8, score: 87, colors: 'from-lime-300 to-emerald-700', logo: '/meme-logos/tendies.png', verified: true, boost: 36 },
  { rank: 3, name: 'Lunar Martian', ticker: 'LMARS', chain: 'SOL', category: 'AI', stage: 'Relaunching', community: '8.4K', votes: 1190, votesToday: 25, launchInHours: 6, price: '$0.001104', change5m: 2.1, change30m: 1.4, change1h: 0.8, change6h: -2.4, change24h: 18.1, marketCap: '$1.1M', fdv: '$2.4M', volume24h: '$255K', marketingWallet: 'Lm9r…mars', marketingBalance: '$624', nextAdTargetUsd: 750, nextAdSpend: 'DexScreener', mph: 142, raidsActive: 5, raidsJoined: '2.4K', roadmapMilestone: 'Supplier assigned', roadmapDone: 5, roadmapTotal: 10, score: 79, colors: 'from-sky-400 to-blue-700', logo: '/meme-logos/lunar-lad.png', verified: true, boost: 25 },
  { rank: 4, name: 'Degen Hotline', ticker: 'CALL', chain: 'SOL', category: 'Meme', stage: 'Voting', community: '1.6K', votes: 1400, votesToday: 13, launchInHours: 24, price: '$0.000062', change5m: 0.4, change30m: null, change1h: null, change6h: 1.6, change24h: 11.6, marketCap: '$220K', fdv: '$410K', volume24h: '$41K', marketingWallet: 'Ca11…line', marketingBalance: '$148', nextAdTargetUsd: 250, nextAdSpend: 'DexScreener', mph: 61, raidsActive: 1, raidsJoined: '310', roadmapMilestone: 'Bonding curve launch', roadmapDone: 1, roadmapTotal: 6, score: 73, colors: 'from-orange-300 to-red-700', logo: '/meme-logos/unicorn-fart-dust.png', boost: 13 },
  { rank: 5, name: 'Pixel Goblin', ticker: 'GOB', chain: 'SOL', category: 'AI', stage: 'Forming', community: '6.2K', votes: 341, votesToday: 12, launchInHours: 36, price: '$0.000891', change5m: 3.8, change30m: 4.5, change1h: 5.2, change6h: 12.4, change24h: 8.3, marketCap: '$560K', fdv: '$780K', volume24h: '$72K', marketingWallet: 'Gob1…pixl', marketingBalance: '$330', nextAdTargetUsd: 400, nextAdSpend: 'DexScreener', mph: 118, raidsActive: 4, raidsJoined: '1.8K', roadmapMilestone: 'Roadmap wallet unlock', roadmapDone: 4, roadmapTotal: 9, score: 68, colors: 'from-cyan-300 to-teal-700', logo: '/meme-logos/wiki-cat.png', verified: true, boost: 12, promoted: true },
  { rank: 6, name: 'Exit Liquidity', ticker: 'EXIT', chain: 'SOL', category: 'DeFi', stage: 'Live', community: '3.7K', votes: 230, votesToday: 11, launchInHours: null, price: '$0.000244', change5m: -1.2, change30m: -2.0, change1h: -3.4, change6h: -8.1, change24h: -4.2, marketCap: '$198K', fdv: '$310K', volume24h: '$29K', mph: 28, raidsActive: 0, raidsJoined: '96', roadmapMilestone: 'Alpha prototype', roadmapDone: 6, roadmapTotal: 10, score: 61, colors: 'from-amber-300 to-orange-700', logo: '/meme-logos/robinhood-dog.png', boost: 11, promoted: true },
  { rank: 7, name: 'Night Shift', ticker: 'NITE', chain: 'SOL', category: 'DeFi', stage: 'Voting', community: '980', votes: 264, votesToday: 9, launchInHours: 12, price: '$0.000055', change5m: 0.6, change30m: 0.9, change1h: 1.1, change6h: null, change24h: 6.8, marketCap: '$88K', fdv: '$140K', volume24h: '$18K', marketingWallet: 'Ni7e…shft', marketingBalance: '$94', nextAdTargetUsd: 150, nextAdSpend: 'DexScreener', mph: 47, raidsActive: 2, raidsJoined: '420', roadmapMilestone: 'Marketing wave 2', roadmapDone: 2, roadmapTotal: 7, score: 58, colors: 'from-indigo-300 to-purple-800', logo: '/meme-logos/choctopus.png', boost: 9, promoted: true },
  { rank: 8, name: 'Rug Survivor', ticker: 'SURV', chain: 'SOL', category: 'Meme', stage: 'Forming', community: '1.2K', votes: 215, votesToday: 7, launchInHours: 48, price: '$0.000019', change5m: 0.2, change30m: -0.1, change1h: -0.4, change6h: 3.3, change24h: 3.1, marketCap: '$64K', fdv: '$95K', volume24h: '$11K', marketingWallet: 'SuRv…live', marketingBalance: '$41', nextAdTargetUsd: 100, nextAdSpend: 'DexScreener', mph: 39, raidsActive: 1, raidsJoined: '188', roadmapMilestone: 'Community channels live', roadmapDone: 1, roadmapTotal: 6, score: 54, colors: 'from-rose-300 to-pink-700', logo: '/meme-logos/batcat.png', boost: 7, promoted: true },
];

const tickerProjects = projects;
const promotedProjects = projects.filter((project) => project.promoted);
const timeWindows = [
  { id: '5m', label: '5m', title: 'Best movers in the last 5 minutes' },
  { id: '30m', label: '30m', title: 'Best movers in the last 30 minutes' },
  { id: '1h', label: '1h', title: 'Best movers in the last hour' },
  { id: '6h', label: '6h', title: 'Best movers in the last 6 hours' },
  { id: '24h', label: '24h', title: 'Best movers in the last 24 hours' },
] as const;
type TimeWindow = (typeof timeWindows)[number]['id'];

function changeForWindow(project: Project, window: TimeWindow): number | null {
  switch (window) {
    case '5m':
      return project.change5m;
    case '30m':
      return project.change30m;
    case '1h':
      return project.change1h;
    case '6h':
      return project.change6h;
    case '24h':
      return project.change24h;
    default:
      return project.change24h;
  }
}

type PinnedMessage = {
  ticker: string;
  text: string;
  when: string;
  minutesAgo: number;
};

/** Most recent pinned message per Telegram group (one per CTO) */
const pinnedByTicker: Record<string, PinnedMessage> = {
  GOB: { ticker: 'GOB', text: 'Raid starts in 10m — everyone reply with the DexScreener link + CA. No spam bots.', when: '2h ago', minutesAgo: 120 },
  MPEG: { ticker: 'MPEG', text: 'Marketing wallet hit $482. Next spend: DexScreener banner. Vote in poll below.', when: '3h ago', minutesAgo: 180 },
  LMARS: { ticker: 'LMARS', text: 'Pinned: Official CA + Telegram rules. Mods will ban call-group shillers.', when: '5h ago', minutesAgo: 300 },
  SURV: { ticker: 'SURV', text: 'Community takeover vote open until Friday. Bring holders from the old group.', when: '8h ago', minutesAgo: 480 },
  NITE: { ticker: 'NITE', text: 'Tonight’s raid window: 9–11pm UTC. Target list in #raids.', when: '11h ago', minutesAgo: 660 },
  EXIT: { ticker: 'EXIT', text: 'No marketing wallet yet — help us enable one after listing. AMA notes pinned here.', when: '14h ago', minutesAgo: 840 },
  TFROG: { ticker: 'TFROG', text: 'Forming channel rules + CA verification thread. Stick to official links only.', when: '16h ago', minutesAgo: 960 },
  CALL: { ticker: 'CALL', text: 'Hotline raid pack: copy, GIF, and Dex chart. Drop once, don’t spam.', when: '1d ago', minutesAgo: 1440 },
};

type RankingFilter = TimeWindow | 'Pinned';

const rankingModes = [
  { id: 'Trending', label: 'Trending', icon: Flame, title: 'Trending CTOs', subtitle: 'Strongest momentum across Solana community takeovers.' },
  { id: 'New', label: 'New', icon: Sparkles, title: 'New CTOs', subtitle: 'Recently forming takeovers just entering the board.' },
  { id: 'Hot', label: 'Hot', icon: Zap, title: 'Hot CTOs', subtitle: 'Highest raid and messaging activity right now.' },
  { id: 'Gainers', label: 'Gainers', icon: TrendingUp, title: 'Top gainers', subtitle: 'Biggest price movers in the selected time window.' },
] as const;
type RankingMode = (typeof rankingModes)[number]['id'];

const shortcuts = [
  { label: 'Trending', icon: Flame },
  { label: 'Top Today', icon: Clock3 },
  { label: 'Prelaunch', icon: Rocket },
  { label: 'New CTOs', icon: Sparkles },
  { label: 'Top All Time', icon: Trophy },
] as const;
type Shortcut = (typeof shortcuts)[number]['label'];

const shortcutCopy: Record<Shortcut, { title: string; subtitle: string }> = {
  Trending: {
    title: 'Trending CTOs',
    subtitle: 'Solana takeovers with the strongest momentum right now.',
  },
  'Top Today': {
    title: 'Top CTOs Today',
    subtitle: 'Highest-voted Solana community takeovers today.',
  },
  Prelaunch: {
    title: 'Prelaunch CTOs',
    subtitle: 'Forming and voting takeovers before launch — soonest launch first.',
  },
  'Top All Time': {
    title: 'Top CTOs All Time',
    subtitle: 'Highest-voted Solana community takeovers across all time.',
  },
  'New CTOs': {
    title: 'New CTOs',
    subtitle: 'Recently forming Solana takeovers just entering the rankings.',
  },
};

function matchesShortcut(project: Project, shortcut: Shortcut): boolean {
  switch (shortcut) {
    case 'Prelaunch':
      return project.stage !== 'Live' && project.launchInHours != null;
    case 'New CTOs':
      return project.stage === 'Forming';
    default:
      return true;
  }
}

function compareByShortcut(
  a: Project,
  b: Project,
  shortcut: Shortcut,
  mode: RankingMode,
  window: TimeWindow,
): number {
  switch (shortcut) {
    case 'Top Today':
      return b.votesToday - a.votesToday || b.votes - a.votes || b.mph - a.mph;
    case 'Top All Time':
      return b.votes - a.votes || b.votesToday - a.votesToday;
    case 'Prelaunch': {
      const launchA = a.launchInHours ?? Number.POSITIVE_INFINITY;
      const launchB = b.launchInHours ?? Number.POSITIVE_INFINITY;
      if (launchA !== launchB) return launchA - launchB;
      return b.votesToday - a.votesToday || b.votes - a.votes;
    }
    case 'New CTOs': {
      const launchA = a.launchInHours ?? Number.POSITIVE_INFINITY;
      const launchB = b.launchInHours ?? Number.POSITIVE_INFINITY;
      if (launchA !== launchB) return launchA - launchB;
      return b.votesToday - a.votesToday;
    }
    case 'Trending':
    default:
      if (mode === 'New') {
        const stageRank = (stage: Project['stage']) =>
          stage === 'Forming' ? 0 : stage === 'Voting' ? 1 : stage === 'Relaunching' ? 2 : 3;
        const stageDiff = stageRank(a.stage) - stageRank(b.stage);
        if (stageDiff !== 0) return stageDiff;
        const launchA = a.launchInHours ?? Number.POSITIVE_INFINITY;
        const launchB = b.launchInHours ?? Number.POSITIVE_INFINITY;
        if (launchA !== launchB) return launchA - launchB;
        return b.votesToday - a.votesToday;
      }
      if (mode === 'Hot') {
        if (b.mph !== a.mph) return b.mph - a.mph;
        if (b.raidsActive !== a.raidsActive) return b.raidsActive - a.raidsActive;
        return b.votesToday - a.votesToday;
      }
      if (mode === 'Gainers') {
        const changeA = changeForWindow(a, window);
        const changeB = changeForWindow(b, window);
        const scoreA = changeA ?? Number.NEGATIVE_INFINITY;
        const scoreB = changeB ?? Number.NEGATIVE_INFINITY;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.votesToday - a.votesToday || b.mph - a.mph;
      }
      if (b.score !== a.score) return b.score - a.score;
      return b.mph - a.mph;
  }
}

const heroCoins = [
  {
    src: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
    alt: 'SHIB',
    rim: 'from-orange-300 via-orange-500 to-amber-800',
    className: 'left-[4%] top-[4%] z-[1] h-[54px] w-[54px] rotate-[-8deg] sm:h-[62px] sm:w-[62px]',
    float: 'animate-float-a',
  },
  {
    src: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
    alt: 'BONK',
    rim: 'from-rose-300 via-red-500 to-red-900',
    className: 'left-[46%] top-[0%] z-[2] h-[56px] w-[56px] rotate-[10deg] sm:h-[64px] sm:w-[64px]',
    float: 'animate-float-b',
  },
  {
    src: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    alt: 'DOGE',
    rim: 'from-yellow-200 via-amber-400 to-yellow-800',
    className: 'left-[26%] top-[26%] z-[3] h-[58px] w-[58px] rotate-[-2deg] sm:h-[66px] sm:w-[66px]',
    float: 'animate-float-c',
  },
  {
    src: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
    alt: 'PEPE',
    rim: 'from-lime-300 via-emerald-500 to-green-900',
    className: 'left-[2%] top-[46%] z-[5] h-[56px] w-[56px] rotate-[-12deg] sm:h-[64px] sm:w-[64px]',
    float: 'animate-float-b',
  },
  {
    src: 'https://assets.coingecko.com/coins/images/16746/small/PNG_image.png',
    alt: 'FLOKI',
    rim: 'from-white via-zinc-300 to-zinc-600',
    className: 'left-[44%] top-[48%] z-[4] h-[58px] w-[58px] rotate-[8deg] sm:h-[66px] sm:w-[66px]',
    float: 'animate-float-a',
  },
];

function FloatingCoin({
  src,
  rim,
  className,
  float,
  delay,
}: {
  src: string;
  rim: string;
  className: string;
  float: string;
  delay: string;
}) {
  return (
    <div className={`absolute ${className} ${float}`} style={{ animationDelay: delay }}>
      <div className={`h-full w-full rounded-full bg-gradient-to-br ${rim} p-[3px] shadow-[0_12px_24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.4)]`}>
        <div className="h-full w-full overflow-hidden rounded-full bg-[#12141f] p-[2px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
          <img src={src} alt="" className="h-full w-full rounded-full object-cover" loading="eager" />
        </div>
      </div>
    </div>
  );
}

function HeroLogoCollage() {
  return (
    <div className="relative h-[132px] w-[130px] sm:h-[152px] sm:w-[150px]" aria-hidden>
      <div className="pointer-events-none absolute inset-x-[10%] top-[18%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.28),transparent_68%)] blur-md" />
      {heroCoins.map((coin, index) => (
        <FloatingCoin
          key={coin.alt}
          src={coin.src}
          rim={coin.rim}
          className={coin.className}
          float={coin.float}
          delay={`${index * 0.12}s`}
        />
      ))}
      <div className="pointer-events-none absolute -bottom-1 left-1/2 h-12 w-[115%] -translate-x-1/2">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.22),rgba(200,255,61,0.08),transparent_70%)] blur-md" />
        <div className="absolute inset-x-[8%] bottom-0 h-6 animate-pulse rounded-full bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.35),transparent_72%)] blur-lg" />
        <div className="absolute inset-x-[18%] bottom-1 h-4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_75%)] blur-md" />
      </div>
    </div>
  );
}

function HeartbeatTracker() {
  return (
    <svg className="h-5 w-[4.5rem]" viewBox="0 0 84 24" aria-hidden>
      <path
        className="heartbeat-line"
        d="M0 12 H14 L18 12 L22 5 L27 19 L31 9 L35 12 H84"
      />
    </svg>
  );
}

function ElectricBridge() {
  return (
    <div className="electric-bridge pointer-events-none" aria-hidden>
      <svg className="h-[72px] w-3.5 overflow-visible" viewBox="0 0 14 72">
        <path className="electric-bolt" d="M7 2 L4 16 L9 28 L3 42 L10 54 L7 70" />
        <path className="electric-bolt electric-bolt-alt" d="M7 6 L10 20 L5 34 L11 48 L6 62" />
      </svg>
    </div>
  );
}

function parseUsdAmount(balance?: string) {
  if (!balance) return 0;
  const match = balance.replace(/,/g, '').match(/([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

function formatUsd(amount: number) {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return `$${Math.round(amount)}`;
}

function MarketingAdProgress({ project }: { project: Project }) {
  const hasWallet = Boolean(
    project.marketingWallet && project.marketingBalance && project.nextAdTargetUsd,
  );

  if (!hasWallet) {
    return (
      <div className="mt-2.5 flex h-[44px] items-center rounded-lg border border-dashed border-white/[0.08] bg-black/15 px-2">
        <p className="text-[10px] font-medium text-white/30">No marketing wallet</p>
      </div>
    );
  }

  const balance = parseUsdAmount(project.marketingBalance);
  const target = project.nextAdTargetUsd!;
  const pct = Math.min(100, Math.round((balance / target) * 100));
  const ready = balance >= target;
  const spendLabel = project.nextAdSpend ?? 'DexScreener';
  const remaining = Math.max(0, target - balance);

  return (
    <div
      className="mt-2.5 h-[44px] rounded-lg border border-white/[0.06] bg-black/25 px-2 py-1.5"
      title={`Marketing wallet: ${project.marketingBalance} of ${formatUsd(target)} toward ${spendLabel}`}
    >
      <div className="mb-1 flex items-center justify-between gap-1.5">
        <p className="truncate text-[9px] font-semibold text-white/50">
          Marketing wallet
          <span className="font-normal text-white/30">
            {ready ? ` · Ready` : ` · ${formatUsd(remaining)} to ${spendLabel}`}
          </span>
        </p>
        <p className="shrink-0 tabular-nums text-[9px] font-semibold text-white/45">
          {formatUsd(balance)}
          <span className="font-normal text-white/25">/{formatUsd(target)}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={`marketing-fill absolute inset-y-0 left-0 rounded-full ${
              ready
                ? 'bg-[#c8ff3d] shadow-[0_0_10px_rgba(200,255,61,0.4)]'
                : 'bg-gradient-to-r from-[#3b82f6] via-[#7dd3fc] to-[#c8ff3d]'
            }`}
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>

        <span
          className={`relative grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
            ready
              ? 'border-[#c8ff3d]/55 bg-[#c8ff3d]/15'
              : 'border-white/12 bg-[#12141f]'
          }`}
          aria-label={`Next ad spend: ${spendLabel}`}
        >
          <img
            src="/images/partners/dexscreener.ico"
            alt=""
            className="h-3 w-3"
            loading="lazy"
          />
        </span>
      </div>
    </div>
  );
}

const tableCols =
  '28px 36px 180px 68px 72px 64px 56px 64px minmax(110px, 1fr) 72px 64px';
const tableColsPrelaunch =
  '28px 36px 180px 68px 64px 72px 64px 56px 64px minmax(110px, 1fr) 72px 64px';

function ProjectMark({
  project,
  size = 'h-10 w-10',
  rounded = 'rounded-full',
}: {
  project: Project;
  size?: string;
  rounded?: string;
}) {
  return (
    <div className={`${size} shrink-0 overflow-hidden ${rounded} bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}>
      <img
        src={project.logo}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function ChainPill() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/55" title="Solana">
      ◎
    </span>
  );
}

function Pct({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/25">--</span>;
  return (
    <span className={value >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
      {value.toFixed(2)}%
    </span>
  );
}

function formatVotes(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 2).replace(/\.00$/, '')}K`;
  return String(n);
}

function formatLaunchIn(hours: number | null) {
  if (hours == null || hours <= 0) return 'Live';
  return `${hours}h`;
}

const THEME_KEY = 'cto-theme';
type ThemeMode = 'light' | 'dark';

/** Always boot in night mode — wipe any stale light preference */
function forceNightTheme(): ThemeMode {
  try {
    localStorage.setItem(THEME_KEY, 'dark');
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('theme-dark');
    document.documentElement.classList.remove('theme-light');
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.style.backgroundColor = '#000000';
    document.body.style.backgroundColor = '#000000';
  }
  return 'dark';
}

function PromotedRail({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);
  const loop = [...projects, ...projects];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || projects.length === 0) return;

    let frame = 0;
    const speed = 0.6;
    const tick = () => {
      if (!pausedRef.current) {
        offsetRef.current += speed;
        const half = track.scrollWidth / 2;
        if (half > 0 && offsetRef.current >= half) {
          offsetRef.current -= half;
        }
        track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [projects.length]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      className="relative min-w-0 overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onTouchCancel={resume}
    >
      <div
        ref={trackRef}
        className="flex w-max max-w-none items-stretch gap-0 will-change-transform"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        {loop.map((project, index) => (
          <div key={`${project.ticker}-${index}`} className="flex shrink-0 items-stretch">
            {index > 0 ? <ElectricBridge /> : null}
            <article className="group relative flex w-[248px] shrink-0 overflow-hidden rounded-xl">
              <div className="promoted-chase" />
              <div className="gloss-panel relative flex w-full flex-col rounded-xl border border-white/[0.08] p-3 transition group-hover:border-[#c8ff3d]/15">
                <div className="flex items-center gap-2.5">
                  <ProjectMark project={project} size="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold">${project.ticker}</p>
                      <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-[#c8ff3d] text-[8px] font-black text-black">✓</span>
                    </div>
                    <p className="truncate text-[11px] text-white/35">{project.name}</p>
                    <span
                      className="mt-1 flex items-center gap-1 text-[10px] font-medium text-white/45"
                      title={`${project.community} Telegram members`}
                    >
                      <img
                        src="/images/partners/telegram.svg"
                        alt=""
                        className="h-3 w-3"
                        loading="lazy"
                      />
                      {project.community}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold">{project.votes.toLocaleString()}</p>
                    <p className={`text-[10px] font-semibold ${project.change24h >= 0 ? 'text-lime-300' : 'text-rose-400'}`}>
                      {project.change24h >= 0 ? '+' : ''}{project.change24h}%
                    </p>
                  </div>
                  <Star className="h-3.5 w-3.5 shrink-0 text-white/20 group-hover:text-[#c8ff3d]" />
                </div>
                <MarketingAdProgress project={project} />
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const [query, setQuery] = useState('');
  const [activeShortcut, setActiveShortcut] = useState<Shortcut>('Trending');
  const [activeMode, setActiveMode] = useState<RankingMode>('Trending');
  const [activeWindow, setActiveWindow] = useState<RankingFilter>('5m');
  const isPinnedView = activeWindow === 'Pinned';
  const activeTimeWindow: TimeWindow = isPinnedView ? '5m' : activeWindow;
  const shortcutOwnsList =
    activeShortcut === 'Top Today' ||
    activeShortcut === 'Top All Time' ||
    activeShortcut === 'Prelaunch';
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pageSize = 5;

  const searchSuggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = (project: Project) =>
      !normalized ||
      project.name.toLowerCase().includes(normalized) ||
      project.ticker.toLowerCase().includes(normalized);
    const promoted = promotedProjects.filter(matches);
    const rest = projects.filter((project) => !project.promoted && matches(project));
    return { promoted, rest };
  }, [query]);

  const showSearchPanel = searchFocused;

  useLayoutEffect(() => {
    forceNightTheme();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const matchesQuery =
        !normalized ||
        project.name.toLowerCase().includes(normalized) ||
        project.ticker.toLowerCase().includes(normalized);
      return matchesQuery && matchesShortcut(project, activeShortcut);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => compareByShortcut(a, b, activeShortcut, activeMode, activeTimeWindow));

    return sorted.map((project, index) => ({ ...project, rank: index + 1 }));
  }, [query, activeTimeWindow, activeShortcut, activeMode]);

  const pinnedFeed = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects
      .filter((project) => {
        const pin = pinnedByTicker[project.ticker];
        if (!pin) return false;
        if (!normalized) return true;
        return (
          project.name.toLowerCase().includes(normalized) ||
          project.ticker.toLowerCase().includes(normalized) ||
          pin.text.toLowerCase().includes(normalized)
        );
      })
      .map((project) => ({ project, pin: pinnedByTicker[project.ticker] }))
      .sort((a, b) => a.pin.minutesAgo - b.pin.minutesAgo);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedProjects = visibleProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
    setPageInput('');
  }, [query, activeWindow, activeShortcut, activeMode]);

  const goToPage = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    setPage(clamped);
    setPageInput('');
  };

  const submitPageInput = () => {
    const parsed = Number.parseInt(pageInput.trim(), 10);
    if (!Number.isFinite(parsed)) {
      setPageInput('');
      return;
    }
    goToPage(parsed);
  };

  const pageNumbers = useMemo(() => {
    const maxButtons = Math.min(totalPages, 5);
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const sectionCopy = (() => {
    if (isPinnedView) {
      return {
        title: 'Pinned messages',
        subtitle: 'Most recent pinned message from each Telegram group.',
      };
    }
    if (activeShortcut !== 'Trending') {
      return shortcutCopy[activeShortcut];
    }
    const mode = rankingModes.find((tab) => tab.id === activeMode) ?? rankingModes[0];
    if (activeMode === 'Gainers') {
      const windowTab = timeWindows.find((tab) => tab.id === activeWindow);
      return {
        title: mode.title,
        subtitle: `Ranked by ${activeWindow} price change — ${windowTab?.title ?? 'active movers'}.`,
      };
    }
    if (activeMode === 'Trending') return shortcutCopy.Trending;
    return { title: mode.title, subtitle: mode.subtitle };
  })();

  const selectShortcut = (label: Shortcut) => {
    setActiveShortcut(label);
    if (label === 'Trending') setActiveMode('Trending');
    if (label === 'New CTOs') setActiveMode('New');
    if (isPinnedView) setActiveWindow('5m');
    setPage(1);
    setPageInput('');
    requestAnimationFrame(() => {
      document.getElementById('cto-rankings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const selectRankingMode = (mode: RankingMode) => {
    setActiveMode(mode);
    setActiveShortcut(mode === 'New' ? 'New CTOs' : 'Trending');
    if (isPinnedView) setActiveWindow('5m');
    setPage(1);
    setPageInput('');
  };

  const castVote = (ticker: string) => {
    setVoted((prev) => (prev[ticker] ? prev : { ...prev, [ticker]: true }));
  };

  const isPrelaunch = activeShortcut === 'Prelaunch';
  const rankingGridStyle = {
    gridTemplateColumns: isPrelaunch ? tableColsPrelaunch : tableCols,
  } as const;

  const pickSearchResult = (project: Project) => {
    setQuery(project.ticker);
    setSearchFocused(false);
    searchRef.current?.blur();
    requestAnimationFrame(() => {
      document.getElementById('cto-rankings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
      <div className="relative z-[1]">
      <div className="sticky top-0 z-40 bg-black">
      <div className="border-b border-white/[0.06] bg-black">
        <div className="mx-auto flex h-10 max-w-7xl items-center overflow-hidden px-3 sm:px-5">
          <div className="mr-3 flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#c8ff3d]">
            <Flame className="h-3.5 w-3.5 fill-[#c8ff3d]" />
            <span className="hidden sm:inline">Trending</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-max animate-scroll-left-ticker items-center gap-7 text-xs text-white/50">
              {[...tickerProjects, ...tickerProjects].map((project, index) => (
                <span key={`${project.ticker}-${index}`} className="flex items-center gap-2">
                  <span className="text-white/25">#{project.rank}</span>
                  <span className={`h-5 w-5 shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${project.colors} ring-1 ring-white/15`}>
                    <img
                      src={project.logo}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span className="font-semibold text-white/85">${project.ticker}</span>
                  <span className={project.change24h >= 0 ? 'text-lime-300' : 'text-rose-400'}>
                    {project.change24h >= 0 ? '+' : ''}{project.change24h}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <header className="border-b border-white/[0.07] bg-black">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-5">
          <a href="/" className="flex shrink-0 items-center gap-2" aria-label="CTO home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8ff3d] text-[#090b14]">
              <RotateCcw className="h-5 w-5 stroke-[2.6]" />
            </span>
            <div className="hidden sm:block">
              <p className="font-serif text-lg font-bold leading-none tracking-tight">CTO</p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">Community takeover</p>
            </div>
          </a>

          <div className="relative ml-auto min-w-0 flex-1 sm:max-w-md">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setSearchFocused(false), 120);
                }}
                placeholder="Search Solana CTOs"
                aria-keyshortcuts="/"
                aria-expanded={showSearchPanel}
                aria-controls="cto-search-panel"
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.045] pl-9 pr-11 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40"
              />
              {!searchFocused && !query ? (
                <kbd
                  className="pointer-events-none absolute right-2.5 top-1/2 inline-flex h-6 min-w-[1.4rem] -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-white/[0.08] px-1.5 font-sans text-[11px] font-semibold leading-none text-white/55 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]"
                  aria-hidden
                >
                  /
                </kbd>
              ) : null}
            </label>
            {showSearchPanel ? (
              <div
                id="cto-search-panel"
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-white/[0.1] bg-[#050505] shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
              >
                <div className="max-h-[min(70vh,420px)] overflow-y-auto py-2">
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
                    Promoted
                  </p>
                  {searchSuggestions.promoted.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-white/35">No promoted matches</p>
                  ) : (
                    searchSuggestions.promoted.map((project) => (
                      <button
                        key={`promoted-${project.ticker}`}
                        type="button"
                        role="option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => pickSearchResult(project)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-white/[0.05]"
                      >
                        <ProjectMark project={project} size="h-8 w-8" rounded="rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-bold">${project.ticker}</span>
                            <span className="rounded bg-[#c8ff3d]/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#c8ff3d]">
                              Ad
                            </span>
                          </div>
                          <p className="truncate text-[11px] text-white/35">{project.name}</p>
                        </div>
                        <span className={`shrink-0 text-[11px] font-semibold ${project.change24h >= 0 ? 'text-lime-300' : 'text-rose-400'}`}>
                          {project.change24h >= 0 ? '+' : ''}{project.change24h}%
                        </span>
                      </button>
                    ))
                  )}
                  {searchSuggestions.rest.length > 0 ? (
                    <>
                      <div className="my-2 border-t border-white/[0.06]" />
                      <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                        All CTOs
                      </p>
                      {searchSuggestions.rest.map((project) => (
                        <button
                          key={`all-${project.ticker}`}
                          type="button"
                          role="option"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => pickSearchResult(project)}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-white/[0.05]"
                        >
                          <ProjectMark project={project} size="h-8 w-8" rounded="rounded-lg" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">${project.ticker}</p>
                            <p className="truncate text-[11px] text-white/35">{project.name}</p>
                          </div>
                          <span className={`shrink-0 text-[11px] font-semibold ${project.change24h >= 0 ? 'text-lime-300' : 'text-rose-400'}`}>
                            {project.change24h >= 0 ? '+' : ''}{project.change24h}%
                          </span>
                        </button>
                      ))}
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <Link
            to="/launch"
            className="hidden h-10 items-center gap-2 rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] transition hover:bg-[#d7ff70] md:flex"
          >
            <Plus className="h-4 w-4" /> Submit CTO
          </Link>
          <ConnectWalletButton className="shrink-0" />
          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c8ff3d]" aria-hidden />
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-white/60 hover:bg-white/5" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <nav className="border-b border-white/[0.06] bg-black">
        <div className="hide-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-3 sm:px-5">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            const active = activeShortcut === shortcut.label;
            return (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => selectShortcut(shortcut.label)}
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-[#c8ff3d]/30 bg-[#c8ff3d]/10 text-[#d5ff69]'
                    : 'border-white/[0.07] bg-white/[0.025] text-white/55 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {shortcut.label}
              </button>
            );
          })}
        </div>
      </nav>
      </div>

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5">
        <section className="gloss-panel-soft relative overflow-hidden rounded-xl border border-white/[0.1]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(200,255,61,0.12),transparent_42%),radial-gradient(circle_at_88%_28%,rgba(96,165,250,0.14),transparent_44%)]" />
          <div className="pointer-events-none absolute right-2 top-6 z-0 sm:right-4 sm:top-7">
            <HeroLogoCollage />
          </div>
          <div className="relative z-10 px-4 py-4 pr-[7.25rem] sm:max-w-[min(100%,26rem)] sm:px-6 sm:py-5 sm:pr-6 md:max-w-md">
            <h1 className="font-serif text-[1.65rem] font-bold leading-[1.12] tracking-[-0.03em] sm:text-3xl">
              The home of community takeovers
            </h1>
            <div className="mt-4 flex flex-nowrap items-center gap-2 sm:gap-3">
              <Link
                to="/launch"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#c8ff3d] px-3 py-2 text-xs font-semibold text-[#090b14] transition hover:bg-[#d5ff69] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Launch a CTO
              </Link>
              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#2aabee] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3bb5f5] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Telegram bot
              </button>
            </div>
            <p className="mt-2.5 flex w-max max-w-full items-center gap-1.5 whitespace-nowrap text-[10px] font-medium text-[#d5ff69]/90 sm:text-[11px]">
              <Wallet className="h-3.5 w-3.5 shrink-0" />
              Marketing wallets included
            </p>
            <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-white/55">
              <li className="inline-flex items-center gap-1">
                <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#c8ff3d] text-[8px] font-black text-black">✓</span>
                Community owned
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-7 min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-lg font-bold">Promoted CTOs</h2>
              <HeartbeatTracker />
            </div>
            <button type="button" className="text-xs font-semibold text-[#c8ff3d]">Advertise</button>
          </div>
          <PromotedRail projects={promotedProjects} />
        </section>

        <div className="mt-8">
          <section id="cto-rankings" className="min-w-0 scroll-mt-[10.5rem]">
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-bold">{sectionCopy.title}</h2>
              <p className="mt-1 text-xs text-white/35">{sectionCopy.subtitle}</p>
            </div>

            <div className="hide-scrollbar mb-2.5 flex gap-2 overflow-x-auto pb-1">
              {rankingModes.map((mode) => {
                const Icon = mode.icon;
                const active =
                  !isPinnedView &&
                  !shortcutOwnsList &&
                  (activeMode === mode.id ||
                    (mode.id === 'New' && activeShortcut === 'New CTOs'));
                return (
                  <button
                    key={mode.id}
                    type="button"
                    title={mode.subtitle}
                    aria-pressed={active}
                    onClick={() => selectRankingMode(mode.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition [-webkit-tap-highlight-color:transparent] ${
                      active
                        ? 'border border-transparent bg-white text-[#090b14]'
                        : 'border border-white/[0.07] bg-white/[0.025] text-white/55'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#090b14]' : ''}`} />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
              {timeWindows.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  title={tab.title}
                  aria-pressed={activeWindow === tab.id}
                  onClick={() => setActiveWindow(tab.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold transition [-webkit-tap-highlight-color:transparent] ${
                    activeWindow === tab.id
                      ? 'border border-transparent bg-white text-[#090b14]'
                      : 'border border-white/[0.07] bg-white/[0.025] text-white/45'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                title="Most recent pinned message in each Telegram group"
                aria-pressed={isPinnedView}
                onClick={() => setActiveWindow('Pinned')}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition [-webkit-tap-highlight-color:transparent] ${
                  isPinnedView
                    ? 'border border-transparent bg-white text-[#090b14]'
                    : 'border border-white/[0.07] bg-white/[0.025] text-white/45'
                }`}
              >
                <Pin className="h-3 w-3" />
                Pinned
              </button>
              <button type="button" className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-2 text-[11px] text-white/45">
                <SlidersHorizontal className="h-3 w-3" /> Filters
              </button>
            </div>

            {isPinnedView ? (
              <div className="gloss-panel space-y-3 rounded-xl border border-white/[0.1] p-3 sm:p-4">
                <p className="px-1 text-[11px] text-white/40">
                  Most recent pinned message from each Telegram group.
                </p>
                {pinnedFeed.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-white/35">No pinned messages found.</div>
                ) : (
                  pinnedFeed.map(({ project, pin }) => (
                    <article
                      key={project.ticker}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <ProjectMark project={project} size="h-9 w-9" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-bold">${project.ticker}</p>
                            <span className="truncate text-[11px] text-white/35">{project.name}</span>
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/30">
                            <img src="/images/partners/telegram.svg" alt="" className="h-3 w-3" />
                            {project.community} members
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-2 py-1 text-[10px] font-semibold text-[#d5ff69]">
                          <Pin className="h-3 w-3" />
                          {pin.when}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-white/70">{pin.text}</p>
                    </article>
                  ))
                )}
              </div>
            ) : (
            <div className="gloss-panel rounded-xl border border-white/[0.1]">
              <div className="hide-scrollbar overflow-x-auto overscroll-x-contain">
                <div className={isPrelaunch ? 'min-w-[1024px]' : 'min-w-[960px]'}>
                  <div
                    className="grid items-center gap-2 border-b border-white/[0.06] px-3 py-2.5 text-[10px] font-semibold text-white/30"
                    style={rankingGridStyle}
                  >
                    <span className="text-center"><Star className="mx-auto h-3 w-3" /></span>
                    <span className="text-center">#</span>
                    <span>Asset</span>
                    <span className="text-center">Vote</span>
                    {isPrelaunch ? (
                      <span className="text-right" title="Hours until launch">Launch</span>
                    ) : null}
                    <span className="text-right">Price</span>
                    <span className="text-right">%{activeTimeWindow}</span>
                    <span className="text-right" title="Messages per hour">MPH</span>
                    <span className="text-right" title="Raids and people engaging">Raids</span>
                    <span>Marketing wallet</span>
                    <span className="text-right">Balance</span>
                    <span className="text-right">Votes ▾</span>
                  </div>
                  {pagedProjects.map((project) => {
                    const hasVoted = Boolean(voted[project.ticker]);
                    const displayVotes = project.votes + (hasVoted ? 1 : 0);
                    const displayVotesToday = project.votesToday + (hasVoted ? 1 : 0);
                    return (
                    <article
                      key={project.ticker}
                      className="grid items-center gap-2 border-b border-white/[0.05] px-3 py-3 last:border-0 hover:bg-white/[0.02]"
                      style={rankingGridStyle}
                    >
                      <button
                        type="button"
                        aria-label={`Star ${project.ticker}`}
                        onClick={() => setStarred((prev) => ({ ...prev, [project.ticker]: !prev[project.ticker] }))}
                        className="grid place-items-center text-white/20 hover:text-[#c8ff3d]"
                      >
                        <Star className={`h-3.5 w-3.5 ${starred[project.ticker] ? 'fill-[#c8ff3d] text-[#c8ff3d]' : ''}`} />
                      </button>
                      <span className="text-center text-xs text-white/35">{project.rank}</span>
                      <div className="flex w-[180px] items-center gap-2.5">
                        <ProjectMark project={project} size="h-9 w-9" rounded="rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-bold">{project.ticker}</p>
                            {project.verified && (
                              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-amber-300 text-[8px] font-black text-black">✓</span>
                            )}
                            {project.boost != null && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300">
                                <Zap className="h-3 w-3 fill-amber-300" />{project.boost}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[11px] text-white/35">{project.name}</p>
                        </div>
                        <ChainPill />
                      </div>
                      <div className="flex w-full justify-center">
                        <button
                          type="button"
                          onClick={() => castVote(project.ticker)}
                          disabled={hasVoted}
                          className={`w-[3.25rem] rounded-md px-0 py-1.5 text-center text-[11px] font-bold transition ${
                            hasVoted
                              ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                              : 'bg-[#c8ff3d] text-[#090b14] hover:bg-[#d5ff69]'
                          }`}
                        >
                          {hasVoted ? 'Voted' : 'Vote'}
                        </button>
                      </div>
                      {isPrelaunch ? (
                        <span
                          className={`text-right text-xs font-semibold ${
                            project.launchInHours == null || project.launchInHours <= 0
                              ? 'text-white/35'
                              : project.launchInHours <= 12
                                ? 'text-[#c8ff3d]'
                                : 'text-white/80'
                          }`}
                          title="Hours until launch"
                        >
                          {formatLaunchIn(project.launchInHours)}
                        </span>
                      ) : null}
                      <span className="text-right text-xs font-medium">{project.price}</span>
                      <span className="text-right text-xs"><Pct value={changeForWindow(project, activeTimeWindow)} /></span>
                      <span className="text-right text-xs font-semibold text-[#c8ff3d]" title="Messages per hour">
                        {project.mph}
                      </span>
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${project.raidsActive > 0 ? 'text-[#c8ff3d]' : 'text-white/25'}`}>
                          {project.raidsActive > 0 ? `${project.raidsActive} raids` : '0 raids'}
                        </p>
                        <p className="text-[10px] text-white/40">{project.raidsJoined} eng.</p>
                      </div>
                      {project.marketingWallet ? (
                        <button type="button" className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-md bg-white/[0.04] px-2 py-1 text-left text-[11px] font-medium text-[#c8ff3d] hover:bg-white/[0.07]">
                          <Wallet className="h-3 w-3 shrink-0" />
                          <span className="truncate">{project.marketingWallet}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/25">No wallet</span>
                      )}
                      <span className="text-right text-xs font-semibold text-white/85">
                        {project.marketingBalance ?? '--'}
                      </span>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#4ea1ff]">{formatVotes(displayVotes)}</p>
                        <p className="text-[10px] text-white/35">{displayVotesToday}</p>
                      </div>
                    </article>
                    );
                  })}
                </div>
              </div>

              {visibleProjects.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-white/35">No projects found.</div>
              )}
            </div>
            )}

            {!isPinnedView && visibleProjects.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/70 transition hover:text-white disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => goToPage(num)}
                    className={`grid h-10 min-w-[2.5rem] place-items-center rounded-lg border px-2 text-xs font-semibold transition ${
                      num === currentPage
                        ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/15 text-[#d5ff69]'
                        : 'border-white/[0.08] bg-white/[0.025] text-white/55 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/70 transition hover:text-white disabled:opacity-35"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <form
                  className="ml-1 flex items-center gap-1.5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitPageInput();
                  }}
                >
                  <label className="sr-only" htmlFor="page-jump">
                    Go to page
                  </label>
                  <input
                    id="page-jump"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value.replace(/[^\d]/g, ''))}
                    placeholder=""
                    aria-label="Enter page number"
                    className="h-10 w-12 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2 text-center text-base text-white outline-none focus:border-[#c8ff3d]/40"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-[11px] font-semibold text-white/55 transition hover:text-white"
                  >
                    Go
                  </button>
                </form>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <section id="services" className="mx-auto mt-10 max-w-7xl scroll-mt-28 px-3 sm:px-5">
        <div className="overflow-hidden rounded-2xl border border-[#c8ff3d]/20 bg-gradient-to-br from-[#c8ff3d]/[0.08] via-transparent to-transparent">
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c8ff3d]/80">
                Services
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold">Launch pack · 4 SOL</h2>
              <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/45">
                Site clone or 1-pager, logo + banner, and a Rex channel callout — paid direct in SOL.
                DexScreener is separate. Marketing-wallet spends stay on the CTO launch path.
              </p>
              <Link
                to="/services"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-xs font-semibold text-[#090b14] hover:bg-[#d5ff69]"
              >
                <Zap className="h-3.5 w-3.5 fill-[#090b14]" />
                View services
              </Link>
            </div>
            <div className="hidden sm:block">
              <LightningBundleArt className="h-28 w-48" />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-white/[0.06] bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#c8ff3d] text-[#090b14]"><RotateCcw className="h-3.5 w-3.5" /></span>
            <span>Solana CTO discovery</span>
          </div>
          <div className="flex gap-5">
            <Link to="/services" className="hover:text-white/50">Services</Link>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
      </div>
      <ServicesBottomSheet />
    </div>
  );
}
