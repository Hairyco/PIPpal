import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import { BuildCategoryPills } from './BuildCategoryPills';
import { PartnerLogos } from './PartnerLogos';
import { TypingText } from './TypingText';

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <img
          src="/hero-space.png"
          alt=""
          className="h-full w-full object-cover object-[center_75%]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[#030711]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030711] via-[#030711]/55 to-[#030711]/90" />
      </div>

      <div className="container relative z-10 pb-6 pt-20 text-center md:pb-8 md:pt-28">
        <h1 className="font-serif text-4xl font-bold md:text-7xl">
          <span className="block text-white">Create a utility token</span>
          <span className="block">
            <TypingText
              text="in minutes"
              className="bg-gradient-to-br from-white to-white/10 bg-clip-text text-transparent"
            />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          The world&apos;s first programmatic ecosystem where every coin builds and markets itself.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/get-started" className="dex-btn">
            Launch for $1
          </Link>
          <Link
            to="/trade"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-sky-400/40 hover:bg-white/10"
          >
            <ArrowLeftRight className="h-4 w-4 text-sky-400" />
            Trade
          </Link>
        </div>

        <PartnerLogos />
      </div>

      <BuildCategoryPills />
    </section>
  );
}
