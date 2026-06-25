import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { howItWorksSteps } from '../data/howItWorks';
import { HowItWorksStepCard } from './HowItWorksStepCard';
import { MarketingSpendFlowChart } from './MarketingSpendFlowChart';
import { VendorProgressIllustration } from './VendorProgressIllustration';

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
        className="my-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
              How it works
            </p>
            <h2 id="how-it-works-title" className="mt-1 font-serif text-2xl text-white">
              How Rex works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
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

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <MarketingSpendFlowChart />
          <VendorProgressIllustration />

          <div className="grid gap-4 sm:grid-cols-2">
            {howItWorksSteps.map((step) => (
              <HowItWorksStepCard key={step.id} step={step} showBullets maxBullets={3} />
            ))}
          </div>

          <div className="dex-card text-center">
            <div className="relative z-[1]">
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
    </div>
  );
}
