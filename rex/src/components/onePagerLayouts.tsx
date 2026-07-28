import type { ReactElement } from 'react';
import { SolanaLogo } from './SolanaLogo';
import {
  type OnePagerIncludes,
  type OnePagerLayoutId,
  type OnePagerTheme,
} from '../data/onePagerTheme';
import { formatTokenSupplyShort } from '../data/tokenSupplyOptions';

type LayoutProps = {
  full: boolean;
  theme: OnePagerTheme;
  displayName: string;
  displayTicker: string;
  rawTicker: string;
  caLabel: string;
  logoUrl: string | null;
  headline: string;
  paragraphs: string[];
  includes: OnePagerIncludes;
  tokenSupply?: string;
  extraTitle: string;
  extraBody: string;
};

function accentOr(theme: OnePagerTheme, fallback: string) {
  if (theme.accent === '#ffffff' || theme.accent === '#111111') return fallback;
  return theme.accent;
}

function MiniChart({ accent, chartId }: { accent: string; chartId: string }) {
  const h = 140;
  const points = [18, 24, 22, 36, 30, 48, 44, 62, 55, 78, 70, 92, 86, 110, 102, 128];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const w = 360;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - 8 - ((p - min) / span) * (h - 20);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const fillId = `${chartId}-fill`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} aria-hidden>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#${fillId})`} />
      <path d={path} fill="none" stroke={accent} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function MemeFooter({
  p,
  accent,
}: {
  p: LayoutProps;
  accent: string;
}) {
  if (!p.full) return null;
  const body = p.paragraphs.slice(1);
  return (
    <div className="space-y-12 px-5 pb-14 sm:px-8">
      {body.length ? (
        <section className="mx-auto max-w-xl space-y-3 text-center">
          {body.map((para) => (
            <p key={para.slice(0, 28)} className="text-[15px] leading-relaxed text-white/60">
              {para}
            </p>
          ))}
        </section>
      ) : null}

      {p.includes.chart ? (
        <section className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4">
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            Live chart
          </p>
          <MiniChart accent={accent} chartId={`${p.rawTicker}-chart`} />
        </section>
      ) : null}

      {p.includes.tokenomics ? (
        <section className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          {[
            { v: formatTokenSupplyShort(p.tokenSupply ?? '1000000000'), l: 'Supply' },
            { v: '0%', l: 'Tax' },
            { v: 'Burnt', l: 'LP' },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 text-center"
            >
              <p className="font-display text-lg font-extrabold" style={{ color: accent }}>
                {s.v}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                {s.l}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {p.includes.howto ? (
        <section className="mx-auto max-w-md space-y-2">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            How to ape
          </p>
          {['Connect wallet', `Open ${p.displayTicker} on CTOgo`, 'Buy with SOL'].map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/70"
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-xs font-black text-black"
                style={{ backgroundColor: accent }}
              >
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </section>
      ) : null}

      {(p.extraTitle || p.extraBody) && (
        <section className="mx-auto max-w-xl text-center">
          {p.extraTitle ? (
            <h2 className="font-display text-2xl font-extrabold" style={{ color: accent }}>
              {p.extraTitle}
            </h2>
          ) : null}
          {p.extraBody ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/55">
              {p.extraBody}
            </p>
          ) : null}
        </section>
      )}

      {p.includes.socials ? (
        <p className="text-center text-[11px] font-semibold tracking-[0.2em] text-white/30">
          TG · X · CHART
        </p>
      ) : null}

      <p className="text-center text-[10px] text-white/25">
        © {new Date().getFullYear()} {p.displayTicker} · CTOgo
      </p>
    </div>
  );
}

/** Neon live meme — huge ticker, floating coin, pulse badge. */
function LayoutPulse(p: LayoutProps) {
  const accent = accentOr(p.theme, '#c8ff3d');
  return (
    <div className="relative min-h-full overflow-hidden bg-[#05060a] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 50% -20%, ${accent}44, transparent 55%),
            radial-gradient(ellipse 50% 40% at 100% 60%, #7c3aed33, transparent 50%),
            linear-gradient(180deg, #05060a 0%, #0a0c14 100%)
          `,
        }}
      />
      <div className={`relative ${p.full ? 'px-5 pt-6 sm:px-10' : 'px-4 pt-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {p.logoUrl ? (
              <img src={p.logoUrl} alt="" className="h-10 w-10 rounded-2xl object-cover ring-2 ring-white/20" />
            ) : null}
            <div>
              <p className="text-sm font-bold">{p.displayName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Pulse · Solana
              </p>
            </div>
          </div>
          <span
            className="rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wide text-black"
            style={{ backgroundColor: accent }}
          >
            Buy
          </span>
        </div>

        <div className={`text-center ${p.full ? 'mt-12' : 'mt-6'}`}>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: accent }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            </span>
            Live now
          </p>
          <p
            className={`mt-4 font-display font-black tracking-tighter ${
              p.full ? 'text-[clamp(3.5rem,18vw,8rem)]' : 'text-5xl'
            }`}
            style={{ color: accent }}
          >
            {p.displayTicker}
          </p>
          <h1
            className={`mt-2 font-display font-extrabold leading-none tracking-tight text-white ${
              p.full ? 'text-3xl sm:text-5xl' : 'text-xl'
            }`}
          >
            {p.displayName}
          </h1>
          <p className={`mx-auto mt-4 max-w-md text-white/55 ${p.full ? 'text-base' : 'text-xs'}`}>
            {p.headline || `${p.displayName} just hit the board.`}
          </p>

          <div
            className={`relative mx-auto ${p.full ? 'mt-10 h-56 w-56 sm:h-64 sm:w-64' : 'mt-6 h-28 w-28'}`}
          >
            <div
              className="absolute inset-[-20%] rounded-full opacity-70 blur-3xl"
              style={{ background: `radial-gradient(circle, ${accent}99, transparent 65%)` }}
            />
            {p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt=""
                className="relative h-full w-full rounded-[2rem] object-cover shadow-2xl ring-1 ring-white/20"
              />
            ) : null}
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-3 ${p.full ? 'mt-10' : 'mt-5'}`}>
            <span
              className="inline-flex rounded-2xl px-7 py-3.5 text-sm font-black uppercase tracking-wide text-black shadow-lg"
              style={{ backgroundColor: accent, boxShadow: `0 16px 48px ${accent}55` }}
            >
              Buy {p.displayTicker}
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-[11px] text-white/70">
              <SolanaLogo className="h-3.5 w-3.5" />
              {p.caLabel}
            </span>
          </div>
        </div>
      </div>
      <div className={p.full ? 'mt-16' : 'mt-6'}>
        <MemeFooter p={p} accent={accent} />
      </div>
    </div>
  );
}

/** Loud lime stadium — degen billboard energy. */
function LayoutStadium(p: LayoutProps) {
  const accent = accentOr(p.theme, '#c8ff3d');
  return (
    <div className="min-h-full bg-black text-white">
      <div
        className={`relative overflow-hidden ${p.full ? 'px-4 pb-8 pt-5 sm:px-6' : 'px-3 pb-4 pt-3'}`}
        style={{
          background: `linear-gradient(145deg, ${accent} 0%, #9be015 40%, #111 40.2%, #000 100%)`,
        }}
      >
        <p className="font-display text-[10px] font-black uppercase tracking-[0.28em] text-black/70">
          Stadium · {p.displayTicker}
        </p>
        <h1
          className={`mt-3 max-w-[12ch] font-display font-black uppercase leading-[0.82] tracking-tighter text-black ${
            p.full ? 'text-[clamp(3.2rem,15vw,6.5rem)]' : 'text-4xl'
          }`}
        >
          {p.displayName}
        </h1>
        <p className={`mt-4 max-w-sm font-semibold text-black/70 ${p.full ? 'text-base' : 'text-xs'}`}>
          {p.headline || 'New mint. Loud page. Tap buy.'}
        </p>
      </div>

      <div className={`grid bg-[#0a0a0a] ${p.full ? 'sm:grid-cols-2' : ''}`}>
        <div
          className={`grid place-items-center border-b border-white/10 sm:border-b-0 sm:border-r ${
            p.full ? 'min-h-[260px] p-8' : 'h-32 p-4'
          }`}
        >
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className={`${p.full ? 'h-48 w-48' : 'h-24 w-24'} rounded-3xl object-cover ring-4`}
              style={{ boxShadow: `0 0 0 4px ${accent}` }}
            />
          ) : null}
        </div>
        <div className={`flex flex-col justify-center ${p.full ? 'gap-5 p-8' : 'gap-2 p-4'}`}>
          <p className="font-display text-2xl font-black uppercase leading-tight sm:text-3xl">
            {p.paragraphs[0] || `${p.displayTicker} is cooking.`}
          </p>
          <span
            className="inline-flex w-fit rounded-xl px-5 py-3 text-sm font-black uppercase text-black"
            style={{ backgroundColor: accent }}
          >
            Ape {p.displayTicker} →
          </span>
          <p className="font-mono text-[11px] text-white/40">{p.caLabel}</p>
        </div>
      </div>

      <MemeFooter p={{ ...p, paragraphs: p.paragraphs.slice(1) }} accent={accent} />
    </div>
  );
}

/** Cyber neon night market. */
function LayoutNeon(p: LayoutProps) {
  const accent = accentOr(p.theme, '#2ee6ff');
  return (
    <div className="relative min-h-full overflow-hidden bg-[#06010f] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage: `
            linear-gradient(${accent}18 1px, transparent 1px),
            linear-gradient(90deg, ${accent}18 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 20% 0%, #d946ef44, transparent 45%), radial-gradient(ellipse at 90% 30%, ${accent}33, transparent 40%)`,
        }}
      />
      <div className={`relative ${p.full ? 'px-5 pt-8 sm:px-10' : 'px-3 pt-4'}`}>
        <div className="flex items-center justify-between border border-white/15 bg-black/50 px-3 py-2 backdrop-blur">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: accent }}>
            Neon · {p.displayTicker}
          </span>
          <span className="font-mono text-[10px] text-white/50">SOL / MEME</span>
        </div>

        <div className={`${p.full ? 'mt-12' : 'mt-5'} grid gap-8 sm:grid-cols-[1.1fr_0.9fr] sm:items-center`}>
          <div>
            <h1
              className={`font-display font-black uppercase leading-[0.88] tracking-tight ${
                p.full ? 'text-5xl sm:text-7xl' : 'text-3xl'
              }`}
            >
              <span className="block text-white">{p.displayName.split(' ')[0]}</span>
              <span className="block" style={{ color: accent }}>
                {p.displayName.split(' ').slice(1).join(' ') || p.displayTicker}
              </span>
            </h1>
            <p className={`mt-4 text-white/60 ${p.full ? 'text-base' : 'text-xs'}`}>
              {p.headline || 'Night market energy. One tap buy.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span
                className="rounded-lg px-5 py-3 text-xs font-black uppercase tracking-wide text-black"
                style={{ backgroundColor: accent }}
              >
                Buy {p.displayTicker}
              </span>
              <span className="rounded-lg border border-white/20 px-4 py-3 font-mono text-[10px] text-white/60">
                {p.caLabel}
              </span>
            </div>
          </div>
          {p.logoUrl ? (
            <div className={`justify-self-center ${p.full ? 'h-52 w-52' : 'h-28 w-28'}`}>
              <div
                className="h-full w-full rounded-full p-[3px]"
                style={{ background: `conic-gradient(from 180deg, ${accent}, #d946ef, ${accent})` }}
              >
                <img
                  src={p.logoUrl}
                  alt=""
                  className="h-full w-full rounded-full object-cover bg-black"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className={p.full ? 'mt-16' : 'mt-4'}>
        <MemeFooter p={p} accent={accent} />
      </div>
    </div>
  );
}

/** Chart-first pump page. */
function LayoutPump(p: LayoutProps) {
  const accent = accentOr(p.theme, '#22c55e');
  return (
    <div className="min-h-full bg-[#040a06] text-white">
      <div className={`${p.full ? 'px-5 pt-6 sm:px-8' : 'px-3 pt-3'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400/80">
              Pump · {p.displayTicker}
            </p>
            <h1
              className={`mt-1 font-display font-black tracking-tight ${
                p.full ? 'text-4xl sm:text-6xl' : 'text-2xl'
              }`}
            >
              {p.displayName}
            </h1>
          </div>
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className={`${p.full ? 'h-16 w-16' : 'h-12 w-12'} rounded-2xl object-cover ring-2 ring-emerald-400/40`}
            />
          ) : null}
        </div>

        <p className={`mt-3 text-white/55 ${p.full ? 'text-base' : 'text-xs'}`}>
          {p.headline || `${p.displayTicker} launch chart — ape in.`}
        </p>

        <div
          className={`mt-5 overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-b from-emerald-500/10 to-black/60 ${
            p.full ? 'p-4' : 'p-2'
          }`}
        >
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-300">+128.4% 24h</span>
            <span className="font-mono text-white/40">{p.caLabel}</span>
          </div>
          <MiniChart accent={accent} chartId={`${p.rawTicker}-pump`} />
        </div>

        <div className={`flex gap-2 ${p.full ? 'mt-6' : 'mt-3'}`}>
          <span
            className="flex-1 rounded-2xl py-3.5 text-center text-sm font-black uppercase text-black"
            style={{ backgroundColor: accent }}
          >
            Buy {p.displayTicker}
          </span>
          <span className="flex-1 rounded-2xl border border-white/15 py-3.5 text-center text-sm font-bold text-white/70">
            Chart
          </span>
        </div>
      </div>
      <div className={p.full ? 'mt-14' : 'mt-4'}>
        <MemeFooter p={p} accent={accent} />
      </div>
    </div>
  );
}

/** Dark glass trading page. */
function LayoutGlass(p: LayoutProps) {
  const accent = accentOr(p.theme, '#a78bfa');
  return (
    <div
      className="relative min-h-full overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(ellipse at top, #1a1030 0%, #07070c 45%, #030308 100%)',
      }}
    >
      <div className={`relative ${p.full ? 'px-5 pt-10 sm:px-10' : 'px-3 pt-5'}`}>
        <div className="mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className={`${p.full ? 'p-6 sm:p-8' : 'p-4'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
                  Glass · Trade
                </p>
                <h1
                  className={`mt-2 font-display font-extrabold tracking-tight ${
                    p.full ? 'text-4xl sm:text-5xl' : 'text-2xl'
                  }`}
                >
                  {p.displayName}
                </h1>
                <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>
                  {p.displayTicker}
                </p>
              </div>
              {p.logoUrl ? (
                <img
                  src={p.logoUrl}
                  alt=""
                  className={`${p.full ? 'h-20 w-20' : 'h-14 w-14'} rounded-3xl object-cover ring-1 ring-white/25`}
                />
              ) : null}
            </div>

            <p className={`mt-5 text-white/55 ${p.full ? 'text-[15px]' : 'text-xs'}`}>
              {p.headline || 'Premium trade card. Clear CA. Instant buy.'}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">Network</p>
                <p className="mt-1 text-sm font-bold">Solana</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/35">Supply</p>
                <p className="mt-1 text-sm font-bold">
                  {formatTokenSupplyShort(p.tokenSupply ?? '1000000000')}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 px-3 py-3 font-mono text-[11px] text-white/60">
              <SolanaLogo className="mr-2 inline h-3.5 w-3.5" />
              {p.caLabel}
            </div>

            <span
              className="mt-5 flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-black uppercase tracking-wide text-black"
              style={{ background: `linear-gradient(135deg, ${accent}, #c4b5fd)` }}
            >
              Buy {p.displayTicker} on CTOgo
            </span>
          </div>
        </div>
      </div>
      <div className={p.full ? 'mt-14' : 'mt-4'}>
        <MemeFooter p={p} accent={accent} />
      </div>
    </div>
  );
}

export const ONE_PAGER_LAYOUT_COMPONENTS: Record<
  OnePagerLayoutId,
  (p: LayoutProps) => ReactElement
> = {
  pulse: LayoutPulse,
  stadium: LayoutStadium,
  neon: LayoutNeon,
  pump: LayoutPump,
  glass: LayoutGlass,
};

export type { LayoutProps };
