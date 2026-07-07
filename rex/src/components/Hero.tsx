import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import { PartnerLogos } from './PartnerLogos';
import { TypingText } from './TypingText';

export function Hero() {
  return (
    <div className="container my-16 text-center">
      <h1 className="font-serif text-4xl font-bold md:text-7xl">
        <span className="block text-white">Create the future</span>
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
  );
}
