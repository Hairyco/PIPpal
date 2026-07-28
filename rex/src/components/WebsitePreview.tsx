import { X } from 'lucide-react';
import type { ReactElement } from 'react';
import { SolanaLogo } from './SolanaLogo';
import {
  DEFAULT_ONE_PAGER_INCLUDES,
  DEFAULT_ONE_PAGER_THEME_ID,
  getOnePagerTheme,
  onePagerLayoutLabel,
  resolveOnePagerLayout,
  splitSiteCopy,
  type OnePagerIncludes,
  type OnePagerLayoutId,
  type OnePagerLayoutPreference,
  type OnePagerTheme,
  type OnePagerThemeId,
} from '../data/onePagerTheme';
import { formatTokenSupplyShort } from '../data/tokenSupplyOptions';

export type WebsiteKind = 'onepager' | 'clone';

export type WebsitePreviewProps = {
  kind: WebsiteKind;
  name: string;
  ticker: string;
  /** @deprecated prefer headline + body */
  blurb?: string;
  headline?: string;
  body?: string;
  extraTitle?: string;
  extraBody?: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  contract?: string;
  cloneUrl?: string;
  variant?: 'card' | 'fullscreen';
  themeId?: OnePagerThemeId;
  layoutPreference?: OnePagerLayoutPreference;
  layoutSeed?: number;
  /** When set, wins over preference/seed — use this for guaranteed unique regenerates. */
  layoutId?: OnePagerLayoutId;
  designNonce?: number;
  includes?: OnePagerIncludes;
  tokenSupply?: string;
};

function formatCaChip(contract?: string): string {
  const mint = contract?.trim();
  if (!mint) return 'CA pending';
  if (mint.length <= 10) return `CA ${mint}`;
  return `CA ${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

function usePreviewLabels(props: WebsitePreviewProps) {
  const displayName = props.name.trim() || 'Your coin';
  const rawTicker = props.ticker.trim().replace(/^\$/, '').toUpperCase() || 'TICKER';
  const displayTicker = `$${rawTicker}`;
  const slug = rawTicker.toLowerCase() || 'ticker';
  const caLabel = formatCaChip(props.contract);
  const hostLabel =
    props.kind === 'clone' && props.cloneUrl?.trim()
      ? props.cloneUrl.replace(/^https?:\/\//, '').split('/')[0]
      : `${slug}.ctogo.app`;
  const headline = (props.headline ?? '').trim();
  const body = (props.body ?? props.blurb ?? '').trim();
  const paragraphs = splitSiteCopy(body);
  const extraTitle = (props.extraTitle ?? '').trim();
  const extraBody = (props.extraBody ?? '').trim();
  return {
    displayName,
    displayTicker,
    rawTicker,
    slug,
    caLabel,
    hostLabel,
    headline,
    body,
    paragraphs,
    extraTitle,
    extraBody,
  };
}

function MiniChart({ accent, full, chartId = 'chart' }: { accent: string; full: boolean; chartId?: string }) {
  const h = full ? 160 : 52;
  const points = [22, 28, 26, 38, 34, 48, 42, 58, 52, 70, 62, 78, 72, 88, 84, 96];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const w = 360;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - 10 - ((p - min) / span) * (h - 24);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const fillId = `${chartId}-fill`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} aria-hidden>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#${fillId})`} />
      <path d={path} fill="none" stroke={accent} strokeWidth={full ? 2.75 : 2} strokeLinecap="round" />
    </svg>
  );
}

function BuyPill({
  label,
  theme,
  large,
}: {
  label: string;
  theme: OnePagerTheme;
  large?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center font-display font-bold uppercase tracking-wide ${
        large ? 'rounded-2xl px-7 py-3.5 text-sm sm:text-base' : 'rounded-full px-4 py-2 text-[11px]'
      }`}
      style={{
        background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})`,
        color: theme.buyText,
        boxShadow: `0 12px 40px ${theme.accent}33`,
      }}
    >
      {label}
    </span>
  );
}

type SectionTone = 'dark' | 'light' | 'brutal' | 'noir';

function TokenomicsStrip({
  theme,
  tokenSupply,
  full,
  tone = 'dark',
}: {
  theme: OnePagerTheme;
  tokenSupply?: string;
  full: boolean;
  tone?: SectionTone;
}) {
  const stats = [
    { value: formatTokenSupplyShort(tokenSupply ?? '1000000000'), label: 'Supply' },
    { value: 'On', label: 'Trade tax' },
    { value: 'Burnt', label: 'LP' },
  ];
  const light = tone === 'light';
  const brutal = tone === 'brutal';
  const noir = tone === 'noir';
  return (
    <div className={`mx-auto grid max-w-lg grid-cols-3 ${full ? 'gap-3' : 'gap-2'}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`text-center ${
            brutal
              ? 'rounded-none border-2 border-black px-2 py-4'
              : noir
                ? 'rounded-none border border-white/30 px-2 py-4'
                : full
                  ? 'rounded-2xl border px-3 py-5'
                  : 'rounded-xl border px-2 py-3'
          }`}
          style={{
            borderColor: brutal || noir ? undefined : light ? 'rgba(0,0,0,0.12)' : `${theme.accent}33`,
            background: brutal
              ? theme.accent
              : light
                ? '#fff'
                : noir
                  ? 'transparent'
                  : 'rgba(255,255,255,0.03)',
          }}
        >
          <p
            className={`font-display font-bold ${full ? 'text-xl' : 'text-sm'} ${
              brutal ? 'text-black' : ''
            }`}
            style={{ color: brutal ? undefined : light ? '#111' : theme.accent }}
          >
            {stat.value}
          </p>
          <p
            className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              brutal ? 'text-black/55' : light ? 'text-black/40' : 'text-white/40'
            }`}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function SharedSections({
  full,
  theme,
  includes,
  rawTicker,
  displayTicker,
  caLabel,
  tokenSupply,
  paragraphs,
  headline,
  extraTitle,
  extraBody,
  chartId = 'site',
  tone = 'dark',
}: {
  full: boolean;
  theme: OnePagerTheme;
  includes: OnePagerIncludes;
  rawTicker: string;
  displayTicker: string;
  caLabel: string;
  tokenSupply?: string;
  paragraphs: string[];
  headline: string;
  extraTitle: string;
  extraBody: string;
  chartId?: string;
  tone?: SectionTone;
}) {
  if (!full) return null;
  const light = tone === 'light';
  const brutal = tone === 'brutal';
  const noir = tone === 'noir';
  const labelCls = light
    ? 'text-black/40'
    : brutal
      ? 'text-black/50'
      : 'text-white/35';
  const bodyColor = light || brutal ? 'rgba(0,0,0,0.62)' : theme.muted;
  const headColor = light ? '#111' : brutal ? '#000' : theme.accent;
  const panelBg = light ? '#fff' : brutal ? '#f4f4f0' : noir ? 'transparent' : 'rgba(0,0,0,0.35)';
  const panelBorder = light
    ? 'rgba(0,0,0,0.1)'
    : brutal
      ? '#000'
      : noir
        ? 'rgba(255,255,255,0.28)'
        : `${theme.accent}28`;

  return (
    <div className={`space-y-16 ${brutal ? 'space-y-10' : ''}`}>
      <section className={`mx-auto max-w-2xl ${light || brutal ? 'text-left sm:text-center' : 'text-center'}`}>
        <h2
          className={`tracking-tight ${
            brutal
              ? 'font-display text-3xl font-black uppercase sm:text-4xl'
              : light
                ? 'font-editorial text-3xl sm:text-4xl'
                : noir
                  ? 'font-display text-2xl font-bold uppercase tracking-[0.08em] sm:text-3xl'
                  : 'font-display text-2xl font-bold sm:text-3xl'
          }`}
          style={{ color: headColor }}
        >
          {headline || 'The story'}
        </h2>
        <div className="mt-5 space-y-4">
          {paragraphs.length > 0 ? (
            paragraphs.map((p) => (
              <p
                key={p.slice(0, 32)}
                className={`leading-relaxed ${light ? 'text-base sm:text-lg' : 'text-[15px] sm:text-base'}`}
                style={{ color: bodyColor }}
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-[15px] leading-relaxed sm:text-base" style={{ color: bodyColor }}>
              Clean mint, live trade links, and a page built to look like the project means it.
            </p>
          )}
        </div>
      </section>

      {includes.chart ? (
        <section className="mx-auto max-w-xl">
          <p className={`mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] ${labelCls}`}>
            Price action
          </p>
          <div
            className={`overflow-hidden px-4 py-5 ${
              brutal ? 'rounded-none border-2' : noir ? 'rounded-none border' : 'rounded-3xl border shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
            }`}
            style={{ borderColor: panelBorder, background: panelBg }}
          >
            <MiniChart
              accent={light || brutal ? (theme.accent === '#ffffff' ? '#111' : theme.accent) : theme.accent}
              full
              chartId={chartId}
            />
          </div>
        </section>
      ) : null}

      <section className="text-center">
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${labelCls}`}>
          {rawTicker} contract
        </p>
        <div
          className={`mt-3 inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs ${
            brutal
              ? 'rounded-none border-2 border-black bg-white text-black'
              : light
                ? 'rounded-full border border-black/15 bg-white text-black/70'
                : noir
                  ? 'rounded-none border border-white/30 text-white/80'
                  : 'rounded-full border border-white/15 bg-white/[0.04] text-white/80'
          }`}
        >
          <SolanaLogo className="h-4 w-4 shrink-0" />
          <span>{caLabel}</span>
        </div>
        <div className="mt-6">
          {brutal ? (
            <span
              className="inline-flex rounded-none px-7 py-3.5 font-display text-sm font-black uppercase text-black"
              style={{ backgroundColor: theme.accent === '#ffffff' || theme.accent === '#111111' ? '#c8ff3d' : theme.accent }}
            >
              Buy {displayTicker}
            </span>
          ) : (
            <BuyPill label={`Buy ${displayTicker}`} theme={theme} large />
          )}
        </div>
      </section>

      {includes.tokenomics ? (
        <section>
          <p className={`mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] ${labelCls}`}>
            Tokenomics
          </p>
          <TokenomicsStrip theme={theme} tokenSupply={tokenSupply} full tone={tone} />
        </section>
      ) : null}

      {includes.howto ? (
        <section className="mx-auto max-w-md">
          <p className={`mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] ${labelCls}`}>
            How to buy
          </p>
          <ol className="space-y-2">
            {[
              'Connect a Solana wallet',
              `Open ${displayTicker} on CTOgo`,
              'Buy with SOL — you’re in',
            ].map((step, i) => (
              <li
                key={step}
                className={`flex items-center gap-3 px-3 py-3 text-sm ${
                  brutal
                    ? 'rounded-none border-2 border-black bg-white'
                    : light
                      ? 'rounded-2xl border border-black/10 bg-white'
                      : noir
                        ? 'rounded-none border border-white/20'
                        : 'rounded-2xl border border-white/10 bg-white/[0.03]'
                }`}
                style={{ color: bodyColor }}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center font-display text-xs font-bold ${
                    brutal || noir ? 'rounded-none' : 'rounded-full'
                  }`}
                  style={{
                    backgroundColor: light || brutal ? (theme.accent === '#ffffff' ? '#111' : theme.accent) : theme.accent,
                    color: theme.buyText,
                  }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {includes.community ? (
        <section className="mx-auto max-w-lg text-center">
          <p
            className={`tracking-tight ${
              brutal
                ? 'font-display text-2xl font-black uppercase'
                : light
                  ? 'font-editorial text-2xl sm:text-3xl'
                  : 'font-display text-xl font-bold sm:text-2xl'
            }`}
            style={{ color: headColor }}
          >
            Same holders. Louder chapter.
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: bodyColor }}>
            Join the group, keep the narrative sharp, and trade where the page lives.
          </p>
        </section>
      ) : null}

      {extraTitle || extraBody ? (
        <section className="mx-auto max-w-2xl text-center">
          {extraTitle ? (
            <h2
              className={`tracking-tight ${
                light ? 'font-editorial text-3xl' : brutal ? 'font-display text-2xl font-black uppercase' : 'font-display text-2xl font-bold'
              }`}
              style={{ color: headColor }}
            >
              {extraTitle}
            </h2>
          ) : null}
          {extraBody ? (
            <div className="mt-4 space-y-3">
              {splitSiteCopy(extraBody).map((p) => (
                <p key={p.slice(0, 24)} className="text-sm leading-relaxed" style={{ color: bodyColor }}>
                  {p}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {includes.socials ? (
        <p className={`text-center text-[11px] tracking-[0.18em] ${labelCls}`}>TELEGRAM · X · CHART</p>
      ) : null}

      <div className="pb-12 text-center">
        <span
          className={`inline-flex px-4 py-2 text-[11px] font-semibold ${
            brutal
              ? 'rounded-none border-2 border-black text-black'
              : light
                ? 'rounded-full border border-black/15 text-black/45'
                : 'rounded-full border border-white/12 text-white/40'
          }`}
        >
          Marketing wallet · Live after launch
        </span>
        <p className={`mt-6 text-[10px] tracking-wide ${light || brutal ? 'text-black/30' : 'text-white/25'}`}>
          © {new Date().getFullYear()} {displayTicker}
        </p>
      </div>
    </div>
  );
}

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

function LayoutAurora(p: LayoutProps) {
  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ backgroundColor: p.theme.bg, color: p.theme.text }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 15% -10%, ${p.theme.accent}55, transparent 55%),
            radial-gradient(ellipse 70% 50% at 95% 20%, ${p.theme.accentSoft}40, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 100%, ${p.theme.accent}22, transparent 55%),
            linear-gradient(180deg, ${p.theme.bg} 0%, #03050a 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className={`relative ${p.full ? 'px-5 pb-10 pt-8 sm:px-12 sm:pt-10' : 'px-4 pb-6 pt-5'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt=""
                className={`rounded-2xl object-cover shadow-lg ring-1 ring-white/20 ${
                  p.full ? 'h-12 w-12' : 'h-9 w-9'
                }`}
              />
            ) : null}
            <div>
              <p className="font-display text-sm font-bold tracking-tight sm:text-base">
                {p.displayName}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Aurora · {p.displayTicker}
              </p>
            </div>
          </div>
          <BuyPill label={`Buy ${p.displayTicker}`} theme={p.theme} large={p.full} />
        </div>

        <div className={`mx-auto max-w-3xl text-center ${p.full ? 'mt-16 sm:mt-20' : 'mt-8'}`}>
          <p
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.theme.accent }} />
            {p.displayTicker} · Live
          </p>
          <h1
            className={`mt-5 font-display font-extrabold leading-[0.92] tracking-tight ${
              p.full ? 'text-5xl sm:text-7xl md:text-8xl' : 'text-4xl'
            }`}
            style={{
              background: `linear-gradient(135deg, #fff 10%, ${p.theme.accentSoft} 45%, ${p.theme.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {p.displayName}
          </h1>
          <p
            className={`mx-auto mt-5 max-w-xl font-editorial italic leading-snug ${
              p.full ? 'text-xl sm:text-2xl' : 'text-base'
            }`}
            style={{ color: p.theme.muted }}
          >
            {p.headline || `A louder chapter for ${p.displayTicker}.`}
          </p>

          <div
            className={`relative mx-auto grid place-items-center ${
              p.full ? 'mt-12 h-52 w-52 sm:h-64 sm:w-64' : 'mt-8 h-32 w-32'
            }`}
          >
            <div
              className="absolute inset-[-18%] rounded-full opacity-60 blur-2xl"
              style={{ background: `radial-gradient(circle, ${p.theme.accent}88, transparent 65%)` }}
            />
            {p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt=""
                className="relative h-full w-full object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
              />
            ) : (
              <div
                className="relative grid h-full w-full place-items-center rounded-full font-display text-4xl font-bold"
                style={{ background: p.theme.accent, color: p.theme.buyText }}
              >
                {p.rawTicker.slice(0, 2)}
              </div>
            )}
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-3 ${p.full ? 'mt-10' : 'mt-6'}`}>
            <BuyPill label={`Buy ${p.displayTicker} on CTOgo`} theme={p.theme} large />
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2.5 font-mono text-[11px] text-white/70 backdrop-blur">
              <SolanaLogo className="h-3.5 w-3.5" />
              {p.caLabel}
            </span>
          </div>
        </div>

        {p.full ? (
          <div className="mt-20 sm:mt-24">
            <SharedSections {...p} chartId="aurora" tone="dark" />
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
            {p.includes.chart ? <MiniChart accent={p.theme.accent} full={false} chartId="aurora-card" /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutEditorial(p: LayoutProps) {
  const ink = p.theme.accent === '#ffffff' ? '#111111' : p.theme.accent;
  return (
    <div className="min-h-full" style={{ backgroundColor: '#f6f1e8', color: '#14110e' }}>
      <div
        className={`border-b border-black/80 ${p.full ? 'px-5 py-5 sm:px-10' : 'px-3 py-3'}`}
      >
        <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
          <span>Vol. {p.rawTicker}</span>
          <span>Editorial issue</span>
          <span>Live</span>
        </div>
        <h1
          className={`mt-6 font-editorial leading-[0.88] tracking-tight ${
            p.full ? 'text-[clamp(3.2rem,12vw,6.5rem)]' : 'text-3xl'
          }`}
        >
          {p.displayName}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/15 pt-4">
          <p className={`max-w-md font-editorial italic leading-snug ${p.full ? 'text-xl' : 'text-sm'}`}>
            {p.headline || `${p.displayName} — a page with presence.`}
          </p>
          <span
            className="shrink-0 rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: ink }}
          >
            Buy {p.displayTicker}
          </span>
        </div>
      </div>

      <div className={`${p.full ? 'px-5 py-8 sm:px-10' : 'px-3 py-4'}`}>
        <div
          className={`relative overflow-hidden border border-black/10 bg-[#1a1814] ${
            p.full ? 'aspect-[4/5] max-h-[520px] w-full' : 'h-36'
          }`}
        >
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-95"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <p className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
            Cover · {p.displayTicker}
          </p>
        </div>
        {p.full && p.paragraphs[0] ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/65">{p.paragraphs[0]}</p>
        ) : null}
        <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] text-black/45">
          <SolanaLogo className="h-3.5 w-3.5" />
          {p.caLabel}
        </div>
      </div>

      {p.full ? (
        <div className="border-t border-black/10 bg-[#efe8dc] px-5 py-12 sm:px-10">
          <SharedSections
            {...p}
            paragraphs={p.paragraphs.slice(1)}
            chartId="editorial"
            tone="light"
          />
        </div>
      ) : null}
    </div>
  );
}

function LayoutNoir(p: LayoutProps) {
  const accent = p.theme.accent === '#ffffff' ? '#e8e8e8' : p.theme.accent;
  return (
    <div className="relative min-h-full overflow-hidden bg-black text-white">
      {/* Letterbox bars — unmistakable vs Aurora glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-white sm:h-4" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-white sm:h-4" />
      <div
        className={`relative ${p.full ? 'px-5 py-14 sm:px-12 sm:py-16' : 'px-3 py-6'}`}
      >
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">
            Noir · {p.displayTicker}
          </span>
          <span
            className="rounded-none border border-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white"
          >
            Buy
          </span>
        </div>

        <div className={`${p.full ? 'mt-10' : 'mt-4'}`}>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>
            {p.headline || 'Now screening'}
          </p>
          <h1
            className={`mt-3 font-display font-black uppercase leading-[0.85] tracking-tighter text-white ${
              p.full ? 'text-[clamp(3rem,14vw,7rem)]' : 'text-4xl'
            }`}
          >
            {p.displayName}
          </h1>
        </div>

        <div
          className={`mt-8 grid items-center gap-6 border border-white/25 ${
            p.full ? 'grid-cols-[1fr_auto] p-6' : 'p-3'
          }`}
        >
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className={`object-contain grayscale contrast-125 ${p.full ? 'h-40 w-40' : 'h-20 w-20'}`}
            />
          ) : (
            <div
              className={`grid place-items-center border border-white/30 font-display font-black ${
                p.full ? 'h-40 w-40 text-4xl' : 'h-20 w-20 text-xl'
              }`}
            >
              {p.rawTicker.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-mono text-[11px] leading-relaxed text-white/55">
              {p.paragraphs[0] || `${p.displayName} — cinematic one-pager. Trade live.`}
            </p>
            <p className="mt-4 font-mono text-[10px] text-white/35">{p.caLabel}</p>
          </div>
        </div>

        {p.full ? (
          <div className="mt-16">
            <SharedSections {...p} paragraphs={p.paragraphs.slice(1)} chartId="noir" tone="noir" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LayoutBrutal(p: LayoutProps) {
  const accent =
    p.theme.accent === '#ffffff' || p.theme.accent === '#111111' ? '#c8ff3d' : p.theme.accent;
  return (
    <div className="min-h-full bg-[#f2f0ea] text-black">
      <div className={`${p.full ? 'px-4 py-6 sm:px-6' : 'px-3 py-3'}`} style={{ backgroundColor: accent }}>
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-[10px] font-black uppercase tracking-[0.25em] text-black">
            Brutal · {p.displayTicker}
          </p>
          <p className="font-mono text-[10px] font-bold uppercase text-black/60">No soft edges</p>
        </div>
        <h1
          className={`mt-3 font-display font-black uppercase leading-[0.8] tracking-tighter text-black ${
            p.full ? 'text-[clamp(3rem,16vw,7rem)]' : 'text-3xl'
          }`}
        >
          {p.displayName}
        </h1>
      </div>

      <div className="grid border-b-4 border-black sm:grid-cols-2">
        <div
          className={`grid place-items-center border-b-4 border-black bg-black sm:border-b-0 sm:border-r-4 ${
            p.full ? 'min-h-[280px] p-6' : 'h-28 p-3'
          }`}
        >
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className={`${p.full ? 'h-48 w-48' : 'h-20 w-20'} object-contain`}
            />
          ) : null}
        </div>
        <div className={`flex flex-col justify-between ${p.full ? 'p-6' : 'p-3'}`}>
          <p className={`font-display font-black uppercase leading-[0.95] ${p.full ? 'text-2xl' : 'text-sm'}`}>
            {p.headline || 'NEW MINT. NO NOISE.'}
          </p>
          {p.full && p.paragraphs[0] ? (
            <p className="mt-4 text-sm leading-relaxed text-black/60">{p.paragraphs[0]}</p>
          ) : null}
          <div className="mt-6">
            <span
              className="inline-flex rounded-none border-2 border-black px-5 py-3 font-display text-sm font-black uppercase text-black"
              style={{ backgroundColor: accent }}
            >
              Buy {p.displayTicker} →
            </span>
          </div>
        </div>
      </div>

      {p.full ? (
        <div className="px-4 py-12 sm:px-6">
          <SharedSections {...p} paragraphs={p.paragraphs.slice(1)} chartId="brutal" tone="brutal" />
        </div>
      ) : null}
    </div>
  );
}

function LayoutGallery(p: LayoutProps) {
  const ink = p.theme.accent === '#ffffff' ? '#161616' : p.theme.accent;
  return (
    <div className="min-h-full bg-[#f7f5f1]" style={{ color: '#161616' }}>
      <div className={`text-center ${p.full ? 'px-6 pb-2 pt-14 sm:pt-16' : 'px-3 pb-2 pt-5'}`}>
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/35">
          Gallery presentation · {p.displayTicker}
        </p>
        <h1
          className={`mx-auto mt-5 max-w-xl font-editorial leading-[0.95] ${
            p.full ? 'text-[clamp(2.8rem,10vw,5.5rem)]' : 'text-3xl'
          }`}
        >
          {p.displayName}
        </h1>
        <p className={`mx-auto mt-4 max-w-sm text-black/50 ${p.full ? 'text-base' : 'text-xs'}`}>
          {p.headline || `${p.displayName} — presented simply.`}
        </p>
      </div>

      <div className={`mx-auto ${p.full ? 'max-w-lg px-6' : 'px-3'}`}>
        <div
          className={`relative mx-auto overflow-hidden bg-white shadow-[0_40px_80px_rgba(0,0,0,0.08)] ring-1 ring-black/5 ${
            p.full ? 'aspect-[3/4] p-8' : 'h-40 p-4'
          }`}
        >
          <div className="flex h-full items-center justify-center bg-[#eceae4]">
            {p.logoUrl ? (
              <img src={p.logoUrl} alt="" className="h-[78%] w-[78%] object-contain" />
            ) : null}
          </div>
        </div>
      </div>

      <div className={`flex flex-col items-center gap-3 ${p.full ? 'mt-10' : 'mt-4'}`}>
        <span
          className="inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: ink }}
        >
          Buy {p.displayTicker}
        </span>
        <p className="font-mono text-[10px] text-black/35">{p.caLabel}</p>
      </div>

      {p.full ? (
        <div className="mt-16 border-t border-black/8 bg-[#f7f5f1] px-6 py-12 sm:px-10">
          <SharedSections {...p} chartId="gallery" tone="light" />
        </div>
      ) : null}
    </div>
  );
}

const LAYOUTS: Record<OnePagerLayoutId, (p: LayoutProps) => ReactElement> = {
  aurora: LayoutAurora,
  editorial: LayoutEditorial,
  noir: LayoutNoir,
  brutal: LayoutBrutal,
  gallery: LayoutGallery,
};

function PremiumOnePager(props: {
  variant: 'card' | 'fullscreen';
  themeId?: OnePagerThemeId;
  layoutPreference?: OnePagerLayoutPreference;
  layoutSeed?: number;
  layoutId?: OnePagerLayoutId;
  designNonce?: number;
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
}) {
  const full = props.variant === 'fullscreen';
  const theme = getOnePagerTheme(props.themeId ?? DEFAULT_ONE_PAGER_THEME_ID);
  const layoutId =
    props.layoutId ??
    resolveOnePagerLayout(props.layoutPreference, props.layoutSeed ?? 0);
  const Layout = LAYOUTS[layoutId];
  return (
    <Layout
      key={`${layoutId}-${props.designNonce ?? 0}-${props.themeId ?? 'theme'}`}
      full={full}
      theme={theme}
      displayName={props.displayName}
      displayTicker={props.displayTicker}
      rawTicker={props.rawTicker}
      caLabel={props.caLabel}
      logoUrl={props.logoUrl}
      headline={props.headline}
      paragraphs={props.paragraphs}
      includes={props.includes}
      tokenSupply={props.tokenSupply}
      extraTitle={props.extraTitle}
      extraBody={props.extraBody}
    />
  );
}

function CloneBody({
  variant,
  displayName,
  displayTicker,
  logoUrl,
  bannerUrl,
  cloneUrl,
}: {
  variant: 'card' | 'fullscreen';
  displayName: string;
  displayTicker: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  cloneUrl?: string;
}) {
  const full = variant === 'fullscreen';
  return (
    <div className={`bg-[#07090f] ${full ? 'space-y-4 p-4 sm:p-6' : 'space-y-3 p-3'}`}>
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2">
        <p className="text-[10px] font-semibold text-white/35">Source</p>
        <p className="mt-0.5 truncate text-[12px] text-white/70">
          {cloneUrl?.trim() || 'Paste the old website URL'}
        </p>
      </div>
      <div
        className={`relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#0c0f18] ${
          full ? 'h-[50vh] min-h-[280px]' : 'h-36'
        }`}
      >
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover opacity-80" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-white/25">
            Clone layout preview
          </div>
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className={`rounded-lg object-cover ${full ? 'h-14 w-14' : 'h-9 w-9'}`}
              />
            ) : null}
            <div>
              <p className={`font-bold text-white ${full ? 'text-xl' : 'text-sm'}`}>{displayName}</p>
              <p className={`text-[#c8ff3d] ${full ? 'text-sm' : 'text-[10px]'}`}>{displayTicker}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WebsitePreview(props: WebsitePreviewProps) {
  const variant = props.variant ?? 'card';
  const labels = usePreviewLabels(props);
  const layoutId =
    props.layoutId ??
    resolveOnePagerLayout(props.layoutPreference, props.layoutSeed ?? 0);
  const pager = (
    <PremiumOnePager
      key={`pager-${layoutId}-${props.designNonce ?? 0}`}
      variant="fullscreen"
      themeId={props.themeId}
      layoutPreference={props.layoutPreference}
      layoutSeed={props.layoutSeed}
      layoutId={layoutId}
      designNonce={props.designNonce}
      displayName={labels.displayName}
      displayTicker={labels.displayTicker}
      rawTicker={labels.rawTicker}
      caLabel={labels.caLabel}
      logoUrl={props.logoUrl}
      headline={labels.headline}
      paragraphs={labels.paragraphs}
      includes={props.includes ?? DEFAULT_ONE_PAGER_INCLUDES}
      tokenSupply={props.tokenSupply}
      extraTitle={labels.extraTitle}
      extraBody={labels.extraBody}
    />
  );

  if (props.kind === 'clone') {
    return (
      <div
        className={`overflow-hidden ${
          variant === 'fullscreen'
            ? 'min-h-full'
            : 'rounded-xl border border-white/[0.1] bg-[#07090f]'
        }`}
      >
        {variant === 'card' ? (
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#07090f] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
              Cloned site
            </p>
            <p className="truncate font-mono text-[10px] text-white/30">{labels.hostLabel}</p>
          </div>
        ) : null}
        <CloneBody
          variant={variant}
          displayName={labels.displayName}
          displayTicker={labels.displayTicker}
          logoUrl={props.logoUrl}
          bannerUrl={props.bannerUrl}
          cloneUrl={props.cloneUrl}
        />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#07090f]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
            Generated site
          </p>
          <p className="truncate text-[10px] capitalize text-white/35">{layoutId}</p>
        </div>
        <div className="relative max-h-[460px] overflow-hidden">
          {pager}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07090f] to-transparent" />
        </div>
        <p className="border-t border-white/[0.06] px-3 py-2 text-center text-[10px] text-white/35">
          Full page opens after generate · {labels.hostLabel}
        </p>
      </div>
    );
  }

  return <div className="min-h-full">{pager}</div>;
}

type WebsitePreviewOverlayProps = WebsitePreviewProps & {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onRegenerate?: () => void;
};

export function WebsitePreviewOverlay({
  open,
  onClose,
  onContinue,
  onRegenerate,
  ...preview
}: WebsitePreviewOverlayProps) {
  if (!open) return null;

  const slug = preview.ticker.trim().toLowerCase() || 'ticker';
  const hostLabel =
    preview.kind === 'clone' && preview.cloneUrl?.trim()
      ? preview.cloneUrl.replace(/^https?:\/\//, '').split('/')[0]
      : `${slug}.ctogo.app`;
  const layoutId =
    preview.layoutId ??
    resolveOnePagerLayout(preview.layoutPreference, preview.layoutSeed ?? 0);
  const layoutName = onePagerLayoutLabel(layoutId);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#02040a]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#0b0e16] px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-1.5 pr-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-lg border border-white/[0.08] bg-black/40 px-3 py-1.5 font-mono text-[11px] text-white/55">
          https://{hostLabel}
        </div>
        <p className="shrink-0 rounded-md bg-[#c8ff3d]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d5ff69]">
          {preview.kind === 'clone' ? 'clone' : layoutName}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] text-white/60 hover:bg-white/[0.04] hover:text-white"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" key={`scroll-${preview.designNonce ?? 0}-${layoutId}`}>
        <WebsitePreview {...preview} layoutId={layoutId} variant="fullscreen" />
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/[0.08] bg-[#0b0e16] p-3 sm:px-4">
        <p className="text-center text-[10px] text-white/40">
          Look {preview.designNonce ?? 1}: <span className="font-semibold text-white/70">{layoutName}</span>
          {' · '}
          tap “Try another look” for a different design
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-white/[0.1] text-xs font-semibold text-white/60 hover:bg-white/[0.04] hover:text-white"
          >
            Edit copy
          </button>
          {onRegenerate && preview.kind === 'onepager' ? (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-[#c8ff3d]/30 bg-[#c8ff3d]/10 text-xs font-bold text-[#d5ff69]"
            >
              Try another look
            </button>
          ) : null}
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-12 flex-[1.2] items-center justify-center rounded-xl bg-[#c8ff3d] text-sm font-bold text-[#090b14] hover:bg-[#d5ff69]"
          >
            Looks good
          </button>
        </div>
      </div>
    </div>
  );
}
