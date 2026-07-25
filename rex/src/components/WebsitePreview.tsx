import { X } from 'lucide-react';
import { SolanaLogo } from './SolanaLogo';
import {
  applyPunchyBlurb,
  DEFAULT_DESIGN_TWEAKS,
  DEFAULT_ONE_PAGER_THEME_ID,
  getOnePagerTheme,
  type OnePagerDesignTweaks,
  type OnePagerThemeId,
} from '../data/onePagerTheme';

export type WebsiteKind = 'onepager' | 'clone';

type WebsitePreviewProps = {
  kind: WebsiteKind;
  name: string;
  ticker: string;
  blurb: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  contract?: string;
  cloneUrl?: string;
  variant?: 'card' | 'fullscreen';
  themeId?: OnePagerThemeId;
  designTweaks?: OnePagerDesignTweaks;
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
  return { displayName, displayTicker, rawTicker, slug, caLabel, hostLabel };
}

/** Meme-coin 1-pager — SHIBCAT-style fixed layout, theme colors only. */
function MemeOnePagerBody({
  variant,
  displayName,
  displayTicker,
  rawTicker,
  blurb,
  caLabel,
  logoUrl,
  themeId,
  designTweaks = DEFAULT_DESIGN_TWEAKS,
}: {
  variant: 'card' | 'fullscreen';
  displayName: string;
  displayTicker: string;
  rawTicker: string;
  blurb: string;
  caLabel: string;
  logoUrl: string | null;
  themeId?: OnePagerThemeId;
  designTweaks?: OnePagerDesignTweaks;
}) {
  const full = variant === 'fullscreen';
  const theme = getOnePagerTheme(themeId ?? DEFAULT_ONE_PAGER_THEME_ID);
  const blurbText = designTweaks.punchyBlurb
    ? applyPunchyBlurb(blurb, rawTicker)
    : blurb.trim() || 'New mint. Same community.';
  const heroLine = blurbText.toUpperCase();
  const titleSize = designTweaks.loudTitle
    ? full
      ? 'text-5xl sm:text-7xl'
      : 'text-3xl'
    : full
      ? 'text-4xl sm:text-5xl'
      : 'text-2xl';
  const mascotSize = designTweaks.bigMascot
    ? full
      ? 'h-52 w-52 sm:h-64 sm:w-64'
      : 'h-28 w-28'
    : full
      ? 'h-40 w-40 sm:h-48 sm:w-48'
      : 'h-20 w-20';

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text }} className="min-h-full">
      {/* Nav */}
      <div
        className={`flex items-center justify-between gap-3 border-b border-white/10 ${
          full ? 'px-4 py-3 sm:px-6' : 'px-3 py-2'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`shrink-0 overflow-hidden rounded-full border-2 ${
              full ? 'h-9 w-9' : 'h-7 w-7'
            }`}
            style={{ borderColor: theme.accent }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-[8px] font-bold opacity-40">
                GO
              </div>
            )}
          </div>
          <span
            className={`truncate font-black uppercase tracking-tight ${
              full ? 'text-base sm:text-lg' : 'text-xs'
            }`}
            style={{ color: theme.accent }}
          >
            {displayName}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full font-black uppercase ${
            full ? 'px-4 py-2 text-xs sm:text-sm' : 'px-2.5 py-1.5 text-[10px]'
          }`}
          style={{
            background: `linear-gradient(180deg, ${theme.accentSoft}, ${theme.accent})`,
            color: theme.buyText,
          }}
        >
          Buy {displayTicker}
        </span>
      </div>

      {/* Hero */}
      <div className={`text-center ${full ? 'px-4 pb-8 pt-8 sm:pt-10' : 'px-3 pb-4 pt-4'}`}>
        <p
          className={`mx-auto max-w-lg font-black uppercase leading-tight tracking-wide ${
            full ? 'text-sm sm:text-base' : 'text-[10px]'
          }`}
          style={{ color: theme.muted }}
        >
          {heroLine}
        </p>
        <h1
          className={`mt-3 font-black uppercase leading-none tracking-tight ${titleSize}`}
          style={{ color: theme.accent }}
        >
          {displayName}
        </h1>

        <div className={`mx-auto mt-5 grid place-items-center ${mascotSize}`}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center rounded-full text-2xl font-black"
              style={{ backgroundColor: theme.accent, color: theme.buyText }}
            >
              {rawTicker.slice(0, 2)}
            </div>
          )}
        </div>
      </div>

      {/* Accent bar */}
      <div className={full ? 'h-3' : 'h-2'} style={{ backgroundColor: theme.accent }} />

      {full ? (
        <div className="space-y-10 px-4 py-10 sm:px-8">
          <section className="text-center">
            <h2
              className="text-2xl font-black uppercase tracking-tight sm:text-3xl"
              style={{ color: theme.accent }}
            >
              What you should know
            </h2>
            <p
              className="mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:text-base"
              style={{ color: theme.muted }}
            >
              {blurbText} Community-driven meme energy — no gimmicks, just the coin that refuses to
              be ignored.
            </p>
          </section>

          <section className="text-center">
            <h2
              className="text-xl font-black uppercase tracking-tight"
              style={{ color: theme.accent }}
            >
              {rawTicker} CA
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 font-mono text-xs text-white/80">
              <SolanaLogo className="h-4 w-4 shrink-0" />
              <span>{caLabel}</span>
            </div>
            <div className="mt-4">
              <span
                className="inline-block rounded-full px-5 py-3 text-sm font-black uppercase"
                style={{
                  background: `linear-gradient(180deg, ${theme.accentSoft}, ${theme.accent})`,
                  color: theme.buyText,
                }}
              >
                Buy on CTOgo
              </span>
            </div>
          </section>

          {designTweaks.showTokenomics ? (
            <section className="text-center">
              <h2
                className="text-xl font-black uppercase tracking-tight"
                style={{ color: theme.accent }}
              >
                Tokenomics
              </h2>
              <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-3">
                {[
                  { value: '1B', label: 'Supply' },
                  { value: 'Tax on', label: 'Fees' },
                  { value: 'Burnt', label: 'LP' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 px-2 py-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <p className="text-lg font-black" style={{ color: theme.accent }}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <p className="pb-6 text-center text-[11px] tracking-wide text-white/35">
            Telegram · X · Chart · Copyright © {new Date().getFullYear()}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-3">
          <span
            className="rounded-full px-3 py-1.5 text-[10px] font-black uppercase"
            style={{
              background: `linear-gradient(180deg, ${theme.accentSoft}, ${theme.accent})`,
              color: theme.buyText,
            }}
          >
            Buy on CTOgo
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1.5 font-mono text-[10px] text-white/55">
            <SolanaLogo className="h-3 w-3" />
            {caLabel}
          </span>
        </div>
      )}
    </div>
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
          {full ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-xs font-bold text-[#090b14]">
                Buy on CTOgo
              </span>
              <span className="rounded-lg border border-white/20 px-3 py-2.5 text-xs text-white/70">
                Restyled with new CA
              </span>
            </div>
          ) : null}
        </div>
      </div>
      {!full ? (
        <p className="text-[11px] leading-relaxed text-white/45">
          We restyle the old site with the new CA, logo, and CTOgo trade links.
        </p>
      ) : null}
    </div>
  );
}

export function WebsitePreview(props: WebsitePreviewProps) {
  const variant = props.variant ?? 'card';
  const { displayName, displayTicker, rawTicker, caLabel, hostLabel } = usePreviewLabels(props);
  const title = props.kind === 'clone' ? 'Cloned site preview' : '1-pager preview';

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
          <p className="truncate font-mono text-[10px] text-white/30">{hostLabel}</p>
        </div>
      ) : null}

      {props.kind === 'clone' ? (
        <CloneBody
          variant={variant}
          displayName={displayName}
          displayTicker={displayTicker}
          logoUrl={props.logoUrl}
          bannerUrl={props.bannerUrl}
          cloneUrl={props.cloneUrl}
        />
      ) : (
        <MemeOnePagerBody
          variant={variant}
          displayName={displayName}
          displayTicker={displayTicker}
          rawTicker={rawTicker}
          blurb={props.blurb}
          caLabel={caLabel}
          logoUrl={props.logoUrl}
          themeId={props.themeId}
          designTweaks={props.designTweaks}
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

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#05070c]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#090b14] px-3 py-2.5 sm:px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
          {preview.kind === 'clone' ? 'Clone preview' : '1-pager preview'}
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
