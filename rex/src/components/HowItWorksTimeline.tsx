import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { landingTimelineSteps } from '../data/howItWorks';
import { HowItWorksModal } from './HowItWorksModal';
import { VendorProgressIllustration } from './VendorProgressIllustration';

function SearchMarketplaceButton({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/marketplace"
      className={`inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-sky-400/40 hover:bg-white/10 ${className}`}
    >
      <Search className="h-3.5 w-3.5 text-sky-400" />
      Search marketplace
    </Link>
  );
}

export function HowItWorksTimeline() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="container mb-16 mt-6" aria-label="How Rex works">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e17] px-4 py-8 sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"
            aria-hidden
          />
          <div className="text-center">
            <h2 className="font-serif text-4xl text-white">How Rex Works</h2>
            <p className="mt-2 text-lg font-medium text-sky-400 sm:text-xl">
              The safest place to trade
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Programmatic marketing wallets funding every step of your roadmap journey — automatically.
            </p>
          </div>

          <ol className="relative mt-10 hidden md:grid md:grid-cols-5 md:gap-3">
            <div
              className="pointer-events-none absolute left-[10%] right-[10%] top-6 h-0.5 bg-gradient-to-r from-sky-500/50 via-indigo-400/40 to-sky-500/50"
              aria-hidden
            />
            {landingTimelineSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.id} className="relative flex flex-col items-center text-center">
                  <div className="relative z-[1] flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/30 bg-[#030711] ring-4 ring-[#0a0e17]/80">
                    <Icon className="h-5 w-5 text-sky-400" aria-hidden />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rex-gradient text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 max-w-[11rem] text-xs leading-relaxed text-muted-foreground">
                    {step.subtitle}
                  </p>
                  {step.id === 'payout' && <SearchMarketplaceButton className="mt-4" />}
                </li>
              );
            })}
          </ol>

          <ol className="relative mt-8 space-y-0 md:hidden">
            <div
              className="pointer-events-none absolute bottom-4 left-[1.375rem] top-4 w-0.5 bg-gradient-to-b from-sky-500/50 via-indigo-400/30 to-sky-500/20"
              aria-hidden
            />
            {landingTimelineSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === landingTimelineSteps.length - 1;
              return (
                <li key={step.id} className={`relative flex gap-4 ${isLast ? '' : 'pb-8'}`}>
                  <div className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-[#030711]">
                    <Icon className="h-4 w-4 text-sky-400" aria-hidden />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/90">
                      Step {index + 1}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.subtitle}
                    </p>
                    {step.id === 'payout' && <SearchMarketplaceButton className="mt-3" />}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 border-t border-white/10 pt-8">
            <VendorProgressIllustration />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              className="dex-btn group inline-flex items-center gap-2 px-5 py-2.5"
              onClick={() => setShowModal(true)}
            >
              See full breakdown
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </>
  );
}
