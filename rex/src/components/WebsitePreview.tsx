import { SolanaLogo } from './SolanaLogo';

type WebsiteKind = 'onepager' | 'clone';

type WebsitePreviewProps = {
  kind: WebsiteKind;
  name: string;
  ticker: string;
  blurb: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  contract?: string;
  cloneUrl?: string;
};

function formatCaChip(contract?: string): string {
  const mint = contract?.trim();
  if (!mint) return 'CA pending';
  if (mint.length <= 10) return `CA ${mint}`;
  return `CA ${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export function WebsitePreview({
  kind,
  name,
  ticker,
  blurb,
  logoUrl,
  bannerUrl,
  contract,
  cloneUrl,
}: WebsitePreviewProps) {
  const displayName = name.trim() || 'Your coin';
  const displayTicker = ticker.trim() ? `$${ticker.trim().toUpperCase()}` : '$TICKER';
  const slug = ticker.trim().toLowerCase() || 'ticker';
  const caLabel = formatCaChip(contract);
  const hostLabel =
    kind === 'clone' && cloneUrl?.trim()
      ? cloneUrl.replace(/^https?:\/\//, '').split('/')[0]
      : `${slug}.ctogo.app`;

  if (kind === 'clone') {
    return (
      <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#07090f]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
            Cloned site preview
          </p>
          <p className="truncate font-mono text-[10px] text-white/30">{hostLabel}</p>
        </div>
        <div className="space-y-3 p-3">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] font-semibold text-white/35">Source</p>
            <p className="mt-0.5 truncate text-[12px] text-white/70">
              {cloneUrl?.trim() || 'Paste the old website URL'}
            </p>
          </div>
          <div className="relative h-36 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0c0f18]">
            {bannerUrl ? (
              <img src={bannerUrl} alt="" className="h-full w-full object-cover opacity-80" />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-white/25">
                Clone layout preview
              </div>
            )}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                ) : null}
                <div>
                  <p className="text-sm font-bold text-white">{displayName}</p>
                  <p className="text-[10px] text-[#c8ff3d]">{displayTicker}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-white/45">
            We restyle the old site with the new CA, logo, and CTOgo trade links.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#07090f]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
          1-pager preview
        </p>
        <p className="truncate font-mono text-[10px] text-white/30">{hostLabel}</p>
      </div>

      <div className="relative h-32 w-full bg-[#0c0f18]">
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-white/25">
            Banner
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-transparent to-transparent" />
      </div>

      <div className="relative -mt-10 px-4 pb-4 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border-2 border-[#07090f] bg-white/[0.06]">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-white/30">Logo</span>
          )}
        </div>
        <h2 className="mt-3 font-serif text-xl font-bold text-white">{displayName}</h2>
        <p className="text-sm font-semibold text-[#c8ff3d]">{displayTicker}</p>
        <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-white/55">
          {blurb.trim() || 'New mint. Same community.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-lg bg-[#c8ff3d] px-3 py-2 text-[11px] font-bold text-[#090b14]">
            Buy on CTOgo
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 py-2 font-mono text-[10px] text-white/55"
            title="Solana contract address"
          >
            <SolanaLogo className="h-3.5 w-3.5 shrink-0" />
            <span>{caLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
