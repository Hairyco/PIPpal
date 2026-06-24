import { useState } from 'react';
import { howItWorksSteps } from '../data/howItWorks';
import { HowItWorksModal } from './HowItWorksModal';

const landingSteps = howItWorksSteps.filter((s) =>
  ['launch', 'marketing', 'claim'].includes(s.id),
);

export function Pillars() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="container my-16 pb-16">
        <h2 className="mb-4 font-serif text-4xl text-white">How Rex Works</h2>
        <p className="mb-8 max-w-xl text-muted-foreground">
          Three steps from idea to a live project with automated marketing.
        </p>

        <div className="mx-auto max-w-xl space-y-3">
          {landingSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl border border-white/[0.06] bg-[#111820] px-6 py-7"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c8f542] text-lg font-bold text-black"
                aria-hidden
              >
                {step.step}
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
                {step.highlight && (
                  <>
                    {' '}
                    <span className="font-medium text-[#c8f542]">{step.highlight}</span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-xl text-center">
          <button type="button" className="dex-btn" onClick={() => setShowModal(true)}>
            See full breakdown
          </button>
        </div>
      </section>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </>
  );
}
