import { Link } from 'react-router-dom';
import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HowItWorksModal } from './HowItWorksModal';

export function LaunchCta() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <section className="container my-20 pb-16 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
          Ready to launch?
        </p>
        <p className="mt-3 font-serif text-3xl text-white md:text-4xl">
          Start your project for{' '}
          <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            $1
          </span>
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Bonding-curve launch for $1 — every buy and sell feeds your marketing wallet. Rex handles
          growth and delivery at milestones.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/get-started" className="dex-btn">
            Get Started
          </Link>
          <button
            type="button"
            onClick={() => setShowHowItWorks(true)}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-sky-400/40 hover:bg-white/10"
          >
            <HelpCircle className="h-4 w-4 text-sky-400" />
            Full breakdown
          </button>
        </div>
      </section>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </>
  );
}
