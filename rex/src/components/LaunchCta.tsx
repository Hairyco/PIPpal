import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HowItWorksModal } from './HowItWorksModal';

export function LaunchCta() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <section className="container my-16 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
          The safest place to trade.
        </p>
        <p className="mt-3 font-serif text-3xl text-white md:text-4xl">
          Launch your project for just{' '}
          <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            $1
          </span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="dex-btn">
            Get Started
          </button>
          <button
            type="button"
            onClick={() => setShowHowItWorks(true)}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-sky-400/40 hover:bg-white/10"
          >
            <HelpCircle className="h-4 w-4 text-sky-400" />
            How it works
          </button>
        </div>
      </section>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </>
  );
}
