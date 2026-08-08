import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownUp,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Eye,
  Filter,
  Globe,
  Layers,
  Pin,
  Rocket,
  Search,
  Users,
  Vault,
} from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { SolanaLogo } from '../components/SolanaLogo';
import { Sparkline } from '../components/Sparkline';
import { ConnectWalletButton, useConnectedWallet } from '../components/ConnectWalletButton';
import { NotificationsButton } from '../components/NotificationsButton';
import { PolessiaLogo } from '../components/PolessiaLogo';
import {
  AppSidebar,
  AppSidebarMenuButton,
  AppSidebarProvider,
} from '../components/AppSidebar';
import { ctoProjects, type CtoProject, SOURCE_VENUE_FILTERS, matchesSourceVenue, type SourceVenueFilter } from '../data/ctoProjects';
import { pinnedByTicker } from '../data/pinnedMessages';
import { useWatchlist } from '../hooks/useWatchlist';

const GROWTH_TIP_MAX_WIDTH = 280;
const GROWTH_TIP_MARGIN = 12;
const GROWTH_TIP_GAP = 8;
const GROWTH_STATUS_TIP =
  'Trading volume funds each coin’s marketing wallet. Every project sets its own roadmap — tap a logo to filter by stage.';

type TopTab = 'watchlist' | 'volume' | 'trending' | 'prelaunch';
type TimeWindow = '5m' | '1h' | '6h' | '24h';
type BottomTab = 'discover' | 'prelaunch' | 'growth' | 'portfolio' | 'bot';
type PrelaunchFilter = 'all' | 'live_soon' | 'with_vault';
type GrowthStageId =
  | 'telegram'
  | 'x'
  | 'dexscreener'
  | 'dextools'
  | 'coinzilla'
  | 'coingecko'
  | 'cmc'
  | 'ads';

type DemoHolding = {
  project: CtoProject;
  tokens: string;
  valueUsd: number;
  pnlPct: number;
};

const PRELAUNCH_FILTERS: {
  id: PrelaunchFilter;
  label: string;
  Icon: typeof Layers;
}[] = [
  { id: 'all', label: 'All', Icon: Layers },
  { id: 'live_soon', label: 'Live soon', Icon: Clock },
  { id: 'with_vault', label: 'With vault', Icon: Vault },
];

/** Marketing ladder shown on Growth — current stage per coin. */
const GROWTH_STAGES: {
  id: GrowthStageId;
  label: string;
  logo: string;
}[] = [
  { id: 'telegram', label: 'Telegram', logo: '/images/partners/telegram.svg' },
  { id: 'x', label: 'X', logo: '/images/partners/x.svg' },
  { id: 'dexscreener', label: 'DexScreener', logo: '/images/partners/dexscreener.ico' },
  { id: 'dextools', label: 'DexTools', logo: '/images/partners/dextools.svg' },
  { id: 'coinzilla', label: 'Coinzilla', logo: '/images/partners/coinzilla.png' },
  { id: 'coingecko', label: 'CoinGecko', logo: '/images/partners/coingecko.png' },
  { id: 'cmc', label: 'CoinMarketCap', logo: '/images/partners/coinmarketcap.png' },
  { id: 'ads', label: 'Ad networks', logo: '/images/partners/cointraffic.svg' },
];

/** Demo social links until projects carry live URLs. */
function projectSocials(project: CtoProject) {
  const slug = project.ticker.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ctogo';
  return {
    x: `https://x.com/${slug}`,
    telegram: `https://t.me/${slug}`,
    website: `https://${slug}.fun`,
  };
}

function XLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const CHAINS = [
  { id: 'SOL', label: 'SOL' },
  { id: 'BSC', label: 'BSC' },
] as const;

function volumeUsd(project: CtoProject): number {
  const raw = project.volume24h.replace(/[^0-9.]/g, '');
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  if (project.volume24h.includes('M')) return n * 1_000_000;
  if (project.volume24h.includes('K')) return n * 1_000;
  return n;
}

function marketingBalanceUsd(project: CtoProject): number {
  const raw = (project.marketingBalance || '').replace(/[^0-9.]/g, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Next Polessia-style supplier for Growth tab (demo until live queue). */
function nextSupplier(project: CtoProject): {
  label: string;
  logo: string;
  priceUsd: number;
} {
  const stage = growthStageFor(project);
  const meta = GROWTH_STAGES.find((s) => s.id === stage) ?? GROWTH_STAGES[0];
  const spend = (project.nextAdSpend || '').toLowerCase();
  if (spend.includes('telegram') || spend.includes('pin')) {
    return { label: 'Pinned message · Telegram', logo: meta.logo, priceUsd: 150 };
  }
  if (spend.includes('trend')) {
    return { label: 'DexScreener trending bar', logo: meta.logo, priceUsd: 2000 };
  }
  return { label: `${meta.label} · next spend`, logo: meta.logo, priceUsd: 350 };
}

function mwProgress(project: CtoProject): { balance: number; target: number; pct: number } {
  const balance = marketingBalanceUsd(project);
  const target = Math.max(1, project.nextAdTargetUsd || 500);
  const pct = Math.min(100, Math.round((balance / target) * 100));
  return { balance, target, pct };
}

/** Demo marketing stage from spend target + wallet fill. */
function growthStageFor(project: CtoProject): GrowthStageId {
  const spend = (project.nextAdSpend || '').toLowerCase();
  if (spend.includes('telegram') || spend.includes('pin')) return 'telegram';
  if (spend.includes('twitter') || spend.includes(' x ') || spend === 'x') return 'x';
  if (spend.includes('trend')) return 'dexscreener';
  if (spend.includes('social')) return 'dexscreener';
  const { pct } = mwProgress(project);
  if (pct < 14) return 'telegram';
  if (pct < 28) return 'x';
  if (pct < 42) return 'dexscreener';
  if (pct < 55) return 'dextools';
  if (pct < 68) return 'coinzilla';
  if (pct < 80) return 'coingecko';
  if (pct < 92) return 'cmc';
  return 'ads';
}

function salt(str: string, mod = 1000): number {
  let s = 0;
  for (let i = 0; i < str.length; i += 1) s = (s * 31 + str.charCodeAt(i)) % mod;
  return s;
}

function ageLabel(project: CtoProject): string {
  // null launchInHours = older live coin — demo age past the OG threshold
  const hours =
    project.launchInHours != null ? project.launchInHours : 72 + salt(project.ticker, 200);
  if (hours >= 72) return 'OG';
  if (hours < 1) return '<1h';
  if (hours < 24) return `${Math.max(1, Math.round(hours))}h`;
  return `${Math.round(hours / 24)}d`;
}

function viewingCount(project: CtoProject): string {
  const n = 40 + salt(project.ticker + 'view', 900);
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
  return String(n);
}

function holdersNum(project: CtoProject): string {
  const raw = project.holders.replace(/[^0-9.]/g, '');
  const n = Number(raw);
  if (!Number.isFinite(n)) return project.holders;
  if (project.holders.includes('K')) return String(Math.round(n * 1000));
  return String(Math.round(n));
}

function changeForWindow(project: CtoProject, window: TimeWindow): number {
  switch (window) {
    case '5m':
      return project.change5m ?? project.change24h * 0.05;
    case '1h':
      return project.change1h ?? project.change24h * 0.2;
    case '6h':
      return project.change6h ?? project.change24h * 0.5;
    default:
      return project.change24h;
  }
}

function peakLabelFor(ticker: string, change24h: number): string {
  const h = salt(ticker, 10_000);
  const peakX = Math.max(1.2, Math.min(99, Math.abs(change24h) / 14 + 1.4 + ((h % 90) + 1) / 10));
  return `${peakX.toFixed(1)}x`;
}

function formatPct(n: number): string {
  const abs = Math.abs(n);
  const body =
    abs >= 1000 ? `${(abs / 1000).toFixed(2)}K` : abs >= 100 ? abs.toFixed(1) : abs.toFixed(2);
  return `${n >= 0 ? '+' : '-'}${body}%`;
}

function formatHoldingUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

/** Demo wallet holdings until live SPL balances are wired. */
function demoHoldingsForWallet(address: string | null): DemoHolding[] {
  if (!address) return [];
  const live = ctoProjects.filter((p) => p.stage === 'Live' || p.launchInHours == null);
  const pool = live.length ? live : ctoProjects;
  const count = Math.min(pool.length, 3 + salt(address, 2));
  const out: DemoHolding[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i += 1) {
    const idx = salt(`${address}-hold-${i}`, pool.length);
    const project = pool[idx];
    if (!project || used.has(project.ticker)) continue;
    used.add(project.ticker);
    const tokens = 1_200 + salt(`${address}${project.ticker}`, 88_000);
    const valueUsd = 18 + salt(`${project.ticker}${address}`, 420) / 10;
    const pnlPct = ((salt(`${address}-pnl-${project.ticker}`, 800) - 320) / 10);
    out.push({
      project,
      tokens: tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}K` : String(tokens),
      valueUsd,
      pnlPct,
    });
  }
  return out.sort((a, b) => b.valueUsd - a.valueUsd);
}

function ChainDot({ id }: { id: string }) {
  if (id === 'SOL') return <SolanaLogo className="h-3.5 w-3.5" />;
  if (id === 'BSC') {
    return (
      <img
        src="/images/partners/bsc.png"
        alt=""
        className="h-3.5 w-3.5 object-contain"
      />
    );
  }
  return <span className="h-3.5 w-3.5 rounded-full bg-white/30" />;
}

function GrowthIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 16.5 9.2 11l3.3 3.2L20 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 7H20v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AliveNavGlyph({
  alive,
  children,
}: {
  alive: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`relative grid h-9 w-9 place-items-center ${
        alive ? 'growth-nav-alive text-[#c8ff3d]' : ''
      }`}
    >
      {alive ? (
        <>
          <span className="growth-nav-glow absolute inset-0 rounded-full" aria-hidden />
          <span className="growth-spark growth-spark-a" aria-hidden />
          <span className="growth-spark growth-spark-b" aria-hidden />
          <span className="growth-spark growth-spark-c" aria-hidden />
          <span className="growth-spark growth-spark-d" aria-hidden />
        </>
      ) : null}
      <span className="relative z-[1] grid place-items-center">{children}</span>
    </span>
  );
}

function BotIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="5" y="8" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4.5v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="4.2" r="1.2" fill="currentColor" />
      <circle cx="9.2" cy="13" r="1.15" fill="currentColor" />
      <circle cx="14.8" cy="13" r="1.15" fill="currentColor" />
      <path d="M9 16.2h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DiscoverDeckPage() {
  const navigate = useNavigate();
  const { address, connected, connect, busy: walletBusy } = useConnectedWallet();
  const { starred, count: watchCount } = useWatchlist();
  const listRef = useRef<HTMLDivElement>(null);
  const [topTab, setTopTab] = useState<TopTab>('trending');
  const [bottomTab, setBottomTab] = useState<BottomTab>('growth');
  const [chain, setChain] = useState<string>('SOL');
  const [source, setSource] = useState<SourceVenueFilter>('all');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1h');
  const [query, setQuery] = useState('');
  const [showTop, setShowTop] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [peakTickers, setPeakTickers] = useState<string[]>([]);
  const [prelaunchFilter, setPrelaunchFilter] = useState<PrelaunchFilter>('all');
  const [growthStageFilter, setGrowthStageFilter] = useState<GrowthStageId | 'all'>('all');
  const [growthTipOpen, setGrowthTipOpen] = useState(false);
  const growthStatusRef = useRef<HTMLButtonElement>(null);
  const growthTipId = useId();
  const [growthTipStyle, setGrowthTipStyle] = useState<CSSProperties>({});
  const isPrelaunchView = bottomTab === 'prelaunch';
  const isPortfolioView = bottomTab === 'portfolio';
  const isGrowthView = bottomTab === 'growth';
  const hideDiscoverChrome =
    bottomTab === 'growth' || bottomTab === 'bot' || bottomTab === 'prelaunch' || isPortfolioView;

  const rows = useMemo(() => {
    let list = [...ctoProjects];
    if (topTab === 'watchlist') {
      list = list.filter((p) => starred[p.ticker]);
    } else if (topTab === 'volume') {
      list = [...list].sort((a, b) => volumeUsd(b) - volumeUsd(a));
    } else if (topTab === 'prelaunch' || bottomTab === 'prelaunch') {
      list = list
        .filter((p) => p.stage !== 'Live' && p.launchInHours != null)
        .filter((p) => {
          if (prelaunchFilter === 'live_soon') {
            return (p.launchInHours ?? 999) <= 24;
          }
          if (prelaunchFilter === 'with_vault') {
            return Boolean(p.marketingWallet || p.marketingWalletAddress);
          }
          return true;
        })
        .sort(
          (a, b) =>
            (a.launchInHours ?? Number.POSITIVE_INFINITY) -
            (b.launchInHours ?? Number.POSITIVE_INFINITY),
        );
    } else {
      list = [...list].sort((a, b) => changeForWindow(b, timeWindow) - changeForWindow(a, timeWindow));
    }
    if (source !== 'all') {
      list = list.filter((p) => matchesSourceVenue(p, source));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ticker.toLowerCase().includes(q),
      );
    }
    // SOL-only product — other chains show empty for now
    if (chain !== 'SOL') return [];
    return list;
  }, [topTab, bottomTab, starred, timeWindow, query, chain, source, prelaunchFilter]);

  const growthRows = useMemo(() => {
    let list = [...ctoProjects]
      .filter((p) => Boolean(p.marketingBalance || p.marketingWallet))
      .sort((a, b) => marketingBalanceUsd(b) - marketingBalanceUsd(a));
    if (growthStageFilter !== 'all') {
      list = list.filter((p) => growthStageFor(p) === growthStageFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ticker.toLowerCase().includes(q),
      );
    }
    return list;
  }, [growthStageFilter, query]);

  const growthStageCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const counts = Object.fromEntries(GROWTH_STAGES.map((s) => [s.id, 0])) as Record<
      GrowthStageId,
      number
    >;
    let total = 0;
    for (const p of ctoProjects) {
      if (!p.marketingBalance && !p.marketingWallet) continue;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.ticker.toLowerCase().includes(q)
      ) {
        continue;
      }
      counts[growthStageFor(p)] += 1;
      total += 1;
    }
    return { counts, total };
  }, [query]);

  const portfolioHoldings = useMemo(() => {
    const holdings = demoHoldingsForWallet(address);
    const q = query.trim().toLowerCase();
    if (!q) return holdings;
    return holdings.filter(
      (h) =>
        h.project.name.toLowerCase().includes(q) ||
        h.project.ticker.toLowerCase().includes(q),
    );
  }, [address, query]);

  const portfolioTotalUsd = useMemo(
    () => portfolioHoldings.reduce((sum, h) => sum + h.valueUsd, 0),
    [portfolioHoldings],
  );

  const selectBottom = (tab: BottomTab) => {
    setBottomTab(tab);
    setShowPinned(false);
    if (tab === 'prelaunch') {
      setTopTab('prelaunch');
    } else if (topTab === 'prelaunch') {
      setTopTab('trending');
    }
    if (tab !== 'growth') {
      setGrowthStageFilter('all');
      setGrowthTipOpen(false);
    }
  };

  useEffect(() => {
    if (!growthTipOpen) return;

    const updatePosition = () => {
      const button = growthStatusRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = Math.min(GROWTH_TIP_MAX_WIDTH, window.innerWidth - GROWTH_TIP_MARGIN * 2);
      const half = width / 2;
      let left = rect.left + rect.width / 2;
      left = Math.max(
        GROWTH_TIP_MARGIN + half,
        Math.min(left, window.innerWidth - GROWTH_TIP_MARGIN - half),
      );
      let top = rect.bottom + GROWTH_TIP_GAP;
      const estimatedHeight = 120;
      if (top + estimatedHeight > window.innerHeight - GROWTH_TIP_MARGIN) {
        top = Math.max(GROWTH_TIP_MARGIN, rect.top - GROWTH_TIP_GAP - estimatedHeight);
      }
      setGrowthTipStyle({
        position: 'fixed',
        top,
        left,
        width,
        transform: 'translateX(-50%)',
        zIndex: 70,
      });
    };

    updatePosition();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGrowthTipOpen(false);
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [growthTipOpen]);

  const goBuy = () => {
    setBottomTab('discover');
    setTopTab('trending');
    setShowPinned(false);
  };

  const pinnedFeed = useMemo(
    () =>
      rows.flatMap((project) => {
        const pin = pinnedByTicker[project.ticker];
        return pin ? [{ project, pin }] : [];
      }),
    [rows],
  );

  useEffect(() => {
    if (showPinned || rows.length === 0) {
      setPeakTickers([]);
      return;
    }
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let hideTimer: number | undefined;
    let cycle = 0;
    const pick = () => {
      const pool = rows.slice(0, Math.min(8, rows.length));
      const count = Math.min(3, pool.length);
      const picked: string[] = [];
      for (let i = 0; i < count; i += 1) {
        const idx = (cycle + i * 2) % pool.length;
        const ticker = pool[idx]?.ticker;
        if (ticker && !picked.includes(ticker)) picked.push(ticker);
      }
      cycle += 1;
      setPeakTickers(picked);
      hideTimer = window.setTimeout(() => setPeakTickers([]), 2600);
    };

    pick();
    const interval = window.setInterval(pick, 8500);
    return () => {
      window.clearInterval(interval);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [rows, showPinned]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setShowTop(el.scrollTop > 280);
  };

  return (
    <AppSidebarProvider>
    <div className="deck-shell fixed inset-0 z-[40] flex flex-col bg-black text-white">
      <AppSidebar side="left" />
      {/* Top search row */}
      <div className="flex shrink-0 items-center gap-2 px-3 pb-3.5 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <AppSidebarMenuButton icon="hexagon" />
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔥 CTOgo"
            className="h-9 w-full rounded-full border-0 bg-[#1c1c1e] pl-9 pr-3 text-[14px] font-medium text-white outline-none placeholder:text-white/40"
          />
        </label>
        <ConnectWalletButton className="shrink-0" alwaysLabel defaultOpen />
        <NotificationsButton className="shrink-0" />
        <button
          type="button"
          onClick={() => navigate('/')}
          className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1c1c1e] ring-1 ring-white/10"
          aria-label="Home"
        >
          <CtoGoLogo size={28} className="rounded-full" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 items-end gap-5 border-b border-white/[0.08] px-4">
        {(
          [
            { id: 'watchlist' as const, label: 'Watchlist' },
            { id: 'volume' as const, label: 'Volume' },
            { id: 'trending' as const, label: 'Trending' },
          ] as const
        ).map((tab) => {
          const active = topTab === tab.id && !hideDiscoverChrome;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setTopTab(tab.id);
                setBottomTab('discover');
                setShowPinned(false);
              }}
              className={`relative pb-2.5 text-[15px] font-semibold transition ${
                active ? 'text-white' : 'text-white/40'
              }`}
            >
              {tab.label}
              {tab.id === 'watchlist' && watchCount > 0 ? (
                <span className="ml-1 text-[11px] font-bold text-[#c8ff3d]">{watchCount}</span>
              ) : null}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px mx-auto h-[2.5px] w-8 rounded-full bg-white" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* List / Launch — or Portfolio Buy */}
      {isPortfolioView ? (
        <div className="flex shrink-0 flex-col gap-2 px-3 pb-1 pt-2.5">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/35">
                Portfolio value
              </p>
              <p className="mt-0.5 text-[18px] font-bold tabular-nums text-white">
                {connected ? formatHoldingUsd(portfolioTotalUsd) : '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={goBuy}
              className="inline-flex h-9 min-w-[5.5rem] items-center justify-center rounded-full bg-[#c8ff3d] px-5 text-[13px] font-bold text-[#090b14] transition active:brightness-95"
            >
              Buy
            </button>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 gap-2 px-3 pb-1 pt-2.5">
          <Link
            to="/launch?mode=list"
            className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-[#c8ff3d] text-[13px] font-bold text-[#090b14] transition active:brightness-95"
          >
            List CTO
          </Link>
          <Link
            to="/launch"
            className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-white/[0.12] bg-[#1c1c1e] text-[13px] font-semibold text-white/85 transition active:bg-[#2a2a2c]"
          >
            Launch CTO
          </Link>
        </div>
      )}

      {/* Chain chips + sources */}
      {!isPortfolioView && bottomTab !== 'bot' ? (
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2 pt-2">
        <div className="flex shrink-0 gap-2">
          {CHAINS.map((c) => {
            const active = chain === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChain(c.id)}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ${
                  active
                    ? 'bg-[#2a2a2c] text-white'
                    : 'bg-[#1c1c1e] text-white/70'
                }`}
              >
                <ChainDot id={c.id} />
                {c.label}
              </button>
            );
          })}
        </div>

        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-white/35">
          source:
        </p>
        <div className="hide-scrollbar min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-1.5 pr-1">
            {SOURCE_VENUE_FILTERS.map((venue) => {
              const active = source === venue.id;
              const label = venue.id === 'all' ? 'All' : venue.label;
              return (
                <button
                  key={venue.id}
                  type="button"
                  title={venue.title}
                  aria-pressed={active}
                  onClick={() => setSource(venue.id)}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold ${
                    active
                      ? 'bg-[#2a2a2c] text-white'
                      : 'bg-[#1c1c1e] text-white/65'
                  }`}
                >
                  {venue.logoSrc ? (
                    <img
                      src={venue.logoSrc}
                      alt=""
                      className="h-3.5 w-3.5 shrink-0 rounded-[3px] object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      ) : null}

      {/* Filter row */}
      {isPortfolioView || bottomTab === 'bot' ? null : isPrelaunchView ? (
        <div className="shrink-0 px-3 pb-2.5 pt-0.5">
          <div
            className="flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            role="tablist"
            aria-label="Prelaunch filters"
          >
            {PRELAUNCH_FILTERS.map((f) => {
              const active = prelaunchFilter === f.id;
              const Icon = f.Icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  onClick={() => setPrelaunchFilter(f.id)}
                  className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] transition ${
                    active
                      ? 'bg-white/[0.1] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.12]'
                      : 'font-medium text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                  }`}
                  aria-selected={active}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[#c8ff3d]' : 'text-white/35'}`}
                    strokeWidth={2}
                  />
                  <span className="truncate">{f.label}</span>
                  {active ? (
                    <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-[#c8ff3d]/80 to-transparent" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : isGrowthView ? (
        <div className="sticky top-0 z-[5] shrink-0 space-y-2 border-b border-white/[0.06] bg-black px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setTimeWindow((w) =>
                  w === '1h' ? '5m' : w === '5m' ? '6h' : w === '6h' ? '24h' : '1h',
                )
              }
              className="inline-flex h-8 items-center gap-1 rounded-full bg-[#1c1c1e] px-3 text-[13px] font-semibold text-white/85"
            >
              {timeWindow}
              <ChevronDown className="h-3.5 w-3.5 text-white/45" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-[#1c1c1e] px-3 text-[13px] font-semibold text-white/85"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-white/55" />
              Token sort
              <ChevronDown className="h-3.5 w-3.5 text-white/45" />
            </button>
            <button
              ref={growthStatusRef}
              type="button"
              onClick={() => setGrowthTipOpen((v) => !v)}
              className="ml-auto flex flex-col items-end gap-0.5 rounded-md px-1 py-0.5 text-right transition hover:bg-white/[0.04]"
              aria-expanded={growthTipOpen}
              aria-describedby={growthTipOpen ? growthTipId : undefined}
              aria-label="Marketing stage — tap for explanation"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45 underline decoration-white/25 underline-offset-2">
                Marketing stage
              </p>
              <PolessiaLogo variant="powered" size="xs" />
            </button>
          </div>
          <div className="overflow-x-auto px-0.5 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max items-center gap-2 pr-1">
              <button
                type="button"
                onClick={() => setGrowthStageFilter('all')}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition ${
                  growthStageFilter === 'all'
                    ? 'bg-[#c8ff3d]/15 text-[#d5ff69] ring-1 ring-[#c8ff3d]/45'
                    : 'bg-[#1c1c1e] text-white/45 ring-1 ring-white/[0.06] hover:text-white/75'
                }`}
                aria-pressed={growthStageFilter === 'all'}
              >
                All
                <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/70">
                  {growthStageCounts.total}
                </span>
              </button>
              {GROWTH_STAGES.map((stage) => {
                const active = growthStageFilter === stage.id;
                const count = growthStageCounts.counts[stage.id];
                return (
                  <button
                    key={stage.id}
                    type="button"
                    title={`${stage.label} · ${count} coin${count === 1 ? '' : 's'}`}
                    onClick={() =>
                      setGrowthStageFilter((prev) => (prev === stage.id ? 'all' : stage.id))
                    }
                    className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                      active
                        ? 'bg-[#c8ff3d]/15 ring-2 ring-[#c8ff3d]/70'
                        : 'bg-[#1c1c1e] ring-1 ring-white/[0.08] hover:ring-white/20'
                    }`}
                    aria-pressed={active}
                    aria-label={`${stage.label}: ${count} coins`}
                  >
                    <img
                      src={stage.logo}
                      alt=""
                      className="h-5 w-5 object-contain"
                      loading="lazy"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 z-[1] grid h-3.5 min-w-3.5 place-items-center rounded-full px-0.5 text-[8px] font-bold tabular-nums ring-1 ${
                        count > 0
                          ? 'bg-[#c8ff3d] text-[#090b14] ring-[#c8ff3d]/35'
                          : 'bg-[#0c0c0e] text-white/55 ring-white/10'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {growthTipOpen && typeof document !== 'undefined'
            ? createPortal(
                <>
                  <button
                    type="button"
                    aria-label="Close marketing stage tip"
                    className="fixed inset-0 z-[60] cursor-default bg-transparent"
                    onClick={() => setGrowthTipOpen(false)}
                  />
                  <div
                    id={growthTipId}
                    role="tooltip"
                    style={growthTipStyle}
                    className="rounded-lg border border-white/12 bg-[#0c1018] px-3 py-2.5 text-left shadow-xl shadow-black/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[11px] font-semibold text-white">Marketing stage</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                      {GROWTH_STATUS_TIP}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-2">
                      <PolessiaLogo variant="powered" size="xs" />
                      <Link
                        to="/marketing-wallet"
                        onClick={() => setGrowthTipOpen(false)}
                        className="shrink-0 text-[11px] font-semibold text-[#c8ff3d]/90 hover:text-[#d5ff69]"
                      >
                        How it works
                      </Link>
                    </div>
                  </div>
                </>,
                document.body,
              )
            : null}
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-2 px-3 pb-2">
            <button
              type="button"
              onClick={() =>
                setTimeWindow((w) =>
                  w === '1h' ? '5m' : w === '5m' ? '6h' : w === '6h' ? '24h' : '1h',
                )
              }
              className="inline-flex h-8 items-center gap-1 rounded-full bg-[#1c1c1e] px-3 text-[13px] font-semibold text-white/85"
            >
              {timeWindow}
              <ChevronDown className="h-3.5 w-3.5 text-white/45" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-[#1c1c1e] px-3 text-[13px] font-semibold text-white/85"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-white/55" />
              Token sort
              <ChevronDown className="h-3.5 w-3.5 text-white/45" />
            </button>
            <button
              type="button"
              onClick={() => setShowPinned((v) => !v)}
              className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold ${
                showPinned
                  ? 'bg-[#c8ff3d]/15 text-[#d5ff69] ring-1 ring-[#c8ff3d]/40'
                  : 'bg-[#1c1c1e] text-white/85'
              }`}
              aria-pressed={showPinned}
            >
              <Pin className="h-3.5 w-3.5" />
              Pinned
            </button>
            <button
              type="button"
              className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1c1c1e] text-white/80"
              aria-label="Filters"
            >
              <Filter className="h-[15px] w-[15px]" />
            </button>
          </div>
        </>
      )}

      {/* Column headers */}
      {bottomTab === 'bot' ? (
        <div className="px-3 pb-1 text-[10px] font-medium text-white/35">CTOgo Bot</div>
      ) : isPortfolioView ? (
        <div className="grid shrink-0 grid-cols-[42px_minmax(0,1fr)_44px_4.25rem_3.75rem] items-center gap-x-1.5 px-3 pb-1 text-[10px] font-medium text-white/35">
          <div className="col-span-2">Holding / Qty</div>
          <div className="text-center">Chart</div>
          <div className="text-right">Value / PnL</div>
          <div className="text-right">Trade</div>
        </div>
      ) : showPinned && bottomTab !== 'growth' && !isPrelaunchView ? (
        <div className="px-3 pb-1 text-[10px] font-medium text-white/35">
          Pinned Telegram messages
        </div>
      ) : isPrelaunchView ? (
        <div className="grid shrink-0 grid-cols-[42px_minmax(0,1fr)_minmax(6.5rem,8rem)] items-center gap-x-1.5 px-3 pb-1 text-[10px] font-medium text-white/35">
          <div className="col-span-2">Age / Holders / Viewing</div>
          <div className="text-right">X · TG · Web</div>
        </div>
      ) : (
        <div className="grid shrink-0 grid-cols-[42px_minmax(0,1fr)_44px_4.25rem_4.5rem] items-center gap-x-1.5 px-3 pb-1 text-[10px] font-medium text-white/35">
          <div className="col-span-2">Age / Holders / Viewing</div>
          <div className="text-center">Chart</div>
          {bottomTab === 'growth' ? (
            <>
              <div className="text-right">MW / Next</div>
              <div className="text-right">Fill</div>
            </>
          ) : (
            <>
              <div className="text-right">Vol / TXs</div>
              <div className="text-right">MC / {timeWindow}%</div>
            </>
          )}
        </div>
      )}

      {/* List */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[5.5rem]"
      >
        {bottomTab === 'bot' ? (
          <div className="px-5 py-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-white/80 ring-1 ring-white/10">
              <BotIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 text-[17px] font-bold text-white">CTOgo Bot</p>
            <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-white/45">
              Auto-buy, alerts, and raid helpers for CTOgo coins. Connect a wallet when the bot goes
              live — this tab is the home for it.
            </p>
            <Link
              to="/launch"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#c8ff3d] px-5 text-[13px] font-bold text-[#090b14]"
            >
              List or launch a CTO
            </Link>
          </div>
        ) : isPortfolioView ? (
          !connected ? (
            <div className="px-5 py-12 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-white/80 ring-1 ring-white/10">
                <Briefcase className="h-7 w-7" />
              </span>
              <p className="mt-4 text-[17px] font-bold text-white">Your holdings</p>
              <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-white/45">
                Connect a wallet to see tokens you hold on CTOgo.
              </p>
              <button
                type="button"
                disabled={walletBusy}
                onClick={() => void connect()}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#c8ff3d] px-5 text-[13px] font-bold text-[#090b14] disabled:opacity-60"
              >
                {walletBusy ? 'Connecting…' : 'Connect wallet'}
              </button>
              <button
                type="button"
                onClick={goBuy}
                className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-white/[0.12] px-5 text-[13px] font-semibold text-white/80"
              >
                Buy
              </button>
            </div>
          ) : portfolioHoldings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[15px] font-semibold text-white/70">No holdings yet</p>
              <p className="mt-1 text-[13px] text-white/35">
                Buy a CTOgo coin and it will show up here.
              </p>
              <button
                type="button"
                onClick={goBuy}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#c8ff3d] px-5 text-[13px] font-bold text-[#090b14]"
              >
                Buy
              </button>
            </div>
          ) : (
            <ul>
              {portfolioHoldings.map((holding) => {
                const { project } = holding;
                const up = holding.pnlPct >= 0;
                return (
                  <li key={project.ticker}>
                    <div className="grid w-full grid-cols-[42px_minmax(0,1fr)_44px_4.25rem_3.75rem] items-center gap-x-1.5 border-b border-white/[0.06] px-3 py-[9px]">
                      <button
                        type="button"
                        onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                        className="relative shrink-0 text-left"
                        aria-label={`Open $${project.ticker}`}
                      >
                        <span className="block h-[42px] w-[42px] overflow-hidden rounded-[10px] bg-[#1c1c1e] ring-1 ring-white/10">
                          <img
                            src={project.logo}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </span>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 grid h-[15px] w-[15px] place-items-center overflow-hidden rounded-full bg-black ring-2 ring-black"
                          title="Solana"
                          aria-label="Solana"
                        >
                          <img
                            src="/images/partners/solana.svg"
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                        className="min-w-0 pr-0.5 text-left"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="min-w-0 truncate text-[14px] font-semibold leading-none text-white">
                            {project.name}
                          </p>
                          <span className="shrink-0 rounded-[4px] bg-[#2a2a2c] px-1.5 py-[2px] text-[10px] font-semibold leading-none text-white/55">
                            ${project.ticker}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium tabular-nums leading-none text-white/40">
                          {holding.tokens} tokens
                        </p>
                      </button>

                      <div className="flex items-center justify-center">
                        <Sparkline
                          seed={`${project.ticker}-portfolio`}
                          changePct={holding.pnlPct}
                          width={40}
                          height={22}
                        />
                      </div>

                      <div className="min-w-0 text-right">
                        <p className="truncate text-[13px] font-semibold tabular-nums leading-none text-white">
                          {formatHoldingUsd(holding.valueUsd)}
                        </p>
                        <p
                          className={`mt-1 truncate text-[11px] font-medium tabular-nums leading-none ${
                            up ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatPct(holding.pnlPct)}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                          className="inline-flex h-8 items-center justify-center rounded-full bg-[#c8ff3d] px-2.5 text-[11px] font-bold text-[#090b14] active:brightness-95"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : showPinned && bottomTab !== 'growth' ? (
          pinnedFeed.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-white/70">No pinned messages</p>
              <p className="mt-1 text-[13px] text-white/35">
                Public TG pins for CTOs will show up here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 px-3 pb-2">
              {pinnedFeed.map(({ project, pin }) => (
                <li key={project.ticker}>
                  <button
                    type="button"
                    onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                    className="w-full rounded-2xl border border-white/[0.08] bg-[#121214] p-3 text-left active:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-[10px] bg-[#1c1c1e] ring-1 ring-white/10">
                        <img
                          src={project.logo}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="truncate text-[15px] font-bold text-white">
                            ${project.ticker}
                          </p>
                          <p className="truncate text-[12px] text-white/40">{project.name}</p>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/35">
                          <img src="/images/partners/telegram.svg" alt="" className="h-3 w-3" />
                          {project.community} · public TG
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#c8ff3d]/12 px-2 py-1 text-[10px] font-semibold text-[#d5ff69]">
                        <Pin className="h-3 w-3" />
                        {pin.when}
                      </span>
                    </div>
                    <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-white/65">
                      {pin.text}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (bottomTab === 'growth' ? growthRows : rows).length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-white/70">
              {bottomTab === 'growth'
                ? growthStageFilter !== 'all'
                  ? `No coins at ${GROWTH_STAGES.find((s) => s.id === growthStageFilter)?.label ?? 'this'} stage`
                  : 'No marketing wallets yet'
                : chain !== 'SOL'
                  ? `${chain} coming soon`
                  : 'No tokens yet'}
            </p>
            <p className="mt-1 text-[13px] text-white/35">
              {bottomTab === 'growth'
                ? growthStageFilter !== 'all'
                  ? 'Tap All stages or another logo to see more.'
                  : 'Coins with a CTOgo marketing wallet show fill progress here.'
                : topTab === 'watchlist'
                  ? 'Star coins on classic view to fill your watchlist.'
                  : topTab === 'prelaunch'
                    ? 'No staging CTOs right now — Launch a CTO to appear here.'
                    : 'CTOgo is Solana-first for now.'}
            </p>
            {bottomTab !== 'growth' ? (
              <Link
                to="/home"
                className="mt-5 inline-flex rounded-full bg-[#c8ff3d] px-4 py-2 text-[13px] font-bold text-[#090b14]"
              >
                Classic view
              </Link>
            ) : null}
          </div>
        ) : (
          <ul>
            {(bottomTab === 'growth' ? growthRows : rows).map((project) => {
              const pct = changeForWindow(project, timeWindow);
              const up = pct >= 0;
              const showPeak = peakTickers.includes(project.ticker);
              const fill = bottomTab === 'growth' ? mwProgress(project) : null;
              const supplier = bottomTab === 'growth' ? nextSupplier(project) : null;
              return (
                <li key={project.ticker}>
                  <button
                    type="button"
                    onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                    className={`grid w-full items-center gap-x-1.5 border-b border-white/[0.06] px-3 py-[9px] text-left active:bg-white/[0.03] ${
                      isPrelaunchView
                        ? 'grid-cols-[42px_minmax(0,1fr)_minmax(6.5rem,8rem)]'
                        : 'grid-cols-[42px_minmax(0,1fr)_44px_4.25rem_4.5rem]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <span className="block h-[42px] w-[42px] overflow-hidden rounded-[10px] bg-[#1c1c1e] ring-1 ring-white/10">
                        <img
                          src={project.logo}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 grid h-[15px] w-[15px] place-items-center overflow-hidden rounded-full bg-black ring-2 ring-black"
                        title="Solana"
                        aria-label="Solana"
                      >
                        <img
                          src="/images/partners/solana.svg"
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </span>
                    </div>

                    <div className="min-w-0 pr-0.5">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="min-w-0 truncate text-[14px] font-semibold leading-none text-white">
                          {project.name}
                        </p>
                        <span
                          className={`shrink-0 rounded-[4px] px-1.5 py-[2px] text-[10px] font-semibold leading-none ${
                            ageLabel(project) === 'OG'
                              ? 'bg-[#2a2a2c] tracking-wide text-amber-300'
                              : 'bg-[#2a2a2c] tabular-nums text-emerald-400'
                          }`}
                        >
                          {ageLabel(project)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2.5 text-[11px] font-medium tabular-nums leading-none text-white/40">
                        <span className="inline-flex items-center gap-0.5">
                          <Users className="h-3 w-3" strokeWidth={2} />
                          {holdersNum(project)}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Eye className="h-3 w-3" strokeWidth={2} />
                          {viewingCount(project)}
                        </span>
                      </div>
                    </div>

                    {!isPrelaunchView ? (
                      <div className="flex items-center justify-center">
                        <Sparkline
                          seed={`${project.ticker}-${timeWindow}`}
                          changePct={pct}
                          width={40}
                          height={22}
                        />
                      </div>
                    ) : null}

                    {fill && supplier ? (
                      <>
                        <div className="min-w-0 text-right">
                          <p className="truncate text-[13px] font-semibold tabular-nums leading-none text-[#d5ff69]">
                            {project.marketingBalance || `$${fill.balance}`}
                          </p>
                          <p className="mt-1 flex items-center justify-end gap-1 truncate text-[11px] font-medium leading-none text-white/40">
                            <img
                              src={supplier.logo}
                              alt=""
                              className="h-3 w-3 shrink-0 rounded-sm object-contain"
                            />
                            <span className="truncate">${fill.target}</span>
                          </p>
                        </div>
                        <div className="min-w-0">
                          <div
                            className="h-[3px] overflow-hidden rounded-full bg-white/[0.08]"
                            role="progressbar"
                            aria-valuenow={fill.pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Marketing wallet ${fill.pct}% to next spend`}
                          >
                            <div
                              className={`h-full rounded-full transition-[width] ${
                                fill.pct >= 100 ? 'bg-emerald-400' : 'bg-[#c8ff3d]'
                              }`}
                              style={{ width: `${Math.max(fill.pct, fill.pct > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                          <p className="mt-1 truncate text-right text-[11px] font-semibold tabular-nums leading-none text-white/55">
                            {fill.pct}%
                          </p>
                        </div>
                      </>
                    ) : isPrelaunchView ? (
                      <div className="flex items-center justify-end gap-1.5">
                        {(() => {
                          const socials = projectSocials(project);
                          return (
                            <>
                              <a
                                href={socials.x}
                                target="_blank"
                                rel="noreferrer"
                                title="X / Twitter"
                                aria-label={`${project.ticker} on X`}
                                onClick={(e) => e.stopPropagation()}
                                className="grid h-8 w-8 place-items-center rounded-full bg-[#1c1c1e] text-white/75 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                              >
                                <XLogo className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={socials.telegram}
                                target="_blank"
                                rel="noreferrer"
                                title="Telegram"
                                aria-label={`${project.ticker} on Telegram`}
                                onClick={(e) => e.stopPropagation()}
                                className="grid h-8 w-8 place-items-center rounded-full bg-[#1c1c1e] ring-1 ring-white/10 transition hover:bg-white/10"
                              >
                                <img
                                  src="/images/partners/telegram.svg"
                                  alt=""
                                  className="h-4 w-4 object-contain"
                                />
                              </a>
                              <a
                                href={socials.website}
                                target="_blank"
                                rel="noreferrer"
                                title="Website"
                                aria-label={`${project.ticker} website`}
                                onClick={(e) => e.stopPropagation()}
                                className="grid h-8 w-8 place-items-center rounded-full bg-[#1c1c1e] text-white/75 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                              >
                                <Globe className="h-4 w-4" strokeWidth={2} />
                              </a>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 text-right">
                          <p className="truncate text-[13px] font-semibold tabular-nums leading-none text-white">
                            {project.volume24h}
                          </p>
                          <p className="mt-1 truncate text-[11px] font-medium tabular-nums leading-none text-white/40">
                            {project.txs}
                          </p>
                        </div>

                        <div className="min-w-0 text-right">
                          {showPeak ? (
                            <>
                              <p className="truncate text-[13px] font-bold tabular-nums leading-none text-[#c8ff3d]">
                                {peakLabelFor(project.ticker, project.change24h)}
                              </p>
                              <p className="mt-1 text-[11px] font-medium leading-none text-white/40">
                                Peak
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="truncate text-[13px] font-semibold tabular-nums leading-none text-white">
                                {project.marketCap}
                              </p>
                              <p
                                className={`mt-1 truncate text-[11px] font-semibold tabular-nums leading-none ${
                                  up ? 'text-[#12d18e]' : 'text-[#ff5a6a]'
                                }`}
                              >
                                {formatPct(pct)}
                              </p>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Scroll to top */}
      {showTop ? (
        <button
          type="button"
          onClick={() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute bottom-[5.25rem] right-4 grid h-10 w-10 place-items-center rounded-full bg-[#2a2a2c]/95 text-white/80 shadow-lg ring-1 ring-white/10"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      ) : null}

      {/* Bottom nav — Growth centered */}
      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex w-full max-w-[26rem] items-end justify-between rounded-[22px] bg-[#1c1c1e]/92 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-md">
          {(
            [
              { id: 'discover' as const, label: 'Discover', kind: 'lucide' as const, Lucide: Compass },
              { id: 'prelaunch' as const, label: 'Prelaunch', kind: 'lucide' as const, Lucide: Rocket },
              { id: 'growth' as const, label: 'Growth', kind: 'growth' as const },
              { id: 'portfolio' as const, label: 'Portfolio', kind: 'lucide' as const, Lucide: Briefcase },
              { id: 'bot' as const, label: 'Bot', kind: 'bot' as const },
            ] as const
          ).map((item) => {
            const active = bottomTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectBottom(item.id)}
                className={`flex w-[19%] flex-col items-center gap-0.5 transition ${
                  active ? 'text-[#c8ff3d]' : 'text-white/45'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <AliveNavGlyph alive={active}>
                  {item.kind === 'lucide' ? (
                    <item.Lucide className="h-[18px] w-[18px]" strokeWidth={2} />
                  ) : item.kind === 'growth' ? (
                    <GrowthIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <span className="text-[18px] leading-none" aria-hidden>
                      🤖
                    </span>
                  )}
                </AliveNavGlyph>
                <span className={`text-[10px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
    </AppSidebarProvider>
  );
}
