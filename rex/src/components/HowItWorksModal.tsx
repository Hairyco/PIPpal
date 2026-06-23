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
        className="my-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <h2 id="how-it-works-title" className="text-xl font-bold text-white">
              How Rex works
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              From $1 launch to automated marketing, verified founders, and vetted product delivery.
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

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="relative space-y-0">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === howItWorksSteps.length - 1;

              return (
                <div key={step.id} className="relative flex gap-4 pb-8">
                  {!isLast && (
                    <div className="absolute left-[19px] top-10 h-[calc(100%-16px)] w-px bg-gradient-to-b from-sky-500/40 to-transparent" />
                  )}

                  <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10">
                    <Icon className="h-4 w-4 text-sky-400" />
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-sky-400">Step {step.step}</span>
                      {step.highlight && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          {step.highlight}
                        </span>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {step.subtitle}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {step.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-center">
            <p className="text-sm font-medium text-white">
              Launch for $1. Market automatically. Claim for $1. Build with vetted studios.
            </p>
            <button type="button" className="dex-btn mt-4" onClick={onClose}>
              Get started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
