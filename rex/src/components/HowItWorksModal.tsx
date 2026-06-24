import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { howItWorksSteps } from '../data/howItWorks';

interface HowItWorksModalProps {
  onClose: () => void;
}

export function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <div
        className="my-4 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <h2 id="how-it-works-title" className="text-xl font-bold text-white">
              How Rex works
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              From $1 launch to automated marketing, verified founders, and vetted delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
          {howItWorksSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl border border-white/[0.06] bg-[#111820] px-5 py-6"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8f542] text-base font-bold text-black"
                aria-hidden
              >
                {step.step}
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
                {step.highlight && (
                  <>
                    {' '}
                    <span className="font-medium text-[#c8f542]">{step.highlight}</span>
                  </>
                )}
              </p>
              <ul className="mt-3 space-y-1.5">
                {step.bullets.slice(0, 3).map((bullet) => (
                  <li key={bullet} className="text-xs leading-relaxed text-foreground/70">
                    · {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-2xl border border-[#c8f542]/20 bg-[#c8f542]/5 p-5 text-center">
            <p className="text-sm font-medium text-white">
              Launch for $1. Market automatically. Claim for $1. Build with vetted studios.
            </p>
            <Link to="/get-started" className="dex-btn mt-4 inline-flex" onClick={onClose}>
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
