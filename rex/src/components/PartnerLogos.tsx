function DexScreenerLogo() {
  return (
    <div className="flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
      <svg width="22" height="22" viewBox="0 0 25 25" fill="currentColor" aria-hidden>
        <path d="M12.5 2C7.5 2 4 6 4 10.5c0 3.2 1.8 5.8 4.5 7.2L7 22l4.5-2.5L16 22l-1.5-4.3c2.7-1.4 4.5-4 4.5-7.2C19 6 15.5 2 12.5 2z" />
      </svg>
      <span className="font-serif text-sm text-foreground">
        DEX&nbsp;Screener
      </span>
    </div>
  );
}

function DexToolsLogo() {
  return (
    <div className="flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
      <svg width="22" height="22" viewBox="0 0 25 25" fill="none" aria-hidden>
        <rect width="25" height="25" rx="5" fill="currentColor" fillOpacity="0.15" />
        <path
          d="M8 18V7h5c2.5 0 4 1.3 4 3.2 0 1.3-.7 2.3-1.9 2.9 1.6.6 2.6 1.8 2.6 3.5 0 2.2-1.7 3.6-4.5 3.6H8zm3-8.5h1.1c1.1 0 1.7-.5 1.7-1.3 0-.8-.6-1.3-1.7-1.3H11v2.6zm0 5.8h1.2c1.2 0 1.9-.5 1.9-1.5 0-1-.7-1.5-1.9-1.5H11v3z"
          fill="currentColor"
        />
      </svg>
      <span className="font-serif text-sm text-foreground">DEXTools</span>
    </div>
  );
}

function CoinzillaLogo() {
  return (
    <div className="flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
      <svg width="22" height="22" viewBox="0 0 25 25" fill="none" aria-hidden>
        <circle cx="12.5" cy="12.5" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12.5 5v15M5 12.5h15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-sm text-foreground">Coinzilla</span>
    </div>
  );
}

export function PartnerLogos() {
  return (
    <section className="container -mt-8 mb-2">
      <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
        <DexScreenerLogo />
        <DexToolsLogo />
        <CoinzillaLogo />
      </div>
    </section>
  );
}
