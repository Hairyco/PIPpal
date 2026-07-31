/** DexScreener-style 3:1 header on the coin page when a banner exists. */

type Props = {
  ticker: string;
  name: string;
  logo: string;
  colors: string;
  /** Image URL, data URL, or "demo" for a CSS fallback */
  src?: string | null;
};

export function CoinHeaderBanner({ ticker, name, logo, colors, src }: Props) {
  if (!src) return null;

  if (src !== 'demo') {
    return (
      <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#05070d]">
        <div className="aspect-[3/1] w-full">
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1]">
      <div
        className={`relative aspect-[3/1] w-full bg-gradient-to-br ${colors} from-40%`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/85 via-[#05070d]/45 to-transparent" />
        <div className="absolute inset-0 flex items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/20 sm:h-16 sm:w-16">
            <img src={logo} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/85">
              CTOgo
            </p>
            <p className="mt-0.5 truncate font-serif text-lg font-bold text-white sm:text-xl">
              {name}
            </p>
            <p className="text-sm font-semibold text-white/70">${ticker}</p>
          </div>
          <p className="ml-auto hidden text-[10px] font-semibold uppercase tracking-wide text-white/35 sm:block">
            3:1 header
          </p>
        </div>
      </div>
    </div>
  );
}
