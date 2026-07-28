import { X } from 'lucide-react';
import { SolanaLogo } from './SolanaLogo';
import { ONE_PAGER_LAYOUT_COMPONENTS } from './onePagerLayouts';
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
  type OnePagerThemeId,
} from '../data/onePagerTheme';

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
  const layoutId = resolveOnePagerLayout(
    props.layoutId ?? props.layoutPreference,
    props.layoutSeed ?? 0,
  );
  const Layout = ONE_PAGER_LAYOUT_COMPONENTS[layoutId] ?? ONE_PAGER_LAYOUT_COMPONENTS.pulse;
  return (
    <Layout
      key={`${layoutId}-${props.designNonce ?? 0}-${props.themeId ?? 'theme'}-${props.headline}-${props.logoUrl?.slice(-24) ?? 'nologo'}`}
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
  const layoutId = resolveOnePagerLayout(
    props.layoutId ?? props.layoutPreference,
    props.layoutSeed ?? 0,
  );
  const pager = (
    <PremiumOnePager
      key={`pager-${layoutId}-${props.designNonce ?? 0}-${props.themeId ?? 't'}-${labels.headline}-${labels.body.slice(0, 48)}-${JSON.stringify(props.includes ?? {})}`}
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
  const layoutId = resolveOnePagerLayout(
    preview.layoutId ?? preview.layoutPreference,
    preview.layoutSeed ?? 0,
  );
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

      <div className="min-h-0 flex-1 overflow-y-auto" key={`scroll-${preview.designNonce ?? 0}-${layoutId}-${preview.themeId ?? 't'}-${preview.headline ?? ''}`}>
        <WebsitePreview {...preview} layoutId={layoutId} variant="fullscreen" />
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/[0.08] bg-[#0b0e16] p-3 sm:px-4">
        <p className="text-center text-[10px] text-white/40">
          <span className="font-semibold text-white/70">{layoutName}</span>
          {onRegenerate ? ' · tap Try another look for a new design' : ' · edit copy or confirm'}
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
