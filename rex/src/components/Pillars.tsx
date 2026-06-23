import { useState } from 'react';
import { pillarsSummary } from '../data/howItWorks';
import { HowItWorksModal } from './HowItWorksModal';

export function Pillars() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="container my-16 pb-16">
        <h2 className="mb-4 font-serif text-4xl text-white">How Rex Works</h2>
        <p className="mb-8 max-w-xl text-muted-foreground">
          Three automated pillars that turn any idea into a professional project.
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pillarsSummary.map((pillar) => (
            <div key={pillar.id} className="dex-card">
              <div className="relative z-[1]">
                <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                  {pillar.subtitle}
                </p>
                <h3 className="mt-1 text-lg text-foreground">{pillar.title}</h3>
                <p className="mt-2 text-muted-foreground">{pillar.description}</p>
                <button
                  type="button"
                  className="dex-btn mt-4"
                  onClick={() => setShowModal(true)}
                >
                  Learn more
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </>
  );
}
