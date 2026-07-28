import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Flame,
  LayoutGrid,
  Pin,
  Plus,
  Rocket,
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
import { ConnectWalletButton, useConnectedWallet } from '../components/ConnectWalletButton';
import { MarketingWalletExplainerModal } from '../components/MarketingWalletExplainer';
import { CtoTradeView } from '../components/CtoTradeView';
import { Sparkline } from '../components/Sparkline';
import { AppSidebar, AppSidebarMenuButton, AppSidebarProvider } from '../components/AppSidebar';
import { CtoGoLogo } from '../components/CtoGoLogo';
import {
  SOURCE_VENUE_FILTERS,
  ctoProjects,
  matchesSourceVenue,
  resolveMarketingWalletAddress,
  solscanAccountUrl,
  type CtoProject,
  type SourceVenueFilter,
} from '../data/ctoProjects';

type Project = CtoProject;

const projects = ctoProjects;

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
  { id: 'Trending', label: 'Trending', icon: Flame, title: 'Trending', subtitle: 'Strongest momentum right now.' },
  { id: 'Hot', label: 'Hot', icon: Zap, title: 'Hot', subtitle: 'Highest raid and messaging activity.' },
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

const tableCols =
  '190px 80px 72px 64px 88px 72px 52px 56px 48px 64px 148px 28px';
const tableColsPrelaunch =
  '30px 190px 80px 68px 56px 72px 64px 88px 72px 52px 56px 48px 64px 148px 64px 28px';

function formatLaunchLabel(hours: number | null): string {
  if (hours == null) return 'Live';
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

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

function TxVolumeBar({ project }: { project: Project }) {
  let hash = 0;
  for (let i = 0; i < project.ticker.length; i += 1) {
    hash = (hash * 31 + project.ticker.charCodeAt(i)) % 1000;
  }
  const bias = project.change24h >= 0 ? 12 : -12;
  const buyPct = Math.min(88, Math.max(12, 38 + (hash % 40) + bias));
  const sellPct = 100 - buyPct;
  return (
    <span
      className="inline-flex h-7 w-1.5 shrink-0 flex-col overflow-hidden rounded-[2px]"
      title={`Buys ${buyPct}% · Sells ${sellPct}%`}
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
  const [walletExplainerOpen, setWalletExplainerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'trade'>('list');
  const [selectedTicker, setSelectedTicker] = useState(projects[0]?.ticker ?? 'MPEG');
  const [voteNotice, setVoteNotice] = useState<string | null>(null);
  const { connected, connect, busy: walletBusy } = useConnectedWallet();
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
        matchesSourceVenue(project, venueFilter)
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
    sorted.sort((a, b) => compareByShortcut(a, b, activeShortcut, activeMode, activeTimeWindow));

    return sorted.map((project, index) => ({ ...project, rank: index + 1 }));
  }, [query, activeTimeWindow, activeShortcut, activeMode, voted, venueFilter]);

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
  }, [query, activeWindow, activeShortcut, activeMode, venueFilter]);

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
    const baseSubtitle = 'Discover new coins & trade with ready made communities';
    const venueNote =
      venueFilter === 'all' ? baseSubtitle : `${baseSubtitle} · ${venue.label}`;
    if (activeMode === 'Gainers') {
      const windowTab = timeWindows.find((tab) => tab.id === activeWindow);
      return {
        title: 'All tokens',
        subtitle: `Sorted by ${activeWindow} gainers — ${windowTab?.title ?? 'active movers'}. ${venueFilter === 'all' ? '' : `Venue: ${venue.label}.`}`.trim(),
      };
    }
    return { title: 'All tokens', subtitle: venueNote };
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
    <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
      <AppSidebar />
      <div className="relative z-[1]">
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

      <header className="border-b border-white/[0.07] bg-black">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-5">
          <a href="/" className="flex shrink-0 items-center gap-2" aria-label="CTOgo home">
            <CtoGoLogo size={36} className="rounded-xl" />
            <div className="hidden sm:block">
              <p className="font-serif text-lg font-bold leading-none tracking-tight">CTOgo</p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">Community takeover</p>
            </div>
          </a>

          <div className="relative min-w-0 flex-1 sm:max-w-md md:max-w-lg">
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
                className="h-10 w-full min-w-0 rounded-lg border border-white/[0.08] bg-white/[0.045] pl-9 pr-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40 sm:pr-11"
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
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-white/[0.1] bg-[#050505] shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
              >
                <div className="max-h-[min(70vh,420px)] overflow-y-auto py-2">
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

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
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
            <AppSidebarMenuButton />
          </div>
        </div>
      </header>

      <nav aria-label="Filter coins by exchange" className="border-b border-white/[0.06] bg-black">
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

      <main className={`mx-auto max-w-7xl px-3 sm:px-5 ${viewMode === 'trade' ? 'py-0' : 'py-3'}`}>
        {viewMode === 'trade' && selectedProject ? (
          <section id="cto-rankings" className="min-w-0 scroll-mt-4 pt-2">
            <CtoTradeView
              project={selectedProject}
              projects={visibleProjects}
              change={changeForWindow(selectedProject, activeTimeWindow)}
              onSelect={setSelectedTicker}
              onBack={() => setViewMode('list')}
              starred={Boolean(starred[selectedProject.ticker])}
              onToggleStar={() =>
                setStarred((prev) => ({
                  ...prev,
                  [selectedProject.ticker]: !prev[selectedProject.ticker],
                }))
              }
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
              <button
                type="button"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-2 text-[11px] text-white/45"
              >
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
                <div className={isPrelaunch ? 'min-w-[1280px]' : 'min-w-[1150px]'}>
                  <div
                    className="grid items-center gap-2 border-b border-white/[0.06] px-3 py-2.5 text-[10px] font-semibold text-white/30"
                    style={rankingGridStyle}
                  >
                    {isPrelaunch ? <span className="text-center">#</span> : null}
                    <span>Asset</span>
                    <span className="text-center">Chart</span>
                    {isPrelaunch ? (
                      <>
                        <span className="text-center">Vote</span>
                        <span className="text-right" title="Launch queue — highest votes first">
                          Queue
                        </span>
                      </>
                    ) : null}
                    <span className="text-right">Market Cap</span>
                    <span className="text-right">Volume</span>
                    <span className="text-right">TXs</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">Age</span>
                    <span className="text-right">Holders</span>
                    <span className="text-right" title="Messages per hour">MPH</span>
                    <span className="text-right" title="Raids and people engaging">Raids</span>
                    <span>Marketing wallet</span>
                    {isPrelaunch ? (
                      <span className="text-right">Votes ▾</span>
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
                      className="grid cursor-pointer items-center gap-2 border-b border-white/[0.05] px-3 py-3 last:border-0 hover:bg-white/[0.02]"
                      style={rankingGridStyle}
                    >
                      {isPrelaunch ? (
                        <span className="text-center text-xs text-white/35">{project.rank}</span>
                      ) : null}
                      <div className="flex w-[190px] items-start gap-2.5">
                        <ProjectMark project={project} size="h-9 w-9" rounded="rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-bold">{project.ticker}</p>
                            {project.verified && (
                              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-amber-300 text-[8px] font-black text-black">✓</span>
                            )}
                            {project.boost != null && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300">
                                <Zap className="h-3 w-3 fill-amber-300" />{project.boost}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] leading-snug text-white/55">{project.name}</p>
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
                      <span className="text-right text-xs font-semibold text-white/80">{project.volume24h}</span>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-white/70">{project.txs}</span>
                        <TxVolumeBar project={project} />
                      </div>
                      <span className="text-right text-xs font-medium">{project.price}</span>
                      <span
                        className={`text-right text-xs font-semibold ${
                          project.launchInHours == null ? 'text-emerald-300' : 'text-white/75'
                        }`}
                      >
                        {formatLaunchLabel(project.launchInHours)}
                      </span>
                      <span className="text-right text-xs text-white/70">{project.holders}</span>
                      <span className="text-right text-xs font-semibold text-[#c8ff3d]" title="Messages per hour">
                        {project.mph}
                      </span>
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${project.raidsActive > 0 ? 'text-[#c8ff3d]' : 'text-white/25'}`}>
                          {project.raidsActive > 0 ? `${project.raidsActive} raids` : '0 raids'}
                        </p>
                        <p className="text-[10px] text-white/40">{project.raidsJoined} eng.</p>
                      </div>
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
                            className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-left hover:bg-white/[0.07]"
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
                          setStarred((prev) => ({ ...prev, [project.ticker]: !prev[project.ticker] }));
                        }}
                        className="grid place-items-center text-white/20 hover:text-[#c8ff3d]"
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CtoGoLogo size={24} className="rounded-md" />
            <span>CTOgo · Solana CTO discovery</span>
          </div>
          <div className="flex gap-5">
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
    </div>
    </AppSidebarProvider>
  );
}
