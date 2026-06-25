import type { ReactNode } from 'react';
import { SolanaLogo } from './SolanaLogo';

const logoClass =
  'h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12';

function PartnerMark({
  name,
  logo,
}: {
  name: string;
  logo: ReactNode;
}) {
  return (
    <div className="group flex shrink-0 items-center gap-3 opacity-80 transition-all duration-300 hover:opacity-100 sm:gap-3.5">
      {logo}
      <span className="whitespace-nowrap text-xs font-medium tracking-wide text-white/85 transition-colors duration-300 group-hover:text-white sm:text-base">
        {name}
      </span>
    </div>
  );
}

const PARTNERS = [
  {
    name: 'XRP',
    logo: (
      <img
        src="/images/partners/xrp.svg"
        alt=""
        className={`${logoClass} object-contain`}
        loading="lazy"
        decoding="async"
      />
    ),
  },
  {
    name: 'Solana',
    logo: <SolanaLogo className={logoClass} />,
  },
  {
    name: 'Polygon',
    logo: (
      <img
        src="/images/partners/polygon.svg"
        alt=""
        className={`${logoClass} object-contain`}
        loading="lazy"
        decoding="async"
      />
    ),
  },
] as const;

export function PartnerLogos() {
  return (
    <div className="mt-10 flex flex-col items-center gap-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/35">
        Built on leading chains
      </p>
      <div className="flex max-w-full flex-nowrap items-center justify-center gap-6 overflow-x-auto px-1 sm:gap-10 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PARTNERS.map((partner) => (
          <PartnerMark key={partner.name} name={partner.name} logo={partner.logo} />
        ))}
      </div>
    </div>
  );
}
