import { X } from 'lucide-react';
import { SolanaLogo } from './SolanaLogo';

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
  /** Compact wizard card vs full-viewport site mock. */
  variant?: 'card' | 'fullscreen';
};

function formatCaChip(contract?: string): string {
  const mint = contract?.trim();
  if (!mint) return 'CA pending';
  if (mint.length <= 10) return `CA ${mint}`;
  return `CA ${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

function usePreviewLabels(props: WebsitePreviewProps) {
  const displayName = props.name.trim() || 'Your coin';
  const displayTicker = props.ticker.trim()
    ? `$${props.ticker.trim().toUpperCase()}`
    : '$TICKER';
  const slug = props.ticker.trim().toLowerCase() || 'ticker';
  const caLabel = formatCaChip(props.contract);
  const hostLabel =
    props.kind === 'clone' && props.cloneUrl?.trim()
      ? props.cloneUrl.replace(/^https?:\/\//, '').split('/')[0]
      : `${slug}.ctogo.app`;
  const blurbText = props.blurb.trim() || 'New mint. Same community.';
  return { displayName, displayTicker, slug, caLabel, hostLabel, blurbText };
}

function OnePagerBody({
  variant,
  displayName,
  displayTicker,
  blurbText,
  caLabel,
  logoUrl,
  bannerUrl,
}: {
  variant: 'card' | 'fullscreen';
  displayName: string;
  displayTicker: string;
  blurbText: string;
  caLabel: string;
  logoUrl: string | null;
  bannerUrl: string | null;
}) {
  const full = variant === 'fullscreen';
  return (
    <>
      <div className={`relative w-full bg-[#0c0f18] ${full ? 'h-[42vh] min-h-[220px] sm:h-[48vh]' : 'h-32'}`}>
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-white/25">
            Banner
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/20 to-transparent" />
      </div>

      <div className={`relative text-center ${full ? '-mt-16 px-6 pb-16 sm:-mt-20' : '-mt-10 px-4 pb-4'}`}>
        <div
          className={`mx-auto grid place-items-center overflow-hidden rounded-2xl border-2 border-[#07090f] bg-white/[0.06] ${
            full ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-16 w-16'
          }`}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-white/30">Logo</span>
          )}
        </div>
        <h2
          className={`mt-3 font-serif font-bold text-white ${
            full ? 'text-3xl sm:text-4xl' : 'text-xl'
          }`}
        >
          {displayName}
        </h2>
        <p className={`font-semibold text-[#c8ff3d] ${full ? 'mt-1 text-lg' : 'text-sm'}`}>
          {displayTicker}
        </p>
        <p
          className={`mx-auto mt-2 max-w-md leading-relaxed text-white/55 ${
            full ? 'text-sm sm:text-base' : 'text-[12px]'
          }`}
        >
          {blurbText}
        </p>
        <div className={`mt-4 flex flex-wrap items-center justify-center gap-2 ${full ? 'mt-6 gap-3' : ''}`}>
          <span
            className={`rounded-lg bg-[#c8ff3d] font-bold text-[#090b14] ${
              full ? 'px-5 py-3 text-sm' : 'px-3 py-2 text-[11px]'
            }`}
          >
            Buy on CTOgo
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] font-mono text-white/55 ${
              full ? 'px-3 py-3 text-xs' : 'px-2.5 py-2 text-[10px]'
            }`}
            title="Solana contract address"
          >
            <SolanaLogo className={full ? 'h-4 w-4 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
            <span>{caLabel}</span>
          </span>
        </div>
        {full ? (
          <p className="mt-10 text-[12px] tracking-wide text-white/30">
            Telegram · X · Chart
          </p>
        ) : null}
      </div>
    </>
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
    <div className={full ? 'space-y-4 p-4 sm:p-6' : 'space-y-3 p-3'}>
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
  const { displayName, displayTicker, caLabel, hostLabel, blurbText } = usePreviewLabels(props);
  const title = props.kind === 'clone' ? 'Cloned site preview' : '1-pager preview';

  return (
    <div
      className={`overflow-hidden bg-[#07090f] ${
        variant === 'fullscreen' ? 'min-h-full' : 'rounded-xl border border-white/[0.1]'
      }`}
    >
      {variant === 'card' ? (
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
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
        <OnePagerBody
          variant={variant}
          displayName={displayName}
          displayTicker={displayTicker}
          blurbText={blurbText}
          caLabel={caLabel}
          logoUrl={props.logoUrl}
          bannerUrl={props.bannerUrl}
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

/** Full-page site preview so founders can see how the public page will look. */
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
