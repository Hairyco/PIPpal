import { useState } from 'react';
import { howItWorksSteps } from '../data/howItWorks';
import { HowItWorksModal } from './HowItWorksModal';
import { HowItWorksStepCard } from './HowItWorksStepCard';

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

        <div className="grid gap-4 md:grid-cols-3">
          {landingSteps.map((step) => (
            <HowItWorksStepCard key={step.id} step={step} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button type="button" className="dex-btn" onClick={() => setShowModal(true)}>
            See full breakdown
          </button>
        </div>
      </section>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </>
  );
}
