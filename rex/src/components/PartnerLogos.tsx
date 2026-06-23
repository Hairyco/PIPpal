function PartnerMark({
  name,
  logoSrc,
  logoClassName = 'h-5 w-5',
}: {
  name: string;
  logoSrc: string;
  logoClassName?: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
      <img
        src={logoSrc}
        alt=""
        className={`${logoClassName} object-contain`}
        loading="lazy"
        decoding="async"
      />
      <span className="whitespace-nowrap font-serif text-xs text-foreground sm:text-sm">
        {name}
      </span>
    </div>
  );
}

export function PartnerLogos() {
  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <div className="inline-flex max-w-full flex-nowrap items-center justify-center gap-4 sm:gap-10">
        <PartnerMark
          name="DEX Screener"
          logoSrc="/images/partners/dexscreener.ico"
          logoClassName="h-5 w-5 sm:h-6 sm:w-6"
        />
        <PartnerMark
          name="DEXTools"
          logoSrc="/images/partners/dextools.svg"
          logoClassName="h-5 w-5 sm:h-6 sm:w-6"
        />
      </div>
      <PartnerMark
        name="Coinzilla"
        logoSrc="/images/partners/coinzilla.svg"
        logoClassName="h-4 w-4 sm:h-5 sm:w-5"
      />
    </div>
  );
}
