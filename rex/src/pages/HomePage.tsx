import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  LayoutGrid,
  UserRound,
  Pin,
  Plus,
  Rocket,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { ConnectWalletButton, useConnectedWallet } from '../components/ConnectWalletButton';
import { AuthButton } from '../components/AuthButton';
import { useAuth } from '../components/AuthProvider';
import { MarketingWalletExplainerModal } from '../components/MarketingWalletExplainer';
import { CtoTradeView } from '../components/CtoTradeView';
import { Sparkline } from '../components/Sparkline';
import { AppSidebar, AppSidebarMenuButton, AppSidebarProvider } from '../components/AppSidebar';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { PolessiaLogo } from '../components/PolessiaLogo';
import {
  DEFAULT_DISCOVERY_FILTERS,
  DiscoveryFiltersPanel,
  AGE_STEPS,
  MCAP_STEPS,
  HOLDERS_STEPS,
  countActiveDiscoveryFilters,
  formatRangeLabel,
  loadDiscoveryFilters,
  matchesDiscoveryFilters,
  parseCompactAmount,
  readRememberFilters,
  saveDiscoveryFilters,
  writeRememberFilters,
  type DiscoveryFilterState,
} from '../components/DiscoveryFilters';
import { useWatchlist } from '../hooks/useWatchlist';
import {
  SOURCE_VENUE_FILTERS,
  ctoProjects,
  matchesSourceVenue,
  resolveMarketingWalletAddress,
  resolveTradeMint,
  solscanAccountUrl,
  type CtoProject,
  type SourceVenueFilter,
} from '../data/ctoProjects';
import { formatCompactDollar } from '../data/projectDetails';

type Project = CtoProject;

const projects = ctoProjects;

const tickerProjects = projects;
const promotedProjects = projects.filter((project) => project.promoted);
const timeWindows = [
  { id: '5m', label: '5m', title: 'Price, volume, and activity in the last 5 minutes' },
  { id: '30m', label: '30m', title: 'Price, volume, and activity in the last 30 minutes' },
  { id: '1h', label: '1h', title: 'Price, volume, and activity in the last hour' },
  { id: '6h', label: '6h', title: 'Price, volume, and activity in the last 6 hours' },
  { id: '24h', label: '24h', title: 'Price, volume, and activity in the last 24 hours' },
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

function windowShareOfDay(window: TimeWindow): number {
  switch (window) {
    case '5m':
      return 5 / (24 * 60);
    case '30m':
      return 30 / (24 * 60);
    case '1h':
      return 1 / 24;
    case '6h':
      return 6 / 24;
    case '24h':
      return 1;
    default:
      return 1;
  }
}

function tickerSalt(ticker: string, mod = 100): number {
  let salt = 0;
  for (let i = 0; i < ticker.length; i += 1) {
    salt = (salt * 31 + ticker.charCodeAt(i)) % mod;
  }
  return salt;
}

/** Demo window flow from 24h totals, weighted by that window’s move. */
function volumeAmountForWindow(project: Project, window: TimeWindow): number {
  const base = parseCompactAmount(project.volume24h);
  if (window === '24h') return base;
  const change = Math.abs(changeForWindow(project, window) ?? 0);
  const burst = 1 + Math.min(change / 15, 3);
  const jitter = 0.85 + (tickerSalt(project.ticker) / 100) * 0.3;
  return Math.max(0, base * windowShareOfDay(window) * burst * jitter);
}

function volumeForWindow(project: Project, window: TimeWindow): string {
  if (window === '24h') return project.volume24h;
  return formatCompactDollar(volumeAmountForWindow(project, window));
}

function txsAmountForWindow(project: Project, window: TimeWindow): number {
  const base = parseCompactAmount(project.txs);
  if (window === '24h') return base;
  const change = Math.abs(changeForWindow(project, window) ?? 0);
  const burst = 1 + Math.min(change / 15, 3);
  const jitter = 0.85 + (tickerSalt(project.ticker, 97) / 97) * 0.3;
  return Math.max(0, base * windowShareOfDay(window) * burst * jitter);
}

function formatCompactCount(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${Math.max(0, Math.round(amount))}`;
}

function txsForWindow(project: Project, window: TimeWindow): string {
  if (window === '24h') return project.txs;
  return formatCompactCount(txsAmountForWindow(project, window));
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
  { id: 'Trending', label: 'Trending', icon: Flame, title: 'Trending', subtitle: 'Strongest momentum right now.' },
  { id: 'New', label: 'New', icon: Sparkles, title: 'New', subtitle: 'Recently forming takeovers just entering the rankings.' },
  { id: 'Gainers', label: 'Gainers', icon: TrendingUp, title: 'Gainers', subtitle: 'Biggest price movers in the selected window.' },
  {
    id: 'Prelaunch',
    label: 'Prelaunch',
    icon: Rocket,
    title: 'Prelaunch',
    subtitle: 'Vote with a connected wallet to set launch order — highest votes go live first.',
  },
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
    subtitle: 'Vote with a connected wallet to set launch order — highest votes go live first.',
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
    case 'Prelaunch':
      // Launch order = most votes first
      return b.votes - a.votes || b.votesToday - a.votesToday || b.mph - a.mph;
    case 'New CTOs': {
      const launchA = a.launchInHours ?? Number.POSITIVE_INFINITY;
      const launchB = b.launchInHours ?? Number.POSITIVE_INFINITY;
      if (launchA !== launchB) return launchA - launchB;
      return b.votesToday - a.votesToday;
    }
    case 'Trending':
    default:
      if (mode === 'New') {
        const launchA = a.launchInHours ?? Number.POSITIVE_INFINITY;
        const launchB = b.launchInHours ?? Number.POSITIVE_INFINITY;
        if (launchA !== launchB) return launchA - launchB;
        return b.votesToday - a.votesToday;
      }
      if (mode === 'Gainers') {
        const changeA = changeForWindow(a, window);
        const changeB = changeForWindow(b, window);
        const scoreA = changeA ?? Number.NEGATIVE_INFINITY;
        const scoreB = changeB ?? Number.NEGATIVE_INFINITY;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return volumeAmountForWindow(b, window) - volumeAmountForWindow(a, window);
      }
      // Trending: score, then window volume, then messaging heat
      if (b.score !== a.score) return b.score - a.score;
      const volDelta = volumeAmountForWindow(b, window) - volumeAmountForWindow(a, window);
      if (volDelta !== 0) return volDelta;
      return b.mph - a.mph;
  }
}

const tableCols =
  '200px 80px 76px 72px 96px 72px 72px 56px 148px 28px';
const tableColsPrelaunch =
  '30px 200px 80px 68px 56px 76px 72px 96px 72px 56px 148px 64px 28px';

function formatLaunchLabel(hours: number | null): string {
  if (hours == null) return 'Live';
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

/** Demo age field: hours since listing. Null = older live coin. Tag lasts 24h. */
function isNewListing(launchInHours: number | null): boolean {
  return launchInHours != null && launchInHours < 24;
}

function socialSheetStats(project: Project) {
  let seed = 0;
  for (let i = 0; i < project.ticker.length; i += 1) {
    seed = (seed * 31 + project.ticker.charCodeAt(i)) >>> 0;
  }
  /** Demo 24h volume delta until we have live vol history. */
  const volChange = Number((((seed % 1800) / 100 - 9) * (project.change24h >= 0 ? 1 : -1)).toFixed(2));
  return [
    {
      label: 'Holders',
      value: project.holders,
      title: 'Token holders',
      change: null as number | null,
    },
    {
      label: 'Mcap',
      value: project.marketCap,
      title: 'Market cap · 24h change',
      change: project.change24h,
    },
    {
      label: 'Vol 24h',
      value: project.volume24h,
      title: '24h volume · change vs prior day',
      change: volChange,
    },
  ];
}

function projectSocialLinks(project: Project) {
  const slug = project.ticker.toLowerCase().replace(/[^a-z0-9]/g, '');
  const links: Array<{
    id: 'x' | 'telegram' | 'discord' | 'website';
    label: string;
    href: string;
    hint: string;
  }> = [
    {
      id: 'x',
      label: 'X / Twitter',
      href: `https://x.com/${slug}`,
      hint: `@${slug}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/${slug}`,
      hint: `${project.community} members`,
    },
  ];

  const discord = resolveDiscordUrl(project);
  if (discord) {
    links.push({
      id: 'discord',
      label: 'Discord',
      href: discord,
      hint: 'Community server',
    });
  }

  links.push({
    id: 'website',
    label: 'Website',
    href: `https://${slug}.fun`,
    hint: `${slug}.fun`,
  });

  return links;
}

/** Demo: most coins have Discord; override with discordUrl (empty string = none). */
function resolveDiscordUrl(project: Project): string | null {
  if (project.discordUrl === '') return null;
  if (project.discordUrl) return project.discordUrl;
  const seed = project.ticker.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  if (seed % 3 === 0) return null;
  return `https://discord.gg/${project.ticker.toLowerCase()}`;
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function SocialGlyph({
  id,
  className,
}: {
  id: 'x' | 'telegram' | 'discord' | 'website';
  className?: string;
}) {
  if (id === 'telegram') {
    return <img src="/images/partners/telegram.svg" alt="" className={className} />;
  }
  if (id === 'discord') {
    return <DiscordGlyph className={className} />;
  }
  if (id === 'website') {
    return <Globe className={className} />;
  }
  return <XMarkIcon className={className} />;
}

function ProjectMark({
  project,
  size = 'h-10 w-10',
  rounded = 'rounded-full',
  showChain = true,
}: {
  project: Project;
  size?: string;
  rounded?: string;
  showChain?: boolean;
}) {
  const badgeSize =
    size.includes('h-8') || size.includes('h-7')
      ? 'h-3 w-3'
      : size.includes('h-9')
        ? 'h-3.5 w-3.5'
        : 'h-4 w-4';

  return (
    <div className={`relative ${size} shrink-0`}>
      <div
        className={`h-full w-full overflow-hidden ${rounded} bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}
      >
        <img
          src={project.logo}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      {showChain && project.chain === 'SOL' ? (
        <span
          className={`absolute -bottom-0.5 -right-0.5 grid ${badgeSize} place-items-center overflow-hidden rounded-full bg-black ring-1 ring-black/80`}
          title="Solana"
          aria-label="Solana"
        >
          <img src="/images/partners/solana.svg" alt="" className="h-full w-full object-cover" />
        </span>
      ) : null}
    </div>
  );
}

function TxVolumeBar({
  project,
  window,
}: {
  project: Project;
  window: TimeWindow;
}) {
  let hash = 0;
  for (let i = 0; i < project.ticker.length; i += 1) {
    hash = (hash * 31 + project.ticker.charCodeAt(i)) % 1000;
  }
  const change = changeForWindow(project, window) ?? 0;
  const bias = change >= 0 ? 12 : -12;
  const buyPct = Math.min(88, Math.max(12, 38 + (hash % 40) + bias));
  const sellPct = 100 - buyPct;
  return (
    <span
      className="inline-flex h-7 w-1.5 shrink-0 flex-col overflow-hidden rounded-[2px]"
      title={`Buys ${buyPct}% · Sells ${sellPct}% · ${window}`}
      aria-hidden
    >
      <span className="w-full bg-emerald-400" style={{ flexGrow: buyPct, flexBasis: 0 }} />
      <span className="w-full bg-rose-500" style={{ flexGrow: sellPct, flexBasis: 0 }} />
    </span>
  );
}

function Pct({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/25">--</span>;
  return (
    <span className={value >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  );
}

function formatVotes(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 2).replace(/\.00$/, '')}K`;
  return String(n);
}

type SortKey =
  | 'asset'
  | 'chart'
  | 'launch'
  | 'marketCap'
  | 'volume'
  | 'txs'
  | 'price'
  | 'holders'
  | 'votes';
type SortDir = 'asc' | 'desc';

function compareByColumn(
  a: Project,
  b: Project,
  key: SortKey,
  dir: SortDir,
  window: TimeWindow,
): number {
  const sign = dir === 'asc' ? 1 : -1;
  let delta = 0;
  switch (key) {
    case 'asset':
      delta = a.ticker.localeCompare(b.ticker);
      break;
    case 'chart': {
      const ca = changeForWindow(a, window) ?? Number.NEGATIVE_INFINITY;
      const cb = changeForWindow(b, window) ?? Number.NEGATIVE_INFINITY;
      delta = ca - cb;
      break;
    }
    case 'launch': {
      // Most-recent first = smallest (hours-to-launch). Live projects have null, treated as +Infinity.
      const launchA = a.launchInHours ?? Number.POSITIVE_INFINITY;
      const launchB = b.launchInHours ?? Number.POSITIVE_INFINITY;
      delta = launchA - launchB;
      break;
    }
    case 'marketCap':
      delta = parseCompactAmount(a.marketCap) - parseCompactAmount(b.marketCap);
      break;
    case 'volume':
      delta = volumeAmountForWindow(a, window) - volumeAmountForWindow(b, window);
      break;
    case 'txs':
      delta = txsAmountForWindow(a, window) - txsAmountForWindow(b, window);
      break;
    case 'price':
      delta = parseCompactAmount(a.price) - parseCompactAmount(b.price);
      break;
    case 'holders':
      delta = parseCompactAmount(a.holders) - parseCompactAmount(b.holders);
      break;
    case 'votes':
      delta = a.votes - b.votes;
      break;
    default:
      delta = 0;
  }
  if (delta !== 0) return sign * delta;
  return a.ticker.localeCompare(b.ticker);
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
  title,
}: {
  label: ReactNode;
  sortKey: SortKey;
  activeKey: SortKey | null;
  direction: SortDir;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'center' | 'right';
  title?: string;
}) {
  const active = activeKey === sortKey;
  const alignClass =
    align === 'right' ? 'ml-auto justify-end' : align === 'center' ? 'mx-auto justify-center' : 'justify-start';
  return (
    <button
      type="button"
      title={title ?? `Sort by ${typeof label === 'string' ? label : sortKey}`}
      onClick={() => onSort(sortKey)}
      className={`inline-flex w-full items-center gap-0.5 text-[10px] font-semibold transition hover:text-white/70 ${
        active ? 'text-white/80' : 'text-white/30'
      } ${alignClass}`}
    >
      <span>{label}</span>
      <span className="inline-flex flex-col leading-none" aria-hidden>
        <ChevronUp
          className={`-mb-0.5 h-2.5 w-2.5 ${active && direction === 'asc' ? 'text-[#c8ff3d]' : 'text-white/25'}`}
        />
        <ChevronDown
          className={`-mt-0.5 h-2.5 w-2.5 ${active && direction === 'desc' ? 'text-[#c8ff3d]' : 'text-white/25'}`}
        />
      </span>
    </button>
  );
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

export function HomePage() {
  const [query, setQuery] = useState('');
  const [activeShortcut, setActiveShortcut] = useState<Shortcut>('Trending');
  const [activeMode, setActiveMode] = useState<RankingMode>('Trending');
  const [venueFilter, setVenueFilter] = useState<SourceVenueFilter>('all');
  const [activeWindow, setActiveWindow] = useState<RankingFilter>('5m');
  const windowBeforePinned = useRef<TimeWindow>('5m');
  const isPinnedView = activeWindow === 'Pinned';
  const activeTimeWindow: TimeWindow = isPinnedView ? '5m' : activeWindow;
  const shortcutOwnsList =
    activeShortcut === 'Top Today' ||
    activeShortcut === 'Top All Time' ||
    activeShortcut === 'Prelaunch';
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [walletExplainerOpen, setWalletExplainerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'trade'>('list');
  const [selectedTicker, setSelectedTicker] = useState(projects[0]?.ticker ?? 'MPEG');
  const [voteNotice, setVoteNotice] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [socialsTicker, setSocialsTicker] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilterState>(() =>
    loadDiscoveryFilters(),
  );
  const [rememberFilters, setRememberFilters] = useState(() => readRememberFilters());
  const [copiedCaTicker, setCopiedCaTicker] = useState<string | null>(null);
  const { connected, connect, busy: walletBusy } = useConnectedWallet();
  const { signedIn } = useAuth();
  const { starred, toggle: toggleWatchlist, count: watchlistCount } = useWatchlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;

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
    const ticker = searchParams.get('ticker')?.trim().toUpperCase();
    if (!ticker) return;
    const match = projects.find((project) => project.ticker.toUpperCase() === ticker);
    if (!match) return;
    setSelectedTicker(match.ticker);
    setViewMode('trade');
  }, [searchParams]);

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
      return (
        matchesQuery &&
        matchesShortcut(project, activeShortcut) &&
        matchesSourceVenue(project, venueFilter) &&
        matchesDiscoveryFilters(project, discoveryFilters)
      );
    });

    const withLocalVotes = filtered.map((project) => {
      const bump = voted[project.ticker] ? 1 : 0;
      return {
        ...project,
        votes: project.votes + bump,
        votesToday: project.votesToday + bump,
      };
    });

    const sorted = [...withLocalVotes];
    if (sortKey) {
      sorted.sort((a, b) => compareByColumn(a, b, sortKey, sortDir, activeTimeWindow));
    } else {
      sorted.sort((a, b) => compareByShortcut(a, b, activeShortcut, activeMode, activeTimeWindow));
    }

    return sorted.map((project, index) => ({ ...project, rank: index + 1 }));
  }, [
    query,
    activeTimeWindow,
    activeShortcut,
    activeMode,
    voted,
    venueFilter,
    sortKey,
    sortDir,
    discoveryFilters,
  ]);

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

  const selectedProject =
    visibleProjects.find((project) => project.ticker === selectedTicker) ??
    visibleProjects[0] ??
    projects[0];

  const openTradeView = (ticker?: string) => {
    if (ticker) setSelectedTicker(ticker);
    else if (selectedProject) setSelectedTicker(selectedProject.ticker);
    setViewMode('trade');
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    setPage(1);
    setPageInput('');
    setSortKey(null);
    setSortDir('desc');
  }, [query, activeWindow, activeShortcut, activeMode, venueFilter, discoveryFilters]);

  const activeFilterCount = countActiveDiscoveryFilters(discoveryFilters);

  const updateDiscoveryFilters = (next: DiscoveryFilterState) => {
    setDiscoveryFilters(next);
    if (rememberFilters) saveDiscoveryFilters(next);
  };

  const clearDiscoveryFilters = () => {
    setDiscoveryFilters(DEFAULT_DISCOVERY_FILTERS);
    if (rememberFilters) saveDiscoveryFilters(DEFAULT_DISCOVERY_FILTERS);
  };

  const toggleRememberFilters = (remember: boolean) => {
    setRememberFilters(remember);
    writeRememberFilters(remember);
    if (remember) saveDiscoveryFilters(discoveryFilters);
  };

  const copyTradeMint = async (project: Project) => {
    const mint = resolveTradeMint(project);
    try {
      await navigator.clipboard.writeText(mint);
      setCopiedCaTicker(project.ticker);
      window.setTimeout(() => {
        setCopiedCaTicker((prev) => (prev === project.ticker ? null : prev));
      }, 1600);
    } catch {
      /* ignore */
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir(key === 'asset' || key === 'launch' ? 'asc' : 'desc');
      return;
    }
    if (sortDir === 'desc') {
      setSortDir('asc');
      return;
    }
    setSortKey(null);
    setSortDir('desc');
  };

  const socialsProject =
    socialsTicker != null
      ? projects.find((project) => project.ticker === socialsTicker) ?? null
      : null;

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
    const venue =
      SOURCE_VENUE_FILTERS.find((item) => item.id === venueFilter) ?? SOURCE_VENUE_FILTERS[0];
    const baseSubtitle = 'Discover new CTOs. Trade with ready made communities.';
    const venueNote =
      venueFilter === 'all' ? baseSubtitle : `${baseSubtitle} · ${venue.label}`;
    if (activeMode === 'Gainers') {
      const windowTab = timeWindows.find((tab) => tab.id === activeWindow);
      return {
        title: 'All CTOs',
        subtitle: `Sorted by ${activeWindow} gainers — ${windowTab?.title ?? 'active movers'}. ${venueFilter === 'all' ? '' : `Venue: ${venue.label}.`}`.trim(),
      };
    }
    return { title: 'All CTOs', subtitle: venueNote };
  })();

  const selectVenueFilter = (venue: SourceVenueFilter) => {
    setVenueFilter(venue);
    setActiveShortcut('Trending');
    if (isPinnedView) setActiveWindow('5m');
    setPage(1);
    setPageInput('');
  };

  const selectRankingMode = (mode: RankingMode) => {
    setActiveMode(mode === 'Prelaunch' ? 'Trending' : mode);
    setActiveShortcut(mode === 'Prelaunch' ? 'Prelaunch' : 'Trending');
    if (isPinnedView) setActiveWindow('5m');
    setPage(1);
    setPageInput('');
  };

  const castVote = async (ticker: string) => {
    if (!connected) {
      setVoteNotice('Connect your wallet to vote');
      const address = await connect();
      if (!address) return;
    }
    setVoted((prev) => (prev[ticker] ? prev : { ...prev, [ticker]: true }));
    setVoteNotice(null);
  };

  useEffect(() => {
    if (!voteNotice) return;
    const id = window.setTimeout(() => setVoteNotice(null), 4000);
    return () => window.clearTimeout(id);
  }, [voteNotice]);

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
    <AppSidebarProvider>
    <div className="page-shell theme-dark min-h-screen overflow-x-hidden text-[#f5f7fb]">
      <AppSidebar />
      <div className="relative z-[1] min-w-0">
      {viewMode !== 'trade' ? (
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

      <header className={`border-b border-white/[0.07] bg-black ${showSearchPanel ? 'relative z-[60]' : 'relative z-10'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-5">
          <a href="/" className="flex shrink-0 items-center gap-2" aria-label="CTOgo home">
            <CtoGoLogo size={36} className="rounded-xl" />
            <div className="hidden sm:block">
              <p className="flex items-center gap-1.5 font-serif text-lg font-bold leading-none tracking-tight">
                CTOgo
                <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  beta
                </span>
              </p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">Community takeover</p>
            </div>
          </a>

          <div className={`relative min-w-0 flex-1 sm:max-w-md md:max-w-lg ${showSearchPanel ? 'z-[60]' : ''}`}>
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
                placeholder="Search CTOs"
                aria-keyshortcuts="/"
                aria-expanded={showSearchPanel}
                aria-controls="cto-search-panel"
                className="h-10 w-full min-w-0 rounded-lg border border-white/[0.08] bg-white/[0.045] pl-9 pr-3 text-base text-white outline-none transition placeholder:text-white/40 focus:border-[#c8ff3d]/40 sm:pr-11"
              />
              {!searchFocused && !query ? (
                <kbd
                  className="pointer-events-none absolute right-2.5 top-1/2 hidden h-6 min-w-[1.4rem] -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-white/[0.08] px-1.5 font-sans text-[11px] font-semibold leading-none text-white/55 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)] sm:inline-flex"
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
                className="absolute left-0 top-[calc(100%+6px)] z-[70] w-[min(100vw-1.5rem,24rem)] overflow-hidden rounded-xl border border-white/[0.1] bg-[#050505] shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:w-full"
              >
                <div className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain py-2">
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
                    Featured
                  </p>
                  {searchSuggestions.promoted.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-white/35">No featured matches</p>
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

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Link
              to="/launch"
              className="hidden h-10 items-center gap-2 rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] transition hover:bg-[#d7ff70] md:flex"
            >
              <Plus className="h-4 w-4" /> Submit CTO
            </Link>
            <AuthButton className="shrink-0" />
            {signedIn ? (
              <Link
                to="/launch?dashboard=1"
                className="grid h-10 w-10 place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-[#d5ff69]"
                aria-label="Dashboard"
                title="Dashboard"
              >
                <UserRound className="h-5 w-5" />
              </Link>
            ) : null}
            <ConnectWalletButton className="shrink-0" />
            <button
              type="button"
              className="relative grid h-10 w-10 place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <AppSidebarMenuButton />
          </div>
        </div>
      </header>

      <nav
        aria-label="Filter coins by exchange"
        className={`border-b border-white/[0.06] bg-black ${showSearchPanel ? 'relative z-0' : ''}`}
      >
        <div className="hide-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-2 sm:px-5">
          {SOURCE_VENUE_FILTERS.map((venue) => {
            const active = !isPinnedView && venueFilter === venue.id;
            return (
              <button
                key={venue.id}
                type="button"
                title={venue.title}
                aria-pressed={active}
                onClick={() => selectVenueFilter(venue.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition [-webkit-tap-highlight-color:transparent] ${
                  active
                    ? 'border border-[#c8ff3d]/40 bg-[#c8ff3d]/15 text-[#d5ff69]'
                    : 'border border-white/[0.07] bg-white/[0.025] text-white/55 hover:text-white'
                }`}
              >
                {venue.logoSrc ? (
                  <img
                    src={venue.logoSrc}
                    alt=""
                    className="h-4 w-4 shrink-0 rounded-[4px] bg-black/40 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <LayoutGrid
                    className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[#d5ff69]' : 'text-white/45'}`}
                    aria-hidden
                  />
                )}
                {venue.label}
              </button>
            );
          })}
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 px-3 pb-2.5 sm:px-5">
          <Link
            to="/launch?mode=list"
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-[#c8ff3d] px-3 text-xs font-bold text-[#090b14] transition hover:bg-[#d5ff69] sm:flex-none sm:px-4"
          >
            List a CTO
          </Link>
          <Link
            to="/launch"
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 text-xs font-semibold text-white/80 transition hover:border-[#c8ff3d]/35 hover:text-[#d5ff69] sm:flex-none sm:px-4"
          >
            Launch a CTO
          </Link>
        </div>
      </nav>
      </div>
      ) : null}

      <main
        className={`mx-auto min-w-0 max-w-7xl ${
          viewMode === 'trade' ? 'px-0 py-0' : 'px-3 py-3 sm:px-5'
        }`}
      >
        {viewMode === 'trade' && selectedProject ? (
          <section id="cto-rankings" className="min-w-0 scroll-mt-4 pt-2">
            <CtoTradeView
              project={selectedProject}
              projects={visibleProjects}
              change={changeForWindow(selectedProject, activeTimeWindow)}
              onSelect={setSelectedTicker}
              onBack={() => setViewMode('list')}
              starred={Boolean(starred[selectedProject.ticker])}
              onToggleStar={() => toggleWatchlist(selectedProject.ticker)}
              onOpenSocials={() => setSocialsTicker(selectedProject.ticker)}
            />
          </section>
        ) : (
          <section id="cto-rankings" className="min-w-0 scroll-mt-[13.5rem]">
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-bold">{sectionCopy.title}</h2>
              <p className="mt-1 text-xs text-white/35">{sectionCopy.subtitle}</p>
              {isPrelaunch ? (
                <p className="mt-1 text-[11px] text-white/40">
                  Voting requires a connected wallet
                  {connected ? ' · wallet connected' : ''}.
                </p>
              ) : null}
              {voteNotice ? (
                <p className="mt-1 text-[11px] font-medium text-amber-300">{voteNotice}</p>
              ) : null}
            </div>

            <div className="hide-scrollbar mb-2.5 flex gap-2 overflow-x-auto pb-1">
              {rankingModes.map((mode) => {
                const Icon = mode.icon;
                const active =
                  !isPinnedView &&
                  (mode.id === 'Prelaunch'
                    ? activeShortcut === 'Prelaunch'
                    : !shortcutOwnsList && activeMode === mode.id);
                return (
                  <button
                    key={mode.id}
                    type="button"
                    title={mode.subtitle}
                    aria-pressed={active}
                    onClick={() => selectRankingMode(mode.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition [-webkit-tap-highlight-color:transparent] ${
                      active
                        ? 'border border-[#c8ff3d]/35 bg-[#c8ff3d]/10 text-[#d5ff69]'
                        : 'border border-white/[0.06] bg-transparent text-white/40'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {mode.label}
                  </button>
                );
              })}
              <button
                type="button"
                title="Coins you’ve starred"
                onClick={() => navigate('/watchlist')}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-transparent px-3 py-1.5 text-[11px] font-semibold text-white/40 transition hover:border-white/15 hover:text-white [-webkit-tap-highlight-color:transparent]"
              >
                <Star className="h-3 w-3" />
                Watchlist
                {watchlistCount > 0 ? (
                  <span className="rounded-full bg-[#c8ff3d]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#d5ff69]">
                    {watchlistCount}
                  </span>
                ) : null}
              </button>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <div
                className="relative min-w-0 max-w-[10.75rem] shrink"
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to right, #000 0%, #000 62%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, #000 0%, #000 62%, transparent 100%)',
                }}
              >
                <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1 pr-4">
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
                </div>
              </div>
              <button
                type="button"
                title={
                  isPinnedView
                    ? 'Back to discovery'
                    : 'Most recent pinned message in each Telegram group'
                }
                aria-pressed={isPinnedView}
                onClick={() => {
                  if (isPinnedView) {
                    setActiveWindow(windowBeforePinned.current);
                    setActiveMode('Trending');
                    setActiveShortcut('Trending');
                    setPage(1);
                    return;
                  }
                  if (activeWindow !== 'Pinned') {
                    windowBeforePinned.current = activeWindow;
                  }
                  setActiveWindow('Pinned');
                  setPage(1);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition [-webkit-tap-highlight-color:transparent] ${
                  isPinnedView
                    ? 'border border-transparent bg-white text-[#090b14]'
                    : 'border border-white/[0.07] bg-white/[0.025] text-white/45'
                }`}
              >
                <Pin className="h-3 w-3" />
                Pinned
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-pressed={filtersOpen || activeFilterCount > 0}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition ${
                  activeFilterCount > 0
                    ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/12 text-[#d5ff69]'
                    : 'border-white/[0.07] text-white/45 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#c8ff3d] px-1 text-[9px] font-bold text-[#090b14]">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </div>

            {activeFilterCount > 0 ? (
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                {formatRangeLabel(discoveryFilters.age, AGE_STEPS) !== 'Any' ? (
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/70">
                    Age · {formatRangeLabel(discoveryFilters.age, AGE_STEPS)}
                  </span>
                ) : null}
                {formatRangeLabel(discoveryFilters.marketCap, MCAP_STEPS) !== 'Any' ? (
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/70">
                    Mcap · {formatRangeLabel(discoveryFilters.marketCap, MCAP_STEPS)}
                  </span>
                ) : null}
                {formatRangeLabel(discoveryFilters.holders, HOLDERS_STEPS) !== 'Any' ? (
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/70">
                    Holders · {formatRangeLabel(discoveryFilters.holders, HOLDERS_STEPS)}
                  </span>
                ) : null}
                {discoveryFilters.volume !== 'any' ? (
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/70">
                    Vol · {discoveryFilters.volume.replace('gt', '>')}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={clearDiscoveryFilters}
                  className="px-1.5 text-[10px] font-semibold text-white/40 hover:text-[#d5ff69]"
                >
                  Clear all
                </button>
              </div>
            ) : null}
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
                <div className={isPrelaunch ? 'min-w-[1140px]' : 'min-w-[960px]'}>
                  <div
                    className="grid items-center gap-1.5 border-b border-white/[0.06] px-3 py-2.5 text-[10px] font-semibold text-white/30"
                    style={rankingGridStyle}
                  >
                    {isPrelaunch ? <span className="text-center">#</span> : null}
                    <SortHeader
                      label="Asset"
                      sortKey="asset"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                    />
                    <SortHeader
                      label="Chart"
                      sortKey="chart"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                      align="center"
                      title="Sort by % change"
                    />
                    {isPrelaunch ? (
                      <>
                        <span className="text-center">Vote</span>
                        <span className="text-right" title="Launch queue — highest votes first">
                          Queue
                        </span>
                      </>
                    ) : null}
                    <SortHeader
                      label="Market Cap"
                      sortKey="marketCap"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                      align="right"
                    />
                    <SortHeader
                      label={`Vol ${activeTimeWindow}`}
                      sortKey="volume"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                      align="right"
                      title={`Volume in the last ${activeTimeWindow}`}
                    />
                    <SortHeader
                      label={`TXs ${activeTimeWindow}`}
                      sortKey="txs"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                      align="right"
                      title={`Transactions in the last ${activeTimeWindow}`}
                    />
                    <SortHeader
                      label="Price"
                      sortKey="price"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                      align="right"
                    />
                    {!isPrelaunch ? (
                      <SortHeader
                        label="Launch"
                        sortKey="launch"
                        activeKey={sortKey}
                        direction={sortDir}
                        onSort={toggleSort}
                        align="center"
                        title="Sort by launch recency (most recent first)"
                      />
                    ) : null}
                    <SortHeader
                      label="Holders"
                      sortKey="holders"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={toggleSort}
                      align="right"
                    />
                    <span className="text-right">Marketing wallet</span>
                    {isPrelaunch ? (
                      <SortHeader
                        label="Votes"
                        sortKey="votes"
                        activeKey={sortKey}
                        direction={sortDir}
                        onSort={toggleSort}
                        align="right"
                      />
                    ) : null}
                    <span className="text-center"><Star className="mx-auto h-3 w-3" /></span>
                  </div>
                  {pagedProjects.map((project) => {
                    const hasVoted = Boolean(voted[project.ticker]);
                    return (
                    <article
                      key={project.ticker}
                      role="button"
                      tabIndex={0}
                      onClick={() => openTradeView(project.ticker)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openTradeView(project.ticker);
                        }
                      }}
                      className="grid cursor-pointer items-center gap-1.5 border-b border-white/[0.05] px-3 py-3 last:border-0 hover:bg-white/[0.02]"
                      style={rankingGridStyle}
                    >
                      {isPrelaunch ? (
                        <span className="text-center text-xs text-white/35">{project.rank}</span>
                      ) : null}
                      <div className="flex w-[200px] items-start gap-2">
                        <ProjectMark project={project} size="h-9 w-9" rounded="rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1">
                            <p className="shrink-0 text-sm font-bold tracking-tight">{project.ticker}</p>
                            <p className="min-w-0 truncate text-[11px] text-white/45">{project.name}</p>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void copyTradeMint(project);
                              }}
                              className={`ml-auto grid h-5 w-5 shrink-0 place-items-center rounded transition ${
                                copiedCaTicker === project.ticker
                                  ? 'text-[#c8ff3d]'
                                  : 'text-white/35 hover:bg-white/[0.08] hover:text-white'
                              }`}
                              aria-label={`Copy CTOgo contract for ${project.ticker}`}
                              title="Copy CTOgo contract — trades on any exchange still route fees here"
                            >
                              {copiedCaTicker === project.ticker ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            {isPrelaunch ? (
                              <span
                                className={`text-[11px] font-semibold tabular-nums ${
                                  project.launchInHours == null
                                    ? 'text-emerald-300'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {formatLaunchLabel(project.launchInHours)}
                              </span>
                            ) : null}
                            <span className="flex items-center gap-0.5" aria-label="Social links">
                              {projectSocialLinks(project).map((link) => (
                                <button
                                  key={link.id}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSocialsTicker(project.ticker);
                                  }}
                                  className="grid h-5 w-5 place-items-center rounded text-white/40 transition hover:bg-white/[0.08] hover:text-white"
                                  aria-label={`${link.label} for ${project.ticker}`}
                                  title={link.label}
                                >
                                  <SocialGlyph id={link.id} className="h-3 w-3" />
                                </button>
                              ))}
                            </span>
                            {isNewListing(project.launchInHours) ? (
                              <span
                                className="rounded bg-[#c8ff3d]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#d5ff69]"
                                title="Listed in the last 24 hours"
                              >
                                New
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Sparkline
                          seed={project.ticker}
                          changePct={changeForWindow(project, activeTimeWindow)}
                        />
                      </div>
                      {isPrelaunch ? (
                        <>
                          <div className="flex w-full justify-center">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void castVote(project.ticker);
                              }}
                              disabled={hasVoted || walletBusy}
                              title={
                                hasVoted
                                  ? 'Already voted'
                                  : connected
                                    ? 'Cast your vote'
                                    : 'Connect wallet to vote'
                              }
                              className={`w-[3.25rem] rounded-md px-0 py-1.5 text-center text-[11px] font-bold transition ${
                                hasVoted
                                  ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                                  : connected
                                    ? 'bg-[#c8ff3d] text-[#090b14] hover:bg-[#d5ff69]'
                                    : 'bg-white/15 text-white/70 hover:bg-white/20'
                              }`}
                            >
                              {hasVoted ? 'Voted' : connected ? 'Vote' : 'Connect'}
                            </button>
                          </div>
                          <span
                            className={`text-right text-xs font-semibold ${
                              project.rank === 1 ? 'text-[#c8ff3d]' : 'text-white/80'
                            }`}
                            title="Launch queue position — most votes launch first"
                          >
                            {project.rank === 1 ? 'Next' : `#${project.rank}`}
                          </span>
                        </>
                      ) : null}
                      <div className="text-right">
                        <p className="text-xs font-semibold text-white/90">{project.marketCap}</p>
                        <p className="text-[10px] leading-none">
                          <Pct value={changeForWindow(project, activeTimeWindow)} />
                        </p>
                      </div>
                      <span className="text-right text-xs font-semibold text-white/80">
                        {volumeForWindow(project, activeTimeWindow)}
                      </span>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-white/70">
                          {txsForWindow(project, activeTimeWindow)}
                        </span>
                        <TxVolumeBar project={project} window={activeTimeWindow} />
                      </div>
                      <span className="text-right text-xs font-medium">{project.price}</span>
                      {!isPrelaunch ? (
                        <span
                          className={`text-center text-[11px] font-semibold tabular-nums ${
                            project.launchInHours == null ? 'text-emerald-300' : 'text-emerald-400'
                          }`}
                        >
                          {formatLaunchLabel(project.launchInHours)}
                        </span>
                      ) : null}
                      <span className="text-right text-xs text-white/70">{project.holders}</span>
                      {(() => {
                        const mktAddr = resolveMarketingWalletAddress(project);
                        if (!project.marketingWallet || !mktAddr) {
                          return <span className="text-[11px] text-white/25">No wallet</span>;
                        }
                        return (
                          <a
                            href={solscanAccountUrl(mktAddr)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="flex w-full max-w-full items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-left hover:bg-white/[0.07]"
                            title={`View marketing wallet on Solscan`}
                          >
                            <Wallet className="h-3 w-3 shrink-0 text-[#c8ff3d]" />
                            <span className="truncate text-[11px] font-medium text-[#c8ff3d]">
                              {project.marketingWallet}
                            </span>
                            <span className="shrink-0 text-[11px] font-semibold text-white/85">
                              {project.marketingBalance ?? '--'}
                            </span>
                          </a>
                        );
                      })()}
                      {isPrelaunch ? (
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#4ea1ff]">{formatVotes(project.votes)}</p>
                          <p className="text-[10px] text-white/35">+{project.votesToday} today</p>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Star ${project.ticker}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleWatchlist(project.ticker);
                        }}
                        className="grid w-full place-items-center text-white/20 hover:text-[#c8ff3d]"
                      >
                        <Star className={`h-3.5 w-3.5 ${starred[project.ticker] ? 'fill-[#c8ff3d] text-[#c8ff3d]' : ''}`} />
                      </button>
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
        )}
      </main>

      <footer className="mt-10 border-t border-white/[0.06] bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-7 text-center text-[11px] text-white/25">
          <div className="flex items-center justify-center gap-2">
            <CtoGoLogo size={24} className="rounded-md" />
            <span>CTOgo · CTO discovery</span>
          </div>
          <PolessiaLogo variant="powered" size="xs" />
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/fees" className="hover:text-white/50">Fees</Link>
            <Link to="/marketing-wallet" className="hover:text-white/50">Marketing wallet</Link>
            <Link to="/advertise" className="hover:text-white/50">Advertise</Link>
            <Link to="/faq" className="hover:text-white/50">FAQ</Link>
            <Link to="/contact" className="hover:text-white/50">Contact</Link>
          </div>
        </div>
      </footer>
      </div>
      <MarketingWalletExplainerModal
        open={walletExplainerOpen}
        onClose={() => setWalletExplainerOpen(false)}
      />
      {copiedCaTicker ? (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c8ff3d]/35 bg-[#0a0c12]/95 px-3.5 py-2 text-[12px] font-semibold text-[#d5ff69] shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <Check className="h-3.5 w-3.5" />
            Contract copied
          </div>
        </div>
      ) : null}
      <DiscoveryFiltersPanel
        open={filtersOpen}
        filters={discoveryFilters}
        onChange={updateDiscoveryFilters}
        onClose={() => setFiltersOpen(false)}
        onClear={clearDiscoveryFilters}
        resultCount={visibleProjects.length}
        remember={rememberFilters}
        onRememberChange={toggleRememberFilters}
      />
      {socialsProject ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="coin-socials-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => setSocialsTicker(null)}
          />
          <div className="relative z-[1] w-full max-w-sm rounded-t-2xl border border-white/10 bg-[#0a0c12] p-4 shadow-[0_-20px_60px_rgba(0,0,0,0.65)] sm:rounded-2xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ProjectMark project={socialsProject} size="h-10 w-10" rounded="rounded-lg" />
                <div className="min-w-0">
                  <p id="coin-socials-title" className="flex items-baseline gap-2 truncate font-serif text-lg font-bold">
                    <span>${socialsProject.ticker}</span>
                    <span
                      className={`font-sans text-[12px] font-semibold tabular-nums ${
                        socialsProject.launchInHours == null ? 'text-emerald-300' : 'text-emerald-400'
                      }`}
                    >
                      {formatLaunchLabel(socialsProject.launchInHours)}
                    </span>
                  </p>
                  <p className="truncate text-xs text-white/45">{socialsProject.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSocialsTicker(null)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] text-white/50 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {socialSheetStats(socialsProject).map((stat) => (
                <div
                  key={stat.label}
                  title={stat.title}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-2 text-center"
                >
                  <p className="font-mono text-[13px] font-semibold tabular-nums text-white">
                    {stat.value}
                  </p>
                  {stat.change != null ? (
                    <p
                      className={`mt-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                        stat.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stat.change >= 0 ? '+' : ''}
                      {stat.change.toFixed(2)}%
                    </p>
                  ) : null}
                  <div className="mt-0.5 flex h-3.5 items-center justify-center text-white/45">
                    <span className="text-[10px] uppercase tracking-wide text-white/35">
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-white/35">Open a link</p>
            <div className="mt-2 space-y-2">
              {projectSocialLinks(socialsProject).map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSocialsTicker(null)}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.06] text-white/80">
                    <SocialGlyph id={link.id} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold text-white">{link.label}</span>
                    <span className="block truncate text-[11px] text-white/40">{link.hint}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-white/30" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </AppSidebarProvider>
  );
}
