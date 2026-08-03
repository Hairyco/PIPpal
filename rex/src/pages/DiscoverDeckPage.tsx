import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownUp,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Filter,
  Hexagon,
  Pin,
  Search,
  Users,
} from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { SolanaLogo } from '../components/SolanaLogo';
import { Sparkline } from '../components/Sparkline';
import { ConnectWalletButton } from '../components/ConnectWalletButton';
import { ctoProjects, type CtoProject } from '../data/ctoProjects';
import { pinnedByTicker } from '../data/pinnedMessages';
import { useWatchlist } from '../hooks/useWatchlist';

type TopTab = 'watchlist' | 'growth' | 'trending';
type TimeWindow = '5m' | '1h' | '6h' | '24h';

const CHAINS = [
  { id: 'SOL', label: 'SOL', accent: true },
  { id: 'BSC', label: 'BSC', accent: false },
  { id: 'HOOD', label: 'HOOD', accent: false },
] as const;

function salt(str: string, mod = 1000): number {
  let s = 0;
  for (let i = 0; i < str.length; i += 1) s = (s * 31 + str.charCodeAt(i)) % mod;
  return s;
}

function ageLabel(project: CtoProject): string {
  const mins = 8 + salt(project.ticker, 180);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
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

function formatPct(n: number): string {
  const abs = Math.abs(n);
  const body =
    abs >= 1000 ? `${(abs / 1000).toFixed(2)}K` : abs >= 100 ? abs.toFixed(1) : abs.toFixed(2);
  return `${n >= 0 ? '+' : '-'}${body}%`;
}

function ChainDot({ id }: { id: string }) {
  if (id === 'SOL') return <SolanaLogo className="h-3.5 w-3.5" />;
  const colors: Record<string, string> = {
    BSC: 'bg-[#f0b90b]',
    HOOD: 'bg-[#00c805]',
  };
  return <span className={`h-3.5 w-3.5 rounded-full ${colors[id] ?? 'bg-white/30'}`} />;
}

function TrackIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path
        d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CopyTradeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15.5" cy="10.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 18.5c.8-2.4 2.6-3.6 4.5-3.6s3.7 1.2 4.5 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13.2 15.2c.7-.4 1.5-.6 2.3-.6 1.6 0 3 .8 3.7 2.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PortfolioIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="3.5"
        y="6.5"
        width="17"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3.5 10.5h17" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 6.5V5.8A2.3 2.3 0 0 1 10.3 3.5h3.4A2.3 2.3 0 0 1 16 5.8v.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function DiscoverDeckPage() {
  const navigate = useNavigate();
  const { starred, count: watchCount } = useWatchlist();
  const listRef = useRef<HTMLDivElement>(null);
  const [topTab, setTopTab] = useState<TopTab>('trending');
  const [chain, setChain] = useState<string>('SOL');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1h');
  const [query, setQuery] = useState('');
  const [showTop, setShowTop] = useState(false);
  const [showPinned, setShowPinned] = useState(false);

  const rows = useMemo(() => {
    let list = [...ctoProjects];
    if (topTab === 'watchlist') {
      list = list.filter((p) => starred[p.ticker]);
    } else if (topTab === 'growth') {
      list = [...list].sort((a, b) => b.score - a.score).slice(0, 12);
    } else {
      list = [...list].sort((a, b) => changeForWindow(b, timeWindow) - changeForWindow(a, timeWindow));
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
  }, [topTab, starred, timeWindow, query, chain]);

  const pinnedFeed = useMemo(
    () =>
      rows.flatMap((project) => {
        const pin = pinnedByTicker[project.ticker];
        return pin ? [{ project, pin }] : [];
      }),
    [rows],
  );

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setShowTop(el.scrollTop > 280);
  };

  return (
    <div className="deck-shell fixed inset-0 z-[40] flex flex-col bg-black text-white">
      {/* Top search row */}
      <div className="flex shrink-0 items-center gap-2 px-3 pb-3.5 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <Link
          to="/"
          className="grid h-9 w-9 shrink-0 place-items-center text-white/90"
          aria-label="Classic view"
          title="Classic view"
        >
          <Hexagon className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </Link>
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
            { id: 'growth' as const, label: 'Growth' },
            { id: 'trending' as const, label: 'Trending' },
          ] as const
        ).map((tab) => {
          const active = topTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTopTab(tab.id)}
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

      {/* List / Launch */}
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

      {/* Chain chips */}
      <div className="hide-scrollbar flex shrink-0 gap-2 overflow-x-auto px-3 pb-2 pt-2">
        {CHAINS.map((c) => {
          const active = chain === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setChain(c.id)}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ${
                active
                  ? 'bg-[#2a2a2c] text-white ring-1 ring-[#c8ff3d]/45'
                  : 'bg-[#1c1c1e] text-white/70'
              }`}
            >
              <ChainDot id={c.id} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Filter row */}
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2">
        <button
          type="button"
          onClick={() =>
            setTimeWindow((w) => (w === '1h' ? '5m' : w === '5m' ? '6h' : w === '6h' ? '24h' : '1h'))
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

      {/* Column headers */}
      {!showPinned ? (
      <div className="grid shrink-0 grid-cols-[46px_minmax(0,9.75rem)_minmax(3.5rem,1fr)_4.25rem_4.25rem] items-center gap-x-2 px-3 pb-1.5 text-[11px] font-medium text-white/35">
        <div className="col-span-2">Age / Holders / Viewing</div>
        <div className="text-center">Chart</div>
        <div className="text-right">Vol / TXs</div>
        <div className="text-right">MC / {timeWindow}%</div>
      </div>
      ) : (
        <div className="px-3 pb-1.5 text-[11px] font-medium text-white/35">
          Pinned Telegram messages
        </div>
      )}

      {/* List */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[5.5rem]"
      >
        {showPinned ? (
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
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-white/70">
              {chain !== 'SOL' ? `${chain} coming soon` : 'No tokens yet'}
            </p>
            <p className="mt-1 text-[13px] text-white/35">
              {topTab === 'watchlist'
                ? 'Star coins on classic view to fill your watchlist.'
                : 'CTOgo is Solana-first for now.'}
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-full bg-[#c8ff3d] px-4 py-2 text-[13px] font-bold text-[#090b14]"
            >
              Classic view
            </Link>
          </div>
        ) : (
          <ul>
            {rows.map((project) => {
              const pct = changeForWindow(project, timeWindow);
              const up = pct >= 0;
              return (
                <li key={project.ticker}>
                  <button
                    type="button"
                    onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                    className="grid w-full grid-cols-[46px_minmax(0,9.75rem)_minmax(3.5rem,1fr)_4.25rem_4.25rem] items-center gap-x-2 border-b border-white/[0.06] px-3 py-2 text-left active:bg-white/[0.03]"
                  >
                    <div className="relative shrink-0">
                      <span className="block h-[46px] w-[46px] overflow-hidden rounded-[12px] bg-[#1c1c1e] ring-1 ring-white/10">
                        <img
                          src={project.logo}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                      <span className="absolute -bottom-0.5 -right-0.5 grid h-[16px] w-[16px] place-items-center rounded-full bg-[#12d18e] ring-2 ring-black">
                        <span className="h-[6px] w-[6px] rounded-full bg-white" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-[15px] font-bold leading-tight text-white">
                          {project.name}
                        </p>
                        <span className="shrink-0 rounded-[5px] bg-[#2a2a2c] px-1.5 py-[1px] text-[10px] font-semibold tabular-nums text-white/50">
                          {ageLabel(project)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2.5 text-[12px] font-medium tabular-nums text-white/45">
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

                    <div className="flex h-full items-center justify-center self-center px-1">
                      <Sparkline
                        seed={`${project.ticker}-${timeWindow}`}
                        changePct={pct}
                        width={64}
                        height={30}
                      />
                    </div>

                    <div className="text-right">
                      <p className="text-[14px] font-semibold tabular-nums leading-tight text-white">
                        {project.volume24h}
                      </p>
                      <p className="mt-0.5 text-[12px] font-medium tabular-nums text-white/40">
                        {project.txs}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[14px] font-semibold tabular-nums leading-tight text-white">
                        {project.marketCap}
                      </p>
                      <p
                        className={`mt-0.5 text-[12px] font-semibold tabular-nums ${
                          up ? 'text-[#12d18e]' : 'text-[#ff5a6a]'
                        }`}
                      >
                        {formatPct(pct)}
                      </p>
                    </div>
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

      {/* Bottom nav */}
      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex w-full max-w-[22rem] items-center justify-between rounded-[22px] bg-[#1c1c1e]/92 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-md">
          <Link
            to="/discover"
            onClick={() => setShowPinned(false)}
            className="flex w-[18%] flex-col items-center gap-0.5"
            aria-current={showPinned ? undefined : 'page'}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full ${
                showPinned ? '' : 'bg-white/15'
              }`}
            >
              <Compass
                className={`h-[18px] w-[18px] ${showPinned ? 'text-white/45' : 'text-white'}`}
                strokeWidth={2}
              />
            </span>
            <span
              className={`text-[10px] ${
                showPinned ? 'font-medium text-white/45' : 'font-semibold text-white'
              }`}
            >
              Discover
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setShowPinned(true)}
            className={`flex w-[18%] flex-col items-center gap-0.5 ${
              showPinned ? 'text-white' : 'text-white/45'
            }`}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full ${
                showPinned ? 'bg-white/15' : ''
              }`}
            >
              <Pin className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className={`text-[10px] ${showPinned ? 'font-semibold' : 'font-medium'}`}>
              Pinned
            </span>
          </button>
          <button type="button" className="flex w-[18%] flex-col items-center gap-0.5 text-white/45">
            <TrackIcon className="h-[18px] w-[18px]" />
            <span className="text-[10px] font-medium">Track</span>
          </button>
          <button type="button" className="flex w-[18%] flex-col items-center gap-0.5 text-white/45">
            <CopyTradeIcon className="h-[18px] w-[18px]" />
            <span className="text-[10px] font-medium">Copy</span>
          </button>
          <Link
            to="/launch?dashboard=1"
            className="flex w-[18%] flex-col items-center gap-0.5 text-white/45"
          >
            <PortfolioIcon className="h-[18px] w-[18px]" />
            <span className="text-[10px] font-medium">Portfolio</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
