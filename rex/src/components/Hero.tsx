import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HowItWorksModal } from './HowItWorksModal';

export function Hero() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <div className="container my-16 text-center">
        <span className="block font-serif text-4xl font-bold text-white md:text-7xl">
          Create anything
        </span>
        <h1 className="bg-gradient-to-br from-white to-white/10 bg-clip-text text-4xl font-bold text-transparent md:text-7xl">
          Incubator
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          The safest place to trade. No dev. No rugs. Automated marketing wallets
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowHowItWorks(true)}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-sky-400/40 hover:bg-white/10"
          >
            <HelpCircle className="h-4 w-4 text-sky-400" />
            How it works
          </button>
        </div>
      </div>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </>
  );
}
