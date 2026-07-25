type CoinPagePreviewProps = {
  name: string;
  ticker: string;
  blurb: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  contract?: string;
};

export function CoinPagePreview({
  name,
  ticker,
  blurb,
  logoUrl,
  bannerUrl,
  contract,
}: CoinPagePreviewProps) {
  const displayName = name.trim() || 'Your coin';
  const displayTicker = ticker.trim() ? `$${ticker.trim().toUpperCase()}` : '$TICKER';
  const shortCa = contract?.trim()
    ? `${contract.trim().slice(0, 4)}…${contract.trim().slice(-4)}`
    : 'Mint pending';

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#07090f] shadow-[0_0_0_1px_rgba(200,255,61,0.08)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
          Live page preview
        </p>
        <p className="truncate font-mono text-[10px] text-white/30">
          ctogo.app/coin/{ticker.trim() || 'ticker'}
        </p>
      </div>

      <div className="relative h-28 w-full bg-[#0c0f18] sm:h-32">
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-white/25">
            Banner appears here
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-transparent to-transparent" />
      </div>

      <div className="relative -mt-8 px-3 pb-4">
        <div className="flex items-end gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-[#07090f] bg-white/[0.06]">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white/30">Logo</span>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="truncate font-serif text-lg font-bold leading-tight text-white">
              {displayName}
            </p>
            <p className="text-xs font-semibold text-[#c8ff3d]">{displayTicker}</p>
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-white/55">
          {blurb.trim() || 'Community takeover page hosted by CTOgo.'}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-[#c8ff3d] px-2.5 py-1.5 text-[10px] font-bold text-[#090b14]">
            Buy
          </span>
          <span className="rounded-md border border-white/[0.1] px-2.5 py-1.5 text-[10px] font-semibold text-white/60">
            Chart
          </span>
          <span className="rounded-md border border-white/[0.1] px-2.5 py-1.5 font-mono text-[10px] text-white/40">
            {shortCa}
          </span>
        </div>

        <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
            Marketing wallet
          </p>
          <p className="mt-0.5 text-[11px] text-white/50">Trade fees fund growth automatically.</p>
        </div>
      </div>
    </div>
  );
}
