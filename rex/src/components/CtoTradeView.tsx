import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Info,
  Settings2,
  Star,
  Wallet,
  X,
} from 'lucide-react';
import { MigrateToV2Banner } from './OriginBadge';
import { PolessiaLogo } from './PolessiaLogo';
import {
  launchCtoHref,
  resolveMarketingWalletAddress,
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
  verified?: boolean;
  boost?: number;
  origin: ProjectOrigin;
  sourceVenue: SourceVenue;
  devDumpedPct?: number;
  feeMode?: FeeModeKind;
};

function formatLaunchLabel(hours: number | null): string {
  if (hours == null) return 'Live';
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
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

function CandleChart({ positive }: { positive: boolean }) {
  const candles = useMemo(() => {
    const out: { x: number; o: number; h: number; l: number; c: number; up: boolean }[] = [];
    let price = 42;
    for (let i = 0; i < 48; i += 1) {
      const drift = positive ? 0.35 : -0.25;
      const open = price;
      const close = Math.max(8, open + drift + (Math.sin(i * 0.7) * 3 + (i % 5) - 2));
      const high = Math.max(open, close) + 1.5 + (i % 3);
      const low = Math.min(open, close) - 1.2 - (i % 2);
      out.push({ x: i, o: open, h: high, l: low, c: close, up: close >= open });
      price = close;
    }
    return out;
  }, [positive]);

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
        <linearGradient id="ctoChartFade" x1="0" y1="0" x2="0" y2="1">
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
        fill="url(#ctoChartFade)"
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
  onOpenSocials,
}: CtoTradeViewProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0.5');
  const [sellPct, setSellPct] = useState('25');
  const [chartWindow, setChartWindow] = useState('5m');
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tokenInfoOpen, setTokenInfoOpen] = useState(false);
  const [slippage, setSlippage] = useState(String(DEFAULT_SLIPPAGE));
  const [priorityFee, setPriorityFee] = useState(DEFAULT_PRIORITY_FEE);
  const tradePanelRef = useRef<HTMLDivElement>(null);
  const positive = (change ?? project.change24h) >= 0;

  const demoTrades = useMemo(() => demoTradesForTicker(project.ticker), [project.ticker]);

  const v1Mint = resolveV1Mint(project);
  const v1Liquidity = resolveV1Liquidity(project);
  const launchHref = launchCtoHref(project);
  const marketingAddress = resolveMarketingWalletAddress(project);
  const marketingSolscan = marketingAddress ? solscanAccountUrl(marketingAddress) : null;
  const marketingShort =
    project.marketingWallet ?? (marketingAddress ? shortMint(marketingAddress) : null);
  const isExternal = project.origin === 'external_cto';
  const isNativeV2 = project.origin === 'native_cto';

  const mktBalance = parseUsdAmount(project.marketingBalance);
  const mktTarget = project.nextAdTargetUsd ?? 0;
  const mktPct = mktTarget > 0 ? Math.min(100, Math.round((mktBalance / mktTarget) * 100)) : 0;
  const mktReady = mktTarget > 0 && mktBalance >= mktTarget;

  const slippageNum = Number(slippage);
  const slippageLabel = Number.isFinite(slippageNum) && slippageNum > 0 ? `${slippageNum}%` : '—';
  const highSlippage = Number.isFinite(slippageNum) && slippageNum >= 20;

  const stats = [
    { label: 'Market Cap', value: project.marketCap },
    { label: 'TXs', value: project.txs },
    { label: 'Holders', value: project.holders },
    { label: 'Age', value: formatLaunchLabel(project.launchInHours) },
    { label: 'Vol 24h', value: project.volume24h },
    { label: 'FDV', value: project.fdv },
  ];

  const copyV1 = async () => {
    try {
      await navigator.clipboard.writeText(v1Mint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
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
    <div className="w-full min-w-0">
      <div className="border-y border-white/[0.08] bg-[#05070d]">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
          <div
            className={`h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}
          >
            <img src={project.logo} alt="" className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline gap-2">
              <h2 className="truncate font-serif text-base font-bold tracking-tight sm:text-xl">
                ${project.ticker}
              </h2>
              <p className="truncate text-[11px] text-white/45 sm:text-xs">{project.name}</p>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="text-sm font-semibold tabular-nums tracking-tight sm:text-lg">
                {project.price}
              </p>
              <p className="text-[11px] font-semibold sm:text-sm">
                <Pct value={change} />
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onToggleStar ? (
              <button
                type="button"
                onClick={onToggleStar}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/35 hover:bg-white/[0.06] hover:text-[#c8ff3d]"
                aria-label={`Star ${project.ticker}`}
              >
                <Star className={`h-4 w-4 ${starred ? 'fill-[#c8ff3d] text-[#c8ff3d]' : ''}`} />
              </button>
            ) : null}
            {onOpenSocials ? (
              <>
                <button
                  type="button"
                  onClick={onOpenSocials}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/[0.06] hover:text-white"
                  aria-label="Open X"
                  title="X / Twitter"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenSocials}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/[0.06] hover:text-white"
                  aria-label="Open Telegram"
                  title="Telegram"
                >
                  <img src="/images/partners/telegram.svg" alt="" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenSocials}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/[0.06] hover:text-white"
                  aria-label="Open Discord"
                  title="Discord"
                >
                  <DiscordGlyph className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenSocials}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/[0.06] hover:text-white"
                  aria-label="Open website"
                  title="Website"
                >
                  <Globe className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={copyV1}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/[0.08] px-2 text-[10px] font-semibold text-white/55 hover:text-white"
              title={v1Mint}
            >
              <Copy className="h-3 w-3" />
              {copied ? 'OK' : 'CA'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] text-white/55 hover:bg-white/[0.06] hover:text-white"
              aria-label="Back to board"
              title="Back to board"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isExternal ? (
        <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-5">
          <MigrateToV2Banner
            ticker={project.ticker}
            sourceVenue={project.sourceVenue}
            devDumpedPct={project.devDumpedPct}
            href={launchHref}
          />
        </div>
      ) : null}

      <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-3 px-3 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,300px)]">
        <div className="order-1 flex min-w-0 flex-col gap-3">
          <div className="min-w-0 overflow-hidden rounded-xl border border-white/[0.1] bg-[#05070d]">
            <div className="flex min-w-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
              <div className="hide-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
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
              <div className="flex shrink-0 items-center gap-1.5">
                <p className="hidden text-[10px] text-white/30 sm:inline">Price chart</p>
                <button
                  type="button"
                  onClick={() => setTokenInfoOpen((open) => !open)}
                  className={`grid h-7 w-7 place-items-center rounded-md border transition ${
                    tokenInfoOpen
                      ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                      : 'border-white/[0.08] text-white/40 hover:text-white'
                  }`}
                  aria-expanded={tokenInfoOpen}
                  aria-label="Contract details"
                  title="Contract details"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="h-[220px] px-1 py-2 sm:h-[320px] lg:h-[380px]">
              <CandleChart positive={positive} />
            </div>
            {tokenInfoOpen ? (
              <div className="border-t border-white/[0.06] px-3 py-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">
                      Contract
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <p
                        className="truncate font-mono text-xs font-semibold text-white/85"
                        title={v1Mint}
                      >
                        {shortMint(v1Mint)}
                      </p>
                      <button
                        type="button"
                        onClick={copyV1}
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-white/40 hover:bg-white/[0.06] hover:text-white"
                        aria-label="Copy contract"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">
                      Venue
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/85">{project.sourceVenue}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">
                      {isNativeV2 ? 'Status' : 'Liquidity'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/85">{v1Liquidity}</p>
                  </div>
                </div>
                {copied ? (
                  <p className="mt-2 text-[11px] text-[#d5ff69]">Copied</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="order-2 flex min-w-0 flex-col gap-3">
          <div
            id="trade-panel"
            ref={tradePanelRef}
            className="scroll-mt-4 rounded-xl border border-white/[0.1] bg-[#05070d] p-3"
          >
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`rounded-md py-2 text-xs font-bold ${
                  side === 'buy' ? 'bg-emerald-400 text-black' : 'text-white/45'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`rounded-md py-2 text-xs font-bold ${
                  side === 'sell' ? 'bg-rose-400 text-black' : 'text-white/45'
                }`}
              >
                Sell
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen((open) => !open)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold ${
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
              <div className="mt-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Set max. slippage (%)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {SLIPPAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSlippage(String(preset))}
                      className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                        Number(slippage) === preset
                          ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                          : 'border-white/[0.08] text-white/45 hover:text-white'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <label className="mt-2 block">
                  <span className="sr-only">Custom slippage percent</span>
                  <div className="relative">
                    <input
                      value={slippage}
                      onChange={(event) => setSlippageSafe(event.target.value)}
                      inputMode="decimal"
                      className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 pr-8 text-sm font-semibold outline-none focus:border-[#c8ff3d]/40"
                      placeholder="5"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/35">
                      %
                    </span>
                  </div>
                </label>
                {highSlippage ? (
                  <p className="mt-1.5 text-[10px] text-amber-300/90">
                    High slippage — you may get a worse fill on volatile coins.
                  </p>
                ) : (
                  <p className="mt-1.5 text-[10px] text-white/35">
                    Trade fails if price moves more than this before confirmation.
                  </p>
                )}

                <label className="mt-3 block">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    Priority fee (SOL)
                  </span>
                  <input
                    value={priorityFee}
                    onChange={(event) => setPriorityFee(event.target.value.replace(/[^\d.]/g, ''))}
                    inputMode="decimal"
                    className="mt-1.5 h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-semibold outline-none focus:border-[#c8ff3d]/40"
                    placeholder="0.0005"
                  />
                </label>
              </div>
            ) : null}

            {side === 'buy' ? (
              <>
                <label className="mt-3 block">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    Amount (SOL)
                  </span>
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-base font-semibold outline-none focus:border-[#c8ff3d]/40"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BUY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                        amount === String(preset)
                          ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                          : 'border-white/[0.08] text-white/45 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label className="mt-3 block">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    Sell amount (%)
                  </span>
                  <input
                    value={sellPct}
                    onChange={(event) =>
                      setSellPct(event.target.value.replace(/[^\d.]/g, '').slice(0, 5))
                    }
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-base font-semibold outline-none focus:border-[#c8ff3d]/40"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SELL_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSellPct(String(preset))}
                      className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                        sellPct === String(preset)
                          ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                          : 'border-white/[0.08] text-white/45 hover:text-white'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </>
            )}

            {isExternal ? (
              <>
                <button
                  type="button"
                  className={`mt-3 flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold ${
                    side === 'buy'
                      ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                      : 'bg-rose-400 text-black hover:bg-rose-300'
                  }`}
                >
                  {side === 'buy' ? `Buy $${project.ticker}` : `Sell $${project.ticker}`}
                </button>
                <Link
                  to={launchHref}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] text-xs font-semibold text-white/70 hover:border-[#c8ff3d]/35 hover:text-[#d5ff69]"
                >
                  <Flame className="h-3.5 w-3.5" />
                  Or launch Native V2
                </Link>
              </>
            ) : (
              <button
                type="button"
                className={`mt-3 flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold ${
                  side === 'buy'
                    ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                    : 'bg-rose-400 text-black hover:bg-rose-300'
                }`}
              >
                {side === 'buy' ? `Buy $${project.ticker}` : `Sell $${project.ticker}`}
              </button>
            )}
            <p className="mt-2 text-center text-[10px] text-white/30">
              {isExternal
                ? `CTOgo takes a platform fee on every trade${
                    marketingAddress ? ' · marketing cut fills the vault' : ''
                  }`
                : `Max slippage ${slippageLabel} · tip ${priorityFee || '0'} SOL`}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#05070d]">
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
              <div className="bg-[#05070d] px-2.5 py-2.5 sm:min-w-[9rem] sm:flex-1 sm:px-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">
                  Marketing
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-[#d5ff69]">
                  <Wallet className="h-3.5 w-3.5 shrink-0" />
                  {project.marketingBalance ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#c8ff3d]/20 bg-[#05070d] p-3">
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
              <a
                href={marketingSolscan}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-[#c8ff3d]/80 underline-offset-2 hover:text-[#d5ff69] hover:underline"
                title={`View ${marketingAddress} on Solscan`}
              >
                {marketingShort}
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="font-sans text-[10px] font-semibold">Solscan</span>
              </a>
            ) : (
              <p className="mt-1 text-[11px] text-white/40">
                {isExternal ? (
                  <>
                    No vault yet —{' '}
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
            <div className="mt-3 border-t border-white/[0.06] pt-2.5">
              <PolessiaLogo variant="powered" size="xs" />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.1] bg-[#05070d] p-3">
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
    </div>
  );
}
