import { X } from 'lucide-react';
import type { ReactElement } from 'react';
import { SolanaLogo } from './SolanaLogo';
import {
  DEFAULT_ONE_PAGER_INCLUDES,
  DEFAULT_ONE_PAGER_THEME_ID,
  getOnePagerTheme,
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

function MiniChart({ accent, full }: { accent: string; full: boolean }) {
  const h = full ? 140 : 52;
  const points = [22, 28, 26, 38, 34, 48, 42, 58, 52, 70, 62, 78, 72, 88];
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
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} aria-hidden>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#chartFill)" />
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

function TokenomicsStrip({
  theme,
  tokenSupply,
  full,
}: {
  theme: OnePagerTheme;
  tokenSupply?: string;
  full: boolean;
}) {
  const stats = [
    { value: formatTokenSupplyShort(tokenSupply ?? '1000000000'), label: 'Supply' },
    { value: 'On', label: 'Trade tax' },
    { value: 'Burnt', label: 'LP' },
  ];
  return (
    <div className={`mx-auto grid max-w-lg grid-cols-3 ${full ? 'gap-3' : 'gap-2'}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`border text-center ${full ? 'rounded-2xl px-3 py-5' : 'rounded-xl px-2 py-3'}`}
          style={{
            borderColor: `${theme.accent}33`,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p
            className={`font-display font-bold ${full ? 'text-xl' : 'text-sm'}`}
            style={{ color: theme.accent }}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
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
}) {
  if (!full) return null;
  return (
    <div className="space-y-14">
      {(headline || paragraphs.length > 0) && (
        <section className="mx-auto max-w-2xl text-center">
          {headline ? (
            <h2
              className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: theme.accent }}
            >
              {headline}
            </h2>
          ) : (
            <h2
              className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: theme.accent }}
            >
              The story
            </h2>
          )}
          <div className="mt-4 space-y-3">
            {paragraphs.length > 0 ? (
              paragraphs.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="text-sm leading-relaxed sm:text-base"
                  style={{ color: theme.muted }}
                >
                  {p}
                </p>
              ))
            ) : (
              <p className="text-sm leading-relaxed sm:text-base" style={{ color: theme.muted }}>
                A community takeover with a clean mint, live trade links, and a page built to look
                like the project means it.
              </p>
            )}
          </div>
        </section>
      )}

      {includes.chart ? (
        <section className="mx-auto max-w-xl">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
            Price action
          </p>
          <div
            className="overflow-hidden rounded-2xl border px-4 py-4"
            style={{ borderColor: `${theme.accent}28`, background: 'rgba(0,0,0,0.25)' }}
          >
            <MiniChart accent={theme.accent} full />
          </div>
        </section>
      ) : null}

      <section className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
          {rawTicker} contract
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 font-mono text-xs text-white/80">
          <SolanaLogo className="h-4 w-4 shrink-0" />
          <span>{caLabel}</span>
        </div>
        <div className="mt-5">
          <BuyPill label={`Buy ${displayTicker}`} theme={theme} large />
        </div>
      </section>

      {includes.tokenomics ? (
        <section>
          <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
            Tokenomics
          </p>
          <TokenomicsStrip theme={theme} tokenSupply={tokenSupply} full />
        </section>
      ) : null}

      {includes.howto ? (
        <section className="mx-auto max-w-md">
          <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
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
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm"
                style={{ color: theme.muted }}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-xs font-bold"
                  style={{ backgroundColor: theme.accent, color: theme.buyText }}
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
            className="font-display text-xl font-bold tracking-tight sm:text-2xl"
            style={{ color: theme.accent }}
          >
            Same community. Louder chapter.
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: theme.muted }}>
            Holders move together — join the group, keep the narrative sharp, and trade where the
            page lives.
          </p>
        </section>
      ) : null}

      {extraTitle || extraBody ? (
        <section className="mx-auto max-w-2xl text-center">
          {extraTitle ? (
            <h2
              className="font-display text-2xl font-bold tracking-tight"
              style={{ color: theme.accent }}
            >
              {extraTitle}
            </h2>
          ) : null}
          {extraBody ? (
            <div className="mt-3 space-y-3">
              {splitSiteCopy(extraBody).map((p) => (
                <p key={p.slice(0, 24)} className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                  {p}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {includes.socials ? (
        <p className="text-center text-[11px] tracking-[0.18em] text-white/30">
          TELEGRAM · X · CHART
        </p>
      ) : null}

      <div className="pb-10 text-center">
        <span className="inline-flex rounded-full border border-white/12 px-4 py-2 text-[11px] font-semibold text-white/40">
          Marketing wallet · Live after launch
        </span>
        <p className="mt-6 text-[10px] tracking-wide text-white/25">
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
    <div className="relative min-h-full overflow-hidden" style={{ backgroundColor: p.theme.bg, color: p.theme.text }}>
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
        style={{ background: p.theme.accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: p.theme.accentSoft }}
      />
      <div className={`relative ${p.full ? 'px-5 pb-6 pt-8 sm:px-10' : 'px-3 pb-3 pt-4'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt=""
                className={`rounded-2xl object-cover ring-1 ring-white/15 ${p.full ? 'h-11 w-11' : 'h-8 w-8'}`}
              />
            ) : null}
            <span className="font-display text-sm font-bold tracking-tight">{p.displayName}</span>
          </div>
          <BuyPill label={`Buy ${p.displayTicker}`} theme={p.theme} />
        </div>

        <div className={`text-center ${p.full ? 'mt-14' : 'mt-6'}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">
            Community takeover
          </p>
          <h1
            className={`mt-3 font-display font-extrabold leading-[0.95] tracking-tight ${
              p.full ? 'text-5xl sm:text-7xl' : 'text-3xl'
            }`}
            style={{ color: p.theme.accent }}
          >
            {p.displayName}
          </h1>
          {p.headline ? (
            <p
              className={`mx-auto mt-4 max-w-xl font-editorial italic ${
                p.full ? 'text-xl sm:text-2xl' : 'text-sm'
              }`}
              style={{ color: p.theme.muted }}
            >
              {p.headline}
            </p>
          ) : null}
          <div className={`mx-auto grid place-items-center ${p.full ? 'mt-10 h-48 w-48 sm:h-56 sm:w-56' : 'mt-5 h-24 w-24'}`}>
            {p.logoUrl ? (
              <img
                src={p.logoUrl}
                alt=""
                className="h-full w-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
              />
            ) : (
              <div
                className="grid h-full w-full place-items-center rounded-full font-display text-3xl font-bold"
                style={{ background: p.theme.accent, color: p.theme.buyText }}
              >
                {p.rawTicker.slice(0, 2)}
              </div>
            )}
          </div>
        </div>

        {!p.full ? (
          <div className="mt-4 space-y-2">
            {p.includes.chart ? <MiniChart accent={p.theme.accent} full={false} /> : null}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] text-white/55">
                <SolanaLogo className="h-3 w-3" />
                {p.caLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-16">
            <SharedSections {...p} />
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutEditorial(p: LayoutProps) {
  return (
    <div className="min-h-full" style={{ backgroundColor: '#f4f0e8', color: '#14110e' }}>
      <div className={`border-b border-black/10 ${p.full ? 'px-6 py-5 sm:px-12' : 'px-3 py-3'}`}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
              {p.displayTicker}
            </p>
            <h1
              className={`mt-1 font-editorial leading-none ${p.full ? 'text-5xl sm:text-7xl' : 'text-3xl'}`}
            >
              {p.displayName}
            </h1>
          </div>
          <span
            className="shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: p.theme.accent }}
          >
            Buy
          </span>
        </div>
      </div>

      <div className={`grid ${p.full ? 'gap-10 px-6 py-10 sm:grid-cols-2 sm:px-12' : 'gap-3 px-3 py-4'}`}>
        <div className={`grid place-items-center bg-black/[0.04] ${p.full ? 'min-h-[320px] rounded-3xl' : 'h-28 rounded-2xl'}`}>
          {p.logoUrl ? (
            <img src={p.logoUrl} alt="" className={`${p.full ? 'h-56 w-56' : 'h-20 w-20'} object-contain`} />
          ) : null}
        </div>
        <div className="flex flex-col justify-center">
          {p.headline ? (
            <p className={`font-editorial italic leading-snug ${p.full ? 'text-2xl' : 'text-sm'}`}>
              {p.headline}
            </p>
          ) : null}
          {p.full && p.paragraphs[0] ? (
            <p className="mt-4 text-sm leading-relaxed text-black/65">{p.paragraphs[0]}</p>
          ) : null}
          <div className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] text-black/50">
            <SolanaLogo className="h-3.5 w-3.5" />
            {p.caLabel}
          </div>
        </div>
      </div>

      {p.full ? (
        <div className="px-6 pb-12 sm:px-12" style={{ backgroundColor: p.theme.bg, color: p.theme.text }}>
          <div className="pt-12">
            <SharedSections
              {...p}
              paragraphs={p.paragraphs.slice(p.headline ? 0 : 1)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LayoutNoir(p: LayoutProps) {
  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505]" style={{ color: p.theme.text }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 0%, ${p.theme.accent}55, transparent 55%), linear-gradient(180deg, #050505 0%, #0a0a0a 100%)`,
        }}
      />
      <div className={`relative ${p.full ? 'px-5 py-10 sm:px-12' : 'px-3 py-4'}`}>
        <div className="flex items-center justify-between">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
            Live
          </span>
          <BuyPill label={p.displayTicker} theme={p.theme} />
        </div>
        <div className={`${p.full ? 'mt-16 grid items-end gap-8 sm:grid-cols-[1.1fr_0.9fr]' : 'mt-6'}`}>
          <div>
            <h1
              className={`font-display font-extrabold uppercase leading-[0.9] tracking-tight ${
                p.full ? 'text-6xl sm:text-8xl' : 'text-4xl'
              }`}
            >
              <span className="block text-white/90">{p.displayName.split(' ')[0]}</span>
              <span className="block" style={{ color: p.theme.accent }}>
                {p.displayName.split(' ').slice(1).join(' ') || p.displayTicker}
              </span>
            </h1>
            {p.headline ? (
              <p className={`mt-5 max-w-md text-white/55 ${p.full ? 'text-base' : 'text-xs'}`}>
                {p.headline}
              </p>
            ) : null}
          </div>
          {p.logoUrl ? (
            <div className={`justify-self-end ${p.full ? 'h-56 w-56' : 'mt-4 h-24 w-24'}`}>
              <img
                src={p.logoUrl}
                alt=""
                className="h-full w-full object-contain opacity-95"
                style={{ filter: `drop-shadow(0 0 40px ${p.theme.accent}66)` }}
              />
            </div>
          ) : null}
        </div>
        {!p.full && p.includes.chart ? (
          <div className="mt-4">
            <MiniChart accent={p.theme.accent} full={false} />
          </div>
        ) : null}
        {p.full ? (
          <div className="mt-20">
            <SharedSections {...p} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LayoutBrutal(p: LayoutProps) {
  return (
    <div className="min-h-full" style={{ backgroundColor: p.theme.bg, color: p.theme.text }}>
      <div
        className={`border-b-4 ${p.full ? 'px-4 py-6 sm:px-8' : 'px-3 py-3'}`}
        style={{ borderColor: p.theme.accent }}
      >
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: p.theme.accent }}>
          {p.displayTicker} · CTO
        </p>
        <h1
          className={`mt-2 font-display font-black uppercase leading-[0.85] ${
            p.full ? 'text-6xl sm:text-[6.5rem]' : 'text-4xl'
          }`}
        >
          {p.displayName}
        </h1>
      </div>
      <div className={`grid ${p.full ? 'sm:grid-cols-[1fr_1.1fr]' : ''}`}>
        <div
          className={`grid place-items-center border-b-4 sm:border-b-0 sm:border-r-4 ${
            p.full ? 'min-h-[280px] p-8' : 'h-28 p-3'
          }`}
          style={{ borderColor: p.theme.accent, background: `${p.theme.accent}14` }}
        >
          {p.logoUrl ? (
            <img src={p.logoUrl} alt="" className={`${p.full ? 'h-48 w-48' : 'h-20 w-20'} object-contain`} />
          ) : null}
        </div>
        <div className={p.full ? 'p-8' : 'p-3'}>
          {p.headline ? (
            <p className={`font-display font-bold uppercase leading-tight ${p.full ? 'text-2xl' : 'text-sm'}`}>
              {p.headline}
            </p>
          ) : (
            <p className={`font-display font-bold uppercase ${p.full ? 'text-2xl' : 'text-sm'}`}>
              New mint. Same fight.
            </p>
          )}
          {p.full && p.paragraphs[0] ? (
            <p className="mt-4 text-sm leading-relaxed text-white/60">{p.paragraphs[0]}</p>
          ) : null}
          <div className="mt-6">
            <BuyPill label={`Buy ${p.displayTicker} now`} theme={p.theme} large={p.full} />
          </div>
        </div>
      </div>
      {p.full ? (
        <div className="border-t-4 px-4 py-12 sm:px-8" style={{ borderColor: p.theme.accent }}>
          <SharedSections {...p} paragraphs={p.paragraphs.slice(1)} />
        </div>
      ) : null}
    </div>
  );
}

function LayoutGallery(p: LayoutProps) {
  return (
    <div className="min-h-full bg-[#0b0b0c]" style={{ color: '#f7f5f1' }}>
      <div className={`text-center ${p.full ? 'px-6 pb-4 pt-12 sm:pt-16' : 'px-3 pb-2 pt-5'}`}>
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/35">
          Presented by CTOgo
        </p>
        <h1
          className={`mt-4 font-editorial leading-none ${p.full ? 'text-5xl sm:text-7xl' : 'text-3xl'}`}
        >
          {p.displayName}
        </h1>
        {p.headline ? (
          <p className={`mx-auto mt-4 max-w-md text-white/50 ${p.full ? 'text-base' : 'text-xs'}`}>
            {p.headline}
          </p>
        ) : null}
      </div>
      <div className={`mx-auto ${p.full ? 'max-w-xl px-6' : 'px-3'}`}>
        <div
          className={`relative overflow-hidden rounded-[2rem] ${p.full ? 'aspect-square' : 'h-36'}`}
          style={{
            background: `radial-gradient(circle at 50% 40%, ${p.theme.accent}33, #111 70%)`,
            boxShadow: `0 30px 80px ${p.theme.accent}22`,
          }}
        >
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className="absolute inset-[12%] h-[76%] w-[76%] object-contain"
            />
          ) : null}
        </div>
      </div>
      <div className={`flex justify-center ${p.full ? 'mt-8' : 'mt-3'}`}>
        <BuyPill label={`Collect ${p.displayTicker}`} theme={p.theme} large={p.full} />
      </div>
      {p.full ? (
        <div className="mt-16 px-6 sm:px-10">
          <SharedSections {...p} />
        </div>
      ) : (
        <p className="mt-3 pb-3 text-center font-mono text-[10px] text-white/35">{p.caLabel}</p>
      )}
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
  const layoutId = resolveOnePagerLayout(props.layoutPreference, props.layoutSeed ?? 0);
  const Layout = LAYOUTS[layoutId];
  return (
    <Layout
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
  const title = props.kind === 'clone' ? 'Cloned site preview' : '1-pager preview';
  const layoutId = resolveOnePagerLayout(props.layoutPreference, props.layoutSeed ?? 0);

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
            {title}
          </p>
          <p className="truncate text-[10px] capitalize text-white/30">
            {props.kind === 'onepager' ? layoutId : labels.hostLabel}
          </p>
        </div>
      ) : null}

      {props.kind === 'clone' ? (
        <CloneBody
          variant={variant}
          displayName={labels.displayName}
          displayTicker={labels.displayTicker}
          logoUrl={props.logoUrl}
          bannerUrl={props.bannerUrl}
          cloneUrl={props.cloneUrl}
        />
      ) : (
        <PremiumOnePager
          variant={variant}
          themeId={props.themeId}
          layoutPreference={props.layoutPreference}
          layoutSeed={props.layoutSeed}
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
      )}
    </div>
  );
}

type WebsitePreviewOverlayProps = WebsitePreviewProps & {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export function WebsitePreviewOverlay({
  open,
  onClose,
  onContinue,
  ...preview
}: WebsitePreviewOverlayProps) {
  if (!open) return null;

  const slug = preview.ticker.trim().toLowerCase() || 'ticker';
  const hostLabel =
    preview.kind === 'clone' && preview.cloneUrl?.trim()
      ? preview.cloneUrl.replace(/^https?:\/\//, '').split('/')[0]
      : `${slug}.ctogo.app`;
  const layoutId = resolveOnePagerLayout(preview.layoutPreference, preview.layoutSeed ?? 0);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#05070c]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#090b14] px-3 py-2.5 sm:px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
          {preview.kind === 'clone' ? 'Clone preview' : `${layoutId} preview`}
        </p>
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/35">{hostLabel}</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] text-white/60 hover:bg-white/[0.04] hover:text-white"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          <WebsitePreview {...preview} variant="fullscreen" />
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/[0.08] bg-[#090b14] p-3 sm:px-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-white/[0.1] text-xs font-semibold text-white/60 hover:bg-white/[0.04] hover:text-white"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-xl bg-[#c8ff3d] text-sm font-bold text-[#090b14] hover:bg-[#d5ff69]"
        >
          Looks good
        </button>
      </div>
    </div>
  );
}
