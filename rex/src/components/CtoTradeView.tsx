import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Settings2,
  Star,
  X,
  Pin,
} from 'lucide-react';
import { MigrateToV2Banner } from './OriginBadge';
import { PolessiaLogo } from './PolessiaLogo';
import { SolanaLogo } from './SolanaLogo';
import { MarketingWalletActivity } from './MarketingWalletActivity';
import { useConnectedWallet } from './ConnectWalletButton';
import { formatSolAmount, useSolBalance } from '../hooks/useSolBalance';
import {
  hasLinkedV1,
  launchCtoHref,
  resolveMarketingWalletAddress,
  resolveTradeMint,
  resolveV1Liquidity,
  resolveV1Mint,
  shortMint,
  solscanAccountUrl,
  type FeeModeKind,
  type ProjectOrigin,
  type SourceVenue,
} from '../data/ctoProjects';

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

export type TradeViewProject = {
  name: string;
  ticker: string;
  price: string;
  marketCap: string;
  txs: string;
  holders: string;
  launchInHours: number | null;
  change5m: number | null;
  change24h: number;
  volume24h: string;
  fdv: string;
  mph: number;
  raidsActive: number;
  raidsJoined: string;
  marketingWallet?: string;
  marketingWalletAddress?: string;
  marketingBalance?: string;
  nextAdTargetUsd?: number;
  nextAdSpend?: string;
  v1Mint?: string;
  v1Liquidity?: string;
  community: string;
  colors: string;
  logo: string;
  headerBanner?: string;
  verified?: boolean;
  boost?: number;
  origin: ProjectOrigin;
  sourceVenue: SourceVenue;
  devDumpedPct?: number;
  feeMode?: FeeModeKind;
  /** Discord invite URL. Omit for auto demo; set '' to hide. */
  discordUrl?: string;
};

type CoinSocialId = 'x' | 'telegram' | 'discord' | 'website';

function resolveDiscordUrl(project: Pick<TradeViewProject, 'ticker' | 'discordUrl'>): string | null {
  if (project.discordUrl === '') return null;
  if (project.discordUrl) return project.discordUrl;
  const seed = hashSeed(project.ticker);
  if (seed % 3 === 0) return null;
  return `https://discord.gg/${project.ticker.toLowerCase()}`;
}

/** Demo social links until projects carry live URLs. */
function projectSocialLinks(project: Pick<TradeViewProject, 'ticker' | 'community' | 'discordUrl'>) {
  const slug = project.ticker.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ctogo';
  const links: Array<{ id: CoinSocialId; label: string; href: string }> = [
    { id: 'x', label: 'X / Twitter', href: `https://x.com/${slug}` },
    { id: 'telegram', label: 'Telegram', href: `https://t.me/${slug}` },
  ];
  const discord = resolveDiscordUrl(project);
  if (discord) links.push({ id: 'discord', label: 'Discord', href: discord });
  links.push({ id: 'website', label: 'Website', href: `https://${slug}.fun` });
  return links;
}

function formatCoinPageAge(hours: number | null, ticker: string): string {
  const resolved = hours != null ? hours : 72 + (hashSeed(ticker) % 200);
  if (resolved < 1) return '<1h';
  if (resolved < 24) return `${Math.max(1, Math.round(resolved))}h`;
  return `${Math.round(resolved / 24)}d`;
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

function Pct({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/25">--</span>;
  return (
    <span className={value >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  );
}

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function parseMarketCapUsd(raw: string) {
  const cleaned = raw.replace(/[$,\s]/g, '').trim();
  const match = cleaned.match(/^([\d.]+)([kmb])?$/i);
  if (!match) return 0;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return 0;
  const unit = (match[2] || '').toLowerCase();
  if (unit === 'k') return n * 1_000;
  if (unit === 'm') return n * 1_000_000;
  if (unit === 'b') return n * 1_000_000_000;
  return n;
}

function formatCompactUsd(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${Math.round(amount).toLocaleString('en-US')}`;
  return `$${Math.round(amount)}`;
}

function formatChange24hLabel(change: number) {
  const abs = Math.abs(change);
  const sign = change >= 0 ? '+' : '-';
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(2)}K%`;
  if (abs >= 100) return `${sign}${abs.toFixed(0)}%`;
  return `${sign}${abs.toFixed(2)}%`;
}

function peakMetricsFor(ticker: string, change24h: number, marketCap: string) {
  const seed = hashSeed(ticker);
  const mcap = parseMarketCapUsd(marketCap);
  const peakX = Math.max(
    1.2,
    Math.min(99, Math.abs(change24h) / 14 + 1.4 + ((seed % 90) + 1) / 10),
  );
  const athPct = Math.min(92, Math.max(18, 28 + (seed % 55)));
  const athMcap = mcap > 0 ? mcap / (athPct / 100) : peakX * 50_000;
  return {
    peakLabel: `${peakX.toFixed(1)}x`,
    athLabel: formatCompactUsd(athMcap),
    athPct,
  };
}

const PEAK_GLINTS = [
  { x: '18%', y: '22%', size: '7px', delay: '0ms' },
  { x: '72%', y: '18%', size: '9px', delay: '90ms' },
  { x: '48%', y: '78%', size: '6px', delay: '160ms' },
  { x: '88%', y: '62%', size: '8px', delay: '240ms' },
];

type TrackerTone = 'default' | 'good' | 'bad';

type CoinTrackerMetric = {
  id: string;
  label: string;
  value: string;
  tone: TrackerTone;
  detail: string;
};

type TrackerProject = Pick<
  TradeViewProject,
  'ticker' | 'holders' | 'origin' | 'sourceVenue' | 'v1Mint' | 'v1Liquidity' | 'volume24h' | 'launchInHours'
>;

/** Still on bonding curve vs graduated to AMM liquidity. */
function isOnBondingCurve(project: TrackerProject): boolean {
  if (project.sourceVenue === 'Pump.fun') return true;
  if (project.sourceVenue === 'Raydium' || project.sourceVenue === 'PumpSwap') return false;
  if (hasLinkedV1(project)) return false;
  if (project.sourceVenue === 'CTOgo') return !project.v1Mint;
  // Moonshot / LetsBonk — treat older live listings as migrated
  if (project.launchInHours == null) return false;
  return true;
}

function bondingProgressPct(project: TrackerProject): number {
  const seed = hashSeed(project.ticker);
  // Younger coins start lower on the curve; seed keeps demos stable per ticker
  const ageBias =
    project.launchInHours == null
      ? 90
      : Math.max(8, Math.min(92, 100 - Math.round(project.launchInHours * 1.4)));
  return Math.max(1, Math.min(99, Math.round(ageBias * 0.55 + (seed % 40))));
}

function formatLiquidityLabel(project: TrackerProject): string {
  const raw = resolveV1Liquidity(project);
  if (raw === 'Burned') {
    // Graduated CTOgo — demo pool depth from volume
    const seed = hashSeed(project.ticker);
    const k = 20 + (seed % 180);
    return `$${k}K`;
  }
  return raw.startsWith('$') ? raw : `$${raw}`;
}

/** GMGN-style risk/holder chips — demo values until live indexer. */
function coinTrackerMetrics(project: TrackerProject): CoinTrackerMetric[] {
  const seed = hashSeed(project.ticker);
  const holdersRaw = String(project.holders || '').replace(/,/g, '');
  const holdersNum = Number(holdersRaw);
  const holdersLabel =
    Number.isFinite(holdersNum) && holdersNum > 0
      ? holdersNum >= 1000
        ? `${(holdersNum / 1000).toFixed(holdersNum >= 10_000 ? 0 : 1)}K`
        : String(Math.round(holdersNum))
      : project.holders && project.holders !== '—'
        ? project.holders
        : String(80 + (seed % 420));

  const onCurve = isOnBondingCurve(project);
  const progressPct = bondingProgressPct(project);
  const progressOrLiquidity: CoinTrackerMetric = onCurve
    ? {
        id: 'progress',
        label: 'Progress',
        value: `${progressPct}%`,
        tone: progressPct >= 70 ? 'good' : 'default',
        detail:
          'Bonding-curve fill toward graduation. At 100% the coin migrates and this switches to pool liquidity.',
      }
    : {
        id: 'liquidity',
        label: 'Liquidity',
        value: formatLiquidityLabel(project),
        tone: 'default',
        detail:
          'Locked / pool liquidity after bonding-curve migration. Depth available for buys and sells on the AMM.',
      };

  return [
    {
      id: 'dev-holdings',
      label: 'Dev holdings',
      value: `${seed % 8}%`,
      tone: 'default',
      detail:
        'Share of supply still held by the deployer / creator wallet. Higher can mean more dump risk if they sell.',
    },
    progressOrLiquidity,
    {
      id: 'top-10',
      label: 'Top 10',
      value: `${12 + (seed % 38)}%`,
      tone: 'good',
      detail:
        'Combined % of supply held by the top 10 wallets (ex-pool where known). Lower concentration is generally healthier.',
    },
    {
      id: 'bundlers',
      label: 'Bundlers',
      value: `${seed % 15}%`,
      tone: 'bad',
      detail:
        'Estimated % of supply bought in coordinated / bundled sniper wallets at launch. Higher can mean tighter float and dump risk.',
    },
    {
      id: 'holders',
      label: 'Holders',
      value: holdersLabel,
      tone: 'default',
      detail: 'Unique wallets holding this token. Growing holders usually track broader distribution.',
    },
  ];
}

const TRACKER_TONE_CLASS: Record<TrackerTone, string> = {
  default: 'text-white',
  good: 'text-emerald-400',
  bad: 'text-rose-400',
};

const TRACKER_TIP_MAX_WIDTH = 260;
const TRACKER_TIP_GAP = 8;
const TRACKER_TIP_MARGIN = 12;

function bundlerDetailStats(ticker: string, holdLabel: string) {
  const seed = hashSeed(ticker);
  const holdPct = Number.parseFloat(holdLabel.replace('%', '')) || seed % 15;
  const athHold = Math.min(99, Math.round(holdPct + 35 + (seed % 25)));
  const totalBundlers = 60 + (seed % 360);
  const bundledSol = (40 + (seed % 380) + holdPct * 3.1).toFixed(2);
  const bundledToken = (holdPct * 3.8 + 90 + (seed % 80)).toFixed(2);
  return {
    holdPct: holdPct.toFixed(holdPct % 1 === 0 ? 0 : 2),
    athHold,
    totalBundlers,
    bundledSol,
    bundledToken,
  };
}

function BundlerDetailSheet({
  ticker,
  holdLabel,
  onClose,
}: {
  ticker: string;
  holdLabel: string;
  onClose: () => void;
}) {
  const stats = useMemo(() => bundlerDetailStats(ticker, holdLabel), [ticker, holdLabel]);
  const titleId = useId();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const rows: Array<{ label: string; value: ReactNode }> = [
    {
      label: 'Bundlers hold',
      value: <span className="tabular-nums text-rose-400">{stats.holdPct}%</span>,
    },
    {
      label: 'ATH hold',
      value: <span className="tabular-nums text-white">{stats.athHold}%</span>,
    },
    {
      label: 'Total bundlers',
      value: <span className="tabular-nums text-white">{stats.totalBundlers}</span>,
    },
    {
      label: 'Bundled total',
      value: (
        <span className="inline-flex items-center gap-1 tabular-nums text-white">
          <SolanaLogo className="h-3.5 w-3.5" />
          {stats.bundledSol}
        </span>
      ),
    },
    {
      label: 'Bundled token',
      value: <span className="tabular-nums text-white">{stats.bundledToken}%</span>,
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="Close bundler details"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-md animate-[slideUpSheet_0.32s_ease-out] rounded-t-2xl border border-white/[0.1] border-b-0 bg-[#12141a] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-16px_48px_rgba(0,0,0,0.55)] sm:rounded-2xl sm:border-b sm:pb-4">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20 sm:hidden" aria-hidden />
        <p id={titleId} className="text-[17px] font-semibold tracking-tight text-white">
          Bundler
        </p>

        <div className="mt-4 space-y-0">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-3.5 last:border-b-0"
            >
              <span className="text-[13px] text-white/45">{row.label}</span>
              <span className="text-[13px] font-medium text-white">{row.value}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-semibold text-[#090b14] transition hover:bg-white/90"
        >
          Got It
        </button>
        <style>{`
          @keyframes slideUpSheet {
            from { transform: translateY(110%); opacity: 0.6; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>,
    document.body,
  );
}

function CoinTrackerItem({
  metric,
  ticker,
  open,
  onToggle,
}: {
  metric: CoinTrackerMetric;
  ticker: string;
  open: boolean;
  onToggle: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [tipStyle, setTipStyle] = useState<CSSProperties>({});
  const isBundlerSheet = metric.id === 'bundlers';

  useEffect(() => {
    if (!open || isBundlerSheet) return;

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = Math.min(TRACKER_TIP_MAX_WIDTH, window.innerWidth - TRACKER_TIP_MARGIN * 2);
      const half = width / 2;
      let left = rect.left + rect.width / 2;
      left = Math.max(
        TRACKER_TIP_MARGIN + half,
        Math.min(left, window.innerWidth - TRACKER_TIP_MARGIN - half),
      );
      let top = rect.bottom + TRACKER_TIP_GAP;
      const estimatedHeight = 110;
      if (top + estimatedHeight > window.innerHeight - TRACKER_TIP_MARGIN) {
        top = Math.max(TRACKER_TIP_MARGIN, rect.top - TRACKER_TIP_GAP - estimatedHeight);
      }
      setTipStyle({
        position: 'fixed',
        top,
        left,
        width,
        transform: 'translateX(-50%)',
        zIndex: 70,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, isBundlerSheet]);

  useEffect(() => {
    if (!open || isBundlerSheet) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onToggle, isBundlerSheet]);

  const tip =
    open &&
    !isBundlerSheet &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <button
          type="button"
          aria-label={`Close ${metric.label} details`}
          className="fixed inset-0 z-[60] cursor-default bg-transparent"
          onClick={onToggle}
        />
        <div
          id={tooltipId}
          role="tooltip"
          style={tipStyle}
          className="rounded-lg border border-white/12 bg-[#0c1018] px-3 py-2.5 text-left shadow-xl shadow-black/50"
        >
          <p className="text-[11px] font-semibold text-white">{metric.label}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/55">{metric.detail}</p>
          <p className={`mt-2 text-[12px] font-semibold tabular-nums ${TRACKER_TONE_CLASS[metric.tone]}`}>
            {metric.value}
          </p>
        </div>
      </>,
      document.body,
    );

  return (
    <div role="listitem" className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-describedby={open && !isBundlerSheet ? tooltipId : undefined}
        title={metric.detail}
        className="flex min-w-[4.75rem] flex-col gap-1 border-r border-white/[0.08] px-3 py-0.5 text-left transition hover:bg-white/[0.03] first:pl-1 last:border-r-0"
      >
        <span className="whitespace-nowrap text-[10px] font-medium leading-none text-white/45 underline decoration-white/25 underline-offset-[3px]">
          {metric.label}
        </span>
        <span
          className={`whitespace-nowrap text-[13px] font-semibold leading-none tabular-nums ${TRACKER_TONE_CLASS[metric.tone]}`}
        >
          {metric.value}
        </span>
      </button>
      {tip}
      {open && isBundlerSheet ? (
        <BundlerDetailSheet ticker={ticker} holdLabel={metric.value} onClose={onToggle} />
      ) : null}
    </div>
  );
}

function CoinTrackerRow({
  project,
}: {
  project: TrackerProject;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const trackers = useMemo(
    () => coinTrackerMetrics(project),
    [
      project.ticker,
      project.holders,
      project.origin,
      project.sourceVenue,
      project.v1Mint,
      project.v1Liquidity,
      project.volume24h,
      project.launchInHours,
    ],
  );

  return (
    <div
      className="hide-scrollbar mt-3 -mx-1 flex gap-0 overflow-x-auto overscroll-x-contain touch-pan-x border-t border-white/[0.08] pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
      role="list"
      aria-label="Token trackers"
    >
      {trackers.map((t) => (
        <CoinTrackerItem
          key={t.id}
          metric={t}
          ticker={project.ticker}
          open={openId === t.id}
          onToggle={() => setOpenId((cur) => (cur === t.id ? null : t.id))}
        />
      ))}
    </div>
  );
}

function PeakFlashValue({ value }: { value: string }) {
  const [phase, setPhase] = useState<'idle' | 'active' | 'fading'>('idle');

  useEffect(() => {
    let fadeTimer: number | undefined;
    let idleTimer: number | undefined;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const runFlash = () => {
      setPhase('active');
      fadeTimer = window.setTimeout(() => {
        setPhase('fading');
        idleTimer = window.setTimeout(() => setPhase('idle'), 450);
      }, 1170);
    };

    runFlash();
    const interval = window.setInterval(runFlash, 30_000);
    return () => {
      window.clearInterval(interval);
      if (fadeTimer) window.clearTimeout(fadeTimer);
      if (idleTimer) window.clearTimeout(idleTimer);
    };
  }, [value]);

  return (
    <span className="peak-flash-root" data-phase={phase === 'idle' ? undefined : phase}>
      <span className="peak-flash-text text-[22px] font-bold leading-none tracking-tight tabular-nums sm:text-[26px]">
        {value}
      </span>
      <span className="peak-flash-shimmer text-[22px] font-bold leading-none tracking-tight tabular-nums sm:text-[26px]" aria-hidden>
        {value}
      </span>
      <span className="peak-flash-glints" aria-hidden>
        {PEAK_GLINTS.map((g) => (
          <span
            key={`${g.x}-${g.y}`}
            className="peak-flash-glint"
            style={
              {
                '--g-x': g.x,
                '--g-y': g.y,
                '--g-size': g.size,
                '--g-delay': g.delay,
              } as CSSProperties
            }
          >
            <svg viewBox="0 0 12 12" className="peak-flash-gem">
              <path d="M6 1.2 10.2 6 6 10.8 1.8 6Z" />
            </svg>
          </span>
        ))}
      </span>
    </span>
  );
}

function MarketCapPeakRow({
  marketCap,
  change24h,
  ticker,
}: {
  marketCap: string;
  change24h: number;
  ticker: string;
}) {
  const [mode, setMode] = useState<'peak' | 'ath'>('ath');
  const metrics = useMemo(
    () => peakMetricsFor(ticker, change24h, marketCap),
    [ticker, change24h, marketCap],
  );
  const [athPct, setAthPct] = useState(metrics.athPct);
  const positive = change24h >= 0;
  const display = mode === 'peak' ? metrics.peakLabel : metrics.athLabel;

  useEffect(() => {
    setAthPct(metrics.athPct);
  }, [metrics.athPct]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const base = metrics.athPct;
    const drift = Math.min(6, Math.max(1.2, Math.abs(change24h) / 18));
    const direction = change24h >= 0 ? 1 : -1;
    let t = 0;
    const id = window.setInterval(() => {
      t += 1;
      const wave = Math.sin(t / 7) * drift;
      const next = Math.min(98, Math.max(8, base + direction * Math.abs(wave) * 0.55 + wave * 0.35));
      setAthPct(Math.round(next));
    }, 900);
    return () => window.clearInterval(id);
  }, [metrics.athPct, change24h]);

  return (
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1">
      <p className="flex h-5 items-center text-[11px] font-medium text-white/45">Market Cap</p>
      <div className="flex h-5 items-center justify-end gap-1">
        <p className="text-[11px] font-medium text-white/45">{mode === 'peak' ? 'Peak' : 'ATH'}</p>
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'peak' ? 'ath' : 'peak'))}
          className="grid h-5 w-5 place-items-center rounded-full bg-white/[0.06] text-white/50 transition hover:bg-white/[0.1] hover:text-white"
          aria-label="Cycle peak metric"
          title={mode === 'peak' ? 'Show ATH' : 'Show Peak'}
        >
          <ArrowUpDown className="h-3 w-3" />
        </button>
      </div>

      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="text-[22px] font-bold leading-none tracking-tight tabular-nums text-white sm:text-[26px]">
          {marketCap.startsWith('$') ? marketCap : `$${marketCap}`}
        </p>
        <p
          className={`text-[12px] font-semibold leading-none tabular-nums ${
            positive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formatChange24hLabel(change24h)}
          <span className="ml-1 font-medium text-white/35">24h</span>
        </p>
      </div>

      <div className="flex flex-col items-end self-baseline">
        <PeakFlashValue value={display} />
        <div
          className="peak-ath-track mt-1.5"
          role="img"
          aria-label={`${athPct}% of all-time high`}
          title={`${athPct}% of ATH`}
        >
          <span className="peak-ath-fill" style={{ width: `${athPct}%` }} />
        </div>
      </div>
    </div>
  );
}

function CandleChart({
  positive,
  variant = 'v2',
}: {
  positive: boolean;
  variant?: 'v1' | 'v2';
}) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `ctoChartFade-${uid}`;
  const candles = useMemo(() => {
    const out: { x: number; o: number; h: number; l: number; c: number; up: boolean }[] = [];
    const isV1 = variant === 'v1';
    let price = isV1 ? 28 : 42;
    for (let i = 0; i < 48; i += 1) {
      const drift = isV1 ? (positive ? 0.12 : -0.4) : positive ? 0.35 : -0.25;
      const wave = isV1 ? Math.sin(i * 1.15) * 4.2 + (i % 7) - 3 : Math.sin(i * 0.7) * 3 + (i % 5) - 2;
      const open = price;
      const close = Math.max(8, open + drift + wave);
      const high = Math.max(open, close) + (isV1 ? 2.4 : 1.5) + (i % 3);
      const low = Math.min(open, close) - (isV1 ? 2.1 : 1.2) - (i % 2);
      out.push({ x: i, o: open, h: high, l: low, c: close, up: close >= open });
      price = close;
    }
    return out;
  }, [positive, variant]);

  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const span = Math.max(max - min, 1);
  const w = 640;
  const h = 280;
  const pad = 12;
  const slot = (w - pad * 2) / candles.length;

  const y = (v: number) => pad + ((max - v) / span) * (h - pad * 2);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#34d399' : '#fb7185'} stopOpacity="0.18" />
          <stop offset="100%" stopColor={positive ? '#34d399' : '#fb7185'} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + t * (h - pad * 2)}
          y2={pad + t * (h - pad * 2)}
          stroke="rgba(255,255,255,0.06)"
        />
      ))}
      <path
        d={[
          `M ${pad + slot / 2} ${y(candles[0].c)}`,
          ...candles.map((c, i) => `L ${pad + i * slot + slot / 2} ${y(c.c)}`),
          `L ${pad + (candles.length - 1) * slot + slot / 2} ${h - pad}`,
          `L ${pad + slot / 2} ${h - pad} Z`,
        ].join(' ')}
        fill={`url(#${gradientId})`}
      />
      {candles.map((c, i) => {
        const cx = pad + i * slot + slot / 2;
        const color = c.up ? '#34d399' : '#fb7185';
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1.2" />
            <rect
              x={cx - Math.max(slot * 0.28, 1.5)}
              y={Math.min(y(c.o), y(c.c))}
              width={Math.max(slot * 0.56, 3)}
              height={Math.max(Math.abs(y(c.o) - y(c.c)), 1.5)}
              fill={color}
              rx="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
}

const BUY_PRESETS = [0.1, 0.25, 0.5, 1, 2];
const SELL_PRESETS = [25, 50, 75, 100];
/** Pump.fun-style max slippage presets (%) */
const SLIPPAGE_PRESETS = [1, 5, 10, 20];
const DEFAULT_SLIPPAGE = 5;
const DEFAULT_PRIORITY_FEE = '0.0005';
/** Leave room for signature, ATA rent on first buy, and priority tip. */
const BASE_GAS_RESERVE_SOL = 0.005;

function parsePriorityFeeSol(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Max SOL spendable while keeping enough for gas / tip. */
function maxSpendableSol(balanceSol: number, priorityFeeRaw: string): number {
  const reserve = BASE_GAS_RESERVE_SOL + parsePriorityFeeSol(priorityFeeRaw);
  const max = balanceSol - reserve;
  if (!Number.isFinite(max) || max <= 0) return 0;
  return Math.floor(max * 1e6) / 1e6;
}

function formatTradeSolInput(sol: number): string {
  if (!Number.isFinite(sol) || sol <= 0) return '0';
  return String(sol);
}

type DemoTrade = {
  id: string;
  side: 'buy' | 'sell';
  sol: string;
  usd: string;
  ago: string;
  wallet: string;
};

function demoTradesForTicker(ticker: string): DemoTrade[] {
  const seed = ticker.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const sides: Array<'buy' | 'sell'> = ['buy', 'sell', 'buy', 'buy', 'sell', 'buy', 'sell', 'buy'];
  const sols = [2.4, 0.85, 5.1, 0.32, 1.7, 3.05, 0.6, 1.15];
  const agos = ['2s', '14s', '41s', '1m', '2m', '3m', '5m', '8m'];
  return sides.map((side, i) => {
    const sol = sols[(seed + i) % sols.length];
    const usd = Math.round(sol * (118 + ((seed + i * 7) % 24)));
    const wallet = `${String.fromCharCode(97 + ((seed + i) % 26))}${((seed * 13 + i * 17) % 90)
      .toString(36)
      .slice(0, 3)}…${((seed + i * 9) % 36).toString(36).slice(0, 2)}`;
    return {
      id: `${ticker}-${i}`,
      side,
      sol: sol.toFixed(sol < 1 ? 2 : 1),
      usd: `$${usd.toLocaleString()}`,
      ago: agos[i],
      wallet,
    };
  });
}

type CtoTradeViewProps = {
  project: TradeViewProject;
  projects: TradeViewProject[];
  change: number | null;
  onSelect: (ticker: string) => void;
  onBack: () => void;
  starred?: boolean;
  onToggleStar?: () => void;
  onOpenSocials?: () => void;
};

export function CtoTradeView({
  project,
  projects,
  change,
  onSelect,
  onBack,
  starred,
  onToggleStar,
  onOpenSocials: _onOpenSocials,
}: CtoTradeViewProps) {
  const { address, connected, connect, busy: walletBusy } = useConnectedWallet();
  const { sol: solBalance, loading: solLoading } = useSolBalance(address);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0.5');
  const [sellPct, setSellPct] = useState('25');
  const [chartWindow, setChartWindow] = useState('5m');
  const [chartVersion, setChartVersion] = useState<'v1' | 'v2'>('v2');
  const [copied, setCopied] = useState(false);
  const [copiedMkt, setCopiedMkt] = useState(false);
  const [mktHistoryOpen, setMktHistoryOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [chartOffscreen, setChartOffscreen] = useState(false);
  const [stickyChartPinned, setStickyChartPinned] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slippage, setSlippage] = useState(String(DEFAULT_SLIPPAGE));
  const [priorityFee, setPriorityFee] = useState(DEFAULT_PRIORITY_FEE);
  const tradePanelRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const positive = (change ?? project.change24h) >= 0;

  const demoTrades = useMemo(() => demoTradesForTicker(project.ticker), [project.ticker]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setChartOffscreen(!entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: '-4px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [project.ticker]);

  useEffect(() => {
    setChartVersion('v2');
    setStickyChartPinned(true);
  }, [project.ticker]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToChart = () => {
    chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const v1Mint = resolveV1Mint(project);
  const tradeMint = resolveTradeMint(project);
  const linkedV1 = hasLinkedV1(project);
  const chartOnV1 = linkedV1 && chartVersion === 'v1';
  const launchHref = launchCtoHref(project);
  const marketingAddress = resolveMarketingWalletAddress(project);
  const marketingSolscan = marketingAddress ? solscanAccountUrl(marketingAddress) : null;
  const marketingShort =
    project.marketingWallet ?? (marketingAddress ? shortMint(marketingAddress) : null);
  const isExternal = project.origin === 'external_cto';

  const mktBalance = parseUsdAmount(project.marketingBalance);
  const mktTarget = project.nextAdTargetUsd ?? 0;
  const mktPct = mktTarget > 0 ? Math.min(100, Math.round((mktBalance / mktTarget) * 100)) : 0;
  const mktReady = mktTarget > 0 && mktBalance >= mktTarget;

  const slippageNum = Number(slippage);
  const slippageLabel = Number.isFinite(slippageNum) && slippageNum > 0 ? `${slippageNum}%` : '—';
  const highSlippage = Number.isFinite(slippageNum) && slippageNum >= 20;

  const maxBuySol =
    connected && solBalance != null ? maxSpendableSol(solBalance, priorityFee) : 0;
  const hasGasForTrade =
    connected && solBalance != null
      ? solBalance >= BASE_GAS_RESERVE_SOL + parsePriorityFeeSol(priorityFee)
      : false;

  const applyMaxBuy = () => {
    if (!connected) {
      void connect();
      return;
    }
    setAmount(formatTradeSolInput(maxBuySol));
  };

  const applyMaxSell = () => {
    if (!connected) {
      void connect();
      return;
    }
    setSellPct('100');
  };

  const walletBalanceLabel = !connected
    ? '—'
    : solLoading && solBalance == null
      ? '…'
      : `${formatSolAmount(solBalance ?? 0, 4)} SOL`;

  const stats = [
    { label: 'TXs', value: project.txs },
    { label: 'Holders', value: project.holders },
    { label: 'Age', value: formatCoinPageAge(project.launchInHours, project.ticker) },
    { label: 'Vol 24h', value: project.volume24h },
    { label: 'FDV', value: project.fdv },
    { label: 'Price', value: project.price },
  ];

  const copyTradeCa = async () => {
    try {
      await navigator.clipboard.writeText(tradeMint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const copyMarketingWallet = async () => {
    if (!marketingAddress) return;
    try {
      await navigator.clipboard.writeText(marketingAddress);
      setCopiedMkt(true);
      window.setTimeout(() => setCopiedMkt(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const setSlippageSafe = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, '');
    if (cleaned === '' || cleaned === '.') {
      setSlippage(cleaned);
      return;
    }
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return;
    setSlippage(String(Math.min(99, Math.max(0, n))));
  };

  return (
    <div ref={topRef} id="cto-trade-top" className="relative w-full min-w-0 scroll-mt-2">
      <div className="border-y border-white/[0.08] bg-[#05070d]">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-3 py-3 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}
            >
              <img src={project.logo} alt="" className="h-full w-full object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h2 className="font-serif text-lg font-bold leading-none tracking-tight sm:text-xl">
                        ${project.ticker}
                      </h2>
                      {onToggleStar ? (
                        <button
                          type="button"
                          onClick={onToggleStar}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-white/35 transition hover:bg-white/[0.06] hover:text-[#c8ff3d]"
                          aria-label={`Star ${project.ticker}`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${starred ? 'fill-[#c8ff3d] text-[#c8ff3d]' : ''}`}
                          />
                        </button>
                      ) : null}
                      <div className="flex items-center gap-0.5" aria-label="Social links">
                        {projectSocialLinks(project).map((link) => (
                          <a
                            key={link.id}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="grid h-7 w-7 place-items-center rounded-md text-white/45 transition hover:bg-white/[0.06] hover:text-white"
                            aria-label={`${link.label} for $${project.ticker}`}
                            title={link.label}
                          >
                            {link.id === 'x' ? (
                              <XMarkIcon className="h-3.5 w-3.5" />
                            ) : link.id === 'telegram' ? (
                              <img src="/images/partners/telegram.svg" alt="" className="h-3.5 w-3.5" />
                            ) : link.id === 'discord' ? (
                              <DiscordGlyph className="h-3.5 w-3.5" />
                            ) : (
                              <Globe className="h-3.5 w-3.5" />
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-[#c8ff3d]">
                        {formatCoinPageAge(project.launchInHours, project.ticker)}
                      </span>
                      <p className="min-w-0 truncate text-sm text-white/50">{project.name}</p>
                      <button
                        type="button"
                        onClick={copyTradeCa}
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                        aria-label="Copy contract address"
                        title={copied ? 'Copied' : tradeMint}
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-[#d5ff69]" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <div className="mr-1 hidden text-right sm:block">
                    <p className="text-sm font-semibold tabular-nums leading-none tracking-tight text-white/90">
                      {project.price}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-none">
                      <Pct value={change} />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onBack}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/70 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                    aria-label="Back to Discover"
                    title="Back to Discover"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <MarketCapPeakRow
            marketCap={project.marketCap}
            change24h={change ?? project.change24h}
            ticker={project.ticker}
          />
          <CoinTrackerRow project={project} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-2 empty:hidden sm:px-5 lg:px-5">
        <MigrateToV2Banner
          ticker={project.ticker}
          sourceVenue={project.sourceVenue}
          devDumpedPct={project.devDumpedPct}
          href={launchHref}
        />
      </div>

      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,300px)] lg:gap-3 lg:px-5 lg:pb-3 lg:pt-0">
        <div
          ref={chartRef}
          className="relative z-20 min-w-0 overflow-hidden border-b border-white/[0.1] bg-[#05070d] lg:rounded-xl lg:border"
        >
            <div className="flex min-w-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
              <div className="hide-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
                {linkedV1 ? (
                  <div className="mr-1 flex shrink-0 rounded-md border border-white/[0.1] bg-white/[0.03] p-0.5">
                    {(['v2', 'v1'] as const).map((ver) => (
                      <button
                        key={ver}
                        type="button"
                        onClick={() => setChartVersion(ver)}
                        className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          chartVersion === ver
                            ? ver === 'v2'
                              ? 'bg-[#c8ff3d] text-[#090b14]'
                              : 'bg-white/90 text-[#090b14]'
                            : 'text-white/40 hover:text-white'
                        }`}
                        title={
                          ver === 'v2'
                            ? 'CTOgo mint chart'
                            : 'Previous mint chart (trade stays on V2)'
                        }
                      >
                        {ver === 'v2' ? 'V2' : 'V1'}
                      </button>
                    ))}
                  </div>
                ) : null}
                {['1m', '5m', '15m', '1h', '4h', '1D'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setChartWindow(w)}
                    className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${
                      chartWindow === w
                        ? 'bg-white text-[#090b14]'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              {chartOnV1 ? (
                <p className="shrink-0 text-[10px] text-white/30">Previous mint</p>
              ) : null}
            </div>
            {chartOnV1 ? (
              <div className="border-b border-amber-400/15 bg-amber-400/[0.06] px-3 py-1.5">
                <p className="text-[11px] text-amber-100/80">
                  Viewing previous mint ({shortMint(v1Mint)}). Buys &amp; sells still use the CTOgo
                  CA.
                </p>
              </div>
            ) : null}
            <div className="h-[220px] px-1 py-2 sm:h-[300px] lg:h-[380px]">
              <CandleChart positive={positive} variant={chartOnV1 ? 'v1' : 'v2'} />
            </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-0 lg:gap-3">
          <div
            id="trade-panel"
            ref={tradePanelRef}
            className="scroll-mt-4 border-b border-white/[0.1] bg-[#05070d] px-3 py-2 lg:rounded-xl lg:border"
          >
            <div className="grid grid-cols-2 gap-1 rounded-md bg-white/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`rounded-md py-1.5 text-[11px] font-bold ${
                  side === 'buy' ? 'bg-emerald-400 text-black' : 'text-white/45'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`rounded-md py-1.5 text-[11px] font-bold ${
                  side === 'sell' ? 'bg-rose-400 text-black' : 'text-white/45'
                }`}
              >
                Sell
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen((open) => !open)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                  settingsOpen
                    ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                    : 'border-white/[0.08] text-white/45 hover:text-white'
                }`}
                aria-expanded={settingsOpen}
              >
                <Settings2 className="h-3 w-3" />
                Slippage {slippageLabel}
              </button>
              <p className="text-[10px] text-white/30">Tip {priorityFee || '0'} SOL</p>
            </div>

            {settingsOpen ? (
              <div className="mt-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Set max. slippage (%)
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {SLIPPAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSlippage(String(preset))}
                      className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${
                        Number(slippage) === preset
                          ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                          : 'border-white/[0.08] text-white/45 hover:text-white'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <label className="mt-1.5 block">
                  <span className="sr-only">Custom slippage percent</span>
                  <div className="relative">
                    <input
                      value={slippage}
                      onChange={(event) => setSlippageSafe(event.target.value)}
                      inputMode="decimal"
                      className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 pr-8 text-sm font-semibold outline-none focus:border-[#c8ff3d]/40"
                      placeholder="5"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/35">
                      %
                    </span>
                  </div>
                </label>
                {highSlippage ? (
                  <p className="mt-1 text-[10px] text-amber-300/90">
                    High slippage — you may get a worse fill on volatile coins.
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-white/35">
                    Trade fails if price moves more than this before confirmation.
                  </p>
                )}

                <label className="mt-2 block">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    Priority fee (SOL)
                  </span>
                  <input
                    value={priorityFee}
                    onChange={(event) => setPriorityFee(event.target.value.replace(/[^\d.]/g, ''))}
                    inputMode="decimal"
                    className="mt-1 h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-semibold outline-none focus:border-[#c8ff3d]/40"
                    placeholder="0.0005"
                  />
                </label>
              </div>
            ) : null}

            {side === 'buy' ? (
              <>
                <label className="mt-2 block">
                  <span className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    <span>Amount (SOL)</span>
                    <span className="normal-case tracking-normal text-white/45">
                      Balance{' '}
                      <span className="font-mono tabular-nums text-white/70">{walletBalanceLabel}</span>
                    </span>
                  </span>
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-semibold outline-none focus:border-[#c8ff3d]/40"
                  />
                </label>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {BUY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${
                        amount === String(preset)
                          ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                          : 'border-white/[0.08] text-white/45 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={applyMaxBuy}
                    disabled={connected && maxBuySol <= 0}
                    className={`rounded-md border px-2 py-1 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                      amount === formatTradeSolInput(maxBuySol) && maxBuySol > 0
                        ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                        : 'border-white/[0.08] text-white/45 hover:text-white'
                    }`}
                    title={
                      connected
                        ? `Leaves ~${formatSolAmount(BASE_GAS_RESERVE_SOL + parsePriorityFeeSol(priorityFee), 4)} SOL for gas`
                        : 'Connect wallet'
                    }
                  >
                    Max
                  </button>
                </div>
                {connected && solBalance != null && !hasGasForTrade ? (
                  <p className="mt-1 text-[10px] text-amber-300/90">
                    Need a little SOL left for gas — top up or lower the tip.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <label className="mt-2 block">
                  <span className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    <span>Sell amount (%)</span>
                    <span className="normal-case tracking-normal text-white/45">
                      Balance{' '}
                      <span className="font-mono tabular-nums text-white/70">{walletBalanceLabel}</span>
                    </span>
                  </span>
                  <input
                    value={sellPct}
                    onChange={(event) =>
                      setSellPct(event.target.value.replace(/[^\d.]/g, '').slice(0, 5))
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-semibold outline-none focus:border-[#c8ff3d]/40"
                  />
                </label>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {SELL_PRESETS.filter((preset) => preset !== 100).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSellPct(String(preset))}
                      className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${
                        sellPct === String(preset)
                          ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                          : 'border-white/[0.08] text-white/45 hover:text-white'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={applyMaxSell}
                    disabled={connected && !hasGasForTrade}
                    className={`rounded-md border px-2 py-1 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                      sellPct === '100'
                        ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                        : 'border-white/[0.08] text-white/45 hover:text-white'
                    }`}
                    title={
                      connected
                        ? hasGasForTrade
                          ? `Sells 100% · keeps ~${formatSolAmount(BASE_GAS_RESERVE_SOL + parsePriorityFeeSol(priorityFee), 4)} SOL for gas`
                          : 'Need SOL in wallet for gas fees'
                        : 'Connect wallet'
                    }
                  >
                    Max
                  </button>
                </div>
                {connected && solBalance != null && !hasGasForTrade ? (
                  <p className="mt-1 text-[10px] text-amber-300/90">
                    Keep some SOL for gas — sells still need a fee to land.
                  </p>
                ) : null}
              </>
            )}

            {isExternal ? (
              <>
                <button
                  type="button"
                  disabled={walletBusy}
                  onClick={() => {
                    if (!connected) void connect();
                  }}
                  className={`mt-2 flex h-9 w-full items-center justify-center rounded-lg text-[13px] font-bold disabled:opacity-60 ${
                    !connected || side === 'buy'
                      ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                      : 'bg-rose-400 text-black hover:bg-rose-300'
                  }`}
                >
                  {!connected
                    ? walletBusy
                      ? 'Connecting…'
                      : 'Connect wallet'
                    : side === 'buy'
                      ? `Buy $${project.ticker}`
                      : `Sell $${project.ticker}`}
                </button>
                <Link
                  to={launchHref}
                  className="mt-1.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] text-[11px] font-semibold text-white/70 hover:border-[#c8ff3d]/35 hover:text-[#d5ff69]"
                >
                  <Flame className="h-3.5 w-3.5" />
                  Or launch ${project.ticker} on CTOgo
                </Link>
              </>
            ) : (
              <button
                type="button"
                disabled={walletBusy}
                onClick={() => {
                  if (!connected) void connect();
                }}
                className={`mt-2 flex h-9 w-full items-center justify-center rounded-lg text-[13px] font-bold disabled:opacity-60 ${
                  !connected || side === 'buy'
                    ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                    : 'bg-rose-400 text-black hover:bg-rose-300'
                }`}
              >
                {!connected
                  ? walletBusy
                    ? 'Connecting…'
                    : 'Connect wallet'
                  : side === 'buy'
                    ? `Buy $${project.ticker}`
                    : `Sell $${project.ticker}`}
              </button>
            )}
            <p className="mt-1.5 text-center text-[10px] text-white/30">
              {isExternal
                ? `CTOgo takes a platform fee on every trade${
                    marketingAddress ? ' · marketing cut fills the wallet' : ''
                  }`
                : `Max slippage ${slippageLabel} · tip ${priorityFee || '0'} SOL`}
            </p>
          </div>

          <div className="overflow-hidden border-b border-white/[0.1] bg-[#05070d] lg:rounded-xl lg:border">
            <div className="grid grid-cols-3 gap-px bg-white/[0.05] sm:flex sm:gap-0 sm:overflow-x-auto sm:bg-transparent">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#05070d] px-2.5 py-2.5 sm:min-w-[5.5rem] sm:flex-1 sm:border-r sm:border-white/[0.05] sm:px-3 sm:last:border-r-0"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">{stat.label}</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-white/90">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b border-[#c8ff3d]/20 bg-[#05070d] p-3 lg:rounded-xl lg:border">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/35">
                Marketing wallet
              </p>
              <Link
                to="/marketing-wallet"
                className="text-[10px] font-semibold text-[#c8ff3d]/80 hover:text-[#d5ff69]"
              >
                How it works
              </Link>
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[#d5ff69]">
              {project.marketingBalance ?? '—'}
            </p>
            {marketingSolscan && marketingShort ? (
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <a
                  href={marketingSolscan}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#c8ff3d]/80 underline-offset-2 hover:text-[#d5ff69] hover:underline"
                  title={`View ${marketingAddress} on Solscan`}
                >
                  {marketingShort}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="font-sans text-[10px] font-semibold">Solscan</span>
                </a>
                <button
                  type="button"
                  onClick={() => void copyMarketingWallet()}
                  className="inline-flex items-center gap-1 rounded-md border border-white/[0.1] px-1.5 py-0.5 text-[10px] font-semibold text-white/50 transition hover:border-white/20 hover:text-white"
                  title="Copy marketing wallet address"
                >
                  {copiedMkt ? (
                    <Check className="h-3 w-3 text-[#d5ff69]" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedMkt ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-white/40">
                {isExternal ? (
                  <>
                    No wallet yet —{' '}
                    <Link
                      to="/launch?mode=list"
                      className="font-semibold text-[#d5ff69] underline decoration-[#c8ff3d]/40 underline-offset-2"
                    >
                      List this coin
                    </Link>{' '}
                    to add one for $1.
                  </>
                ) : (
                  'No marketing wallet on this listing'
                )}
              </p>
            )}
            {marketingAddress ? (
              <p className="mt-1.5 text-[10px] text-white/35">
                Send SOL here to fund growth manually.
              </p>
            ) : null}
            {project.marketingBalance && mktTarget > 0 ? (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-white/40">
                    Next: {project.nextAdSpend ?? 'Update socials'}
                  </span>
                  <span className="tabular-nums font-semibold text-white/70">
                    {formatUsd(mktBalance)}/{formatUsd(mktTarget)}
                  </span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      mktReady
                        ? 'bg-[#c8ff3d]'
                        : 'bg-gradient-to-r from-[#3b82f6] via-[#7dd3fc] to-[#c8ff3d]'
                    }`}
                    style={{ width: `${Math.max(mktPct, 4)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-white/35">
                  {mktReady
                    ? `Ready to deploy ${project.nextAdSpend ?? 'Update socials'}`
                    : `${formatUsd(Math.max(0, mktTarget - mktBalance))} to next spend`}
                </p>
              </div>
            ) : null}
            {marketingAddress ? (
              <div className="mt-3 border-t border-white/[0.06] pt-2.5">
                <button
                  type="button"
                  onClick={() => setMktHistoryOpen((open) => !open)}
                  aria-expanded={mktHistoryOpen}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="text-[11px] font-semibold text-[#c8ff3d]/90 underline-offset-2 hover:text-[#d5ff69] hover:underline">
                    Transaction history
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-white/40 transition ${
                      mktHistoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {mktHistoryOpen ? (
                  <MarketingWalletActivity ticker={project.ticker} compact className="mt-3" />
                ) : (
                  <p className="mt-1 text-[10px] text-white/35">
                    Fees, pay-ins, and supplier payouts
                  </p>
                )}
              </div>
            ) : null}
            <div className="mt-3 border-t border-white/[0.06] pt-2.5">
              <PolessiaLogo variant="powered" size="xs" />
            </div>
          </div>

          <div className="border-b border-white/[0.1] bg-[#05070d] p-3 lg:rounded-xl lg:border">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/35">
                Trades
              </p>
              <p className="text-[10px] text-white/30">Live</p>
            </div>
            <ul className="mt-2 divide-y divide-white/[0.05]">
              {demoTrades.map((trade) => (
                <li
                  key={trade.id}
                  className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wide ${
                        trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {trade.side}
                    </p>
                    <p className="truncate font-mono text-[10px] text-white/35">{trade.wallet}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold tabular-nums text-white/90">
                      {trade.sol} SOL
                    </p>
                    <p className="text-[10px] tabular-nums text-white/35">
                      {trade.usd} · {trade.ago}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-3 pb-4 sm:px-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/30">
          Switch coin
        </p>
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {projects.map((item) => {
            const active = item.ticker === project.ticker;
            return (
              <button
                key={item.ticker}
                type="button"
                onClick={() => onSelect(item.ticker)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-2 transition ${
                  active
                    ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div
                  className={`h-7 w-7 overflow-hidden rounded-lg bg-gradient-to-br ${item.colors}`}
                >
                  <img src={item.logo} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">${item.ticker}</p>
                  <p className="text-[10px] text-white/40">{item.marketCap}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {chartOffscreen && stickyChartPinned ? (
        <div className="fixed inset-x-3 top-3 z-50 overflow-hidden rounded-xl border border-[#c8ff3d]/30 bg-[#05070d]/95 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-2.5 py-1.5">
            <button
              type="button"
              onClick={scrollToChart}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              aria-label="Open full price chart"
            >
              <div
                className={`h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}
              >
                <img src={project.logo} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12px] font-bold text-white">${project.ticker}</span>
                  <span className="truncate text-[10px] text-white/40">{project.name}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold tabular-nums">
                  <span className="text-white/90">{project.price}</span>
                  <Pct value={change} />
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setStickyChartPinned(false)}
              className="shrink-0 rounded-md border border-white/[0.1] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/45 hover:border-white/25 hover:text-white"
              aria-label="Hide sticky chart"
              title="Hide"
            >
              Hide
            </button>
          </div>
          <button
            type="button"
            onClick={scrollToChart}
            className="block h-[88px] w-full px-1 py-1"
            aria-label="Open full price chart"
          >
            <CandleChart positive={positive} variant={chartOnV1 ? 'v1' : 'v2'} />
          </button>
        </div>
      ) : null}

      {chartOffscreen && !stickyChartPinned ? (
        <button
          type="button"
          onClick={() => setStickyChartPinned(true)}
          className="fixed right-3 top-3 z-50 grid h-10 w-10 place-items-center rounded-xl border border-[#c8ff3d]/35 bg-[#05070d]/95 text-[#d5ff69] shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-md lg:hidden"
          aria-label="Pin sticky chart"
          title="Pin chart"
        >
          <Pin className="h-4 w-4" />
        </button>
      ) : null}

      {showScrollTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-5 right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-[#c8ff3d]/35 bg-[#0a0c12]/95 text-[#d5ff69] shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:border-[#c8ff3d]/60 hover:bg-[#c8ff3d] hover:text-[#090b14] sm:bottom-6 sm:right-6"
          aria-label="Back to top"
          title="Back to top"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}
