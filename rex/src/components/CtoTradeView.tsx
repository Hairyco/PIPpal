import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Wallet,
  Zap,
} from 'lucide-react';

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
  marketingBalance?: string;
  nextAdTargetUsd?: number;
  nextAdSpend?: string;
  community: string;
  colors: string;
  logo: string;
  verified?: boolean;
  boost?: number;
};

function formatLaunchLabel(hours: number | null): string {
  if (hours == null) return 'Live';
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
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

type CtoTradeViewProps = {
  project: TradeViewProject;
  projects: TradeViewProject[];
  change: number | null;
  onSelect: (ticker: string) => void;
  onBack: () => void;
  starred?: boolean;
  onToggleStar?: () => void;
};

export function CtoTradeView({
  project,
  projects,
  change,
  onSelect,
  onBack,
  starred,
  onToggleStar,
}: CtoTradeViewProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0.5');
  const [chartWindow, setChartWindow] = useState('5m');
  const positive = (change ?? project.change24h) >= 0;

  const stats = [
    { label: 'Market Cap', value: project.marketCap },
    { label: 'TXs', value: project.txs },
    { label: 'Holders', value: project.holders },
    { label: 'Launch', value: formatLaunchLabel(project.launchInHours) },
    { label: 'Vol 24h', value: project.volume24h },
    { label: 'FDV', value: project.fdv },
    { label: 'MPH', value: String(project.mph) },
    {
      label: 'Raids',
      value: project.raidsActive > 0 ? `${project.raidsActive}` : '0',
    },
  ];

  return (
    <div className="-mx-3 sm:-mx-5">
      <div className="border-y border-white/[0.08] bg-[#05070d]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-3 py-3 sm:gap-4 sm:px-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] font-semibold text-white/55 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            List
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}
            >
              <img src={project.logo} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate font-serif text-xl font-bold tracking-tight">${project.ticker}</h2>
                {project.verified ? (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-300 text-[9px] font-black text-black">
                    ✓
                  </span>
                ) : null}
                {project.boost != null ? (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-300">
                    <Zap className="h-3 w-3 fill-amber-300" />
                    {project.boost}
                  </span>
                ) : null}
                <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-white/50">
                  SOL
                </span>
              </div>
              <p className="truncate text-xs text-white/40">{project.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{project.price}</p>
            <p className="text-sm font-semibold">
              <Pct value={change} />
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleStar}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] text-white/35 hover:text-[#c8ff3d]"
              aria-label={`Star ${project.ticker}`}
            >
              <Star className={`h-4 w-4 ${starred ? 'fill-[#c8ff3d] text-[#c8ff3d]' : ''}`} />
            </button>
            <a
              href={`https://t.me`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 text-[11px] font-semibold text-white/55 hover:text-white"
            >
              <img src="/images/partners/telegram.svg" alt="" className="h-3.5 w-3.5" />
              {project.community}
            </a>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 text-[11px] font-semibold text-white/55 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              CA
            </button>
          </div>
        </div>

        <div className="border-t border-white/[0.05]">
          <div className="mx-auto flex max-w-7xl gap-0 overflow-x-auto px-1 sm:px-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[5.5rem] flex-1 border-r border-white/[0.05] px-3 py-2.5 last:border-r-0"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">{stat.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-white/90">{stat.value}</p>
              </div>
            ))}
            <div className="min-w-[9rem] flex-1 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">
                Marketing
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-[#d5ff69]">
                <Wallet className="h-3.5 w-3.5 shrink-0" />
                {project.marketingBalance ?? '—'}
                {project.marketingWallet ? (
                  <span className="truncate text-[11px] font-medium text-[#c8ff3d]/80">
                    {project.marketingWallet}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-3 px-3 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#05070d]">
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
            <div className="flex gap-1">
              {['1m', '5m', '15m', '1h', '4h', '1D'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setChartWindow(w)}
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                    chartWindow === w
                      ? 'bg-white text-[#090b14]'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30">Price chart · demo</p>
          </div>
          <div className="h-[320px] px-1 py-2 sm:h-[380px]">
            <CandleChart positive={positive} />
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <div className="rounded-xl border border-white/[0.1] bg-[#05070d] p-3">
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
            <p className="mt-2 text-center text-[10px] text-white/30">Demo only — no on-chain trade</p>
          </div>

          <div className="rounded-xl border border-white/[0.1] bg-[#05070d] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/35">
              Marketing wallet
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-[#d5ff69]">
              {project.marketingBalance ?? 'No wallet'}
            </p>
            {project.marketingWallet ? (
              <p className="mt-0.5 font-mono text-[11px] text-[#c8ff3d]/80">{project.marketingWallet}</p>
            ) : null}
            {project.nextAdSpend && project.nextAdTargetUsd ? (
              <p className="mt-2 text-[11px] text-white/45">
                Next: {project.nextAdSpend} at ${project.nextAdTargetUsd}
              </p>
            ) : null}
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
