import { useState } from 'react';
import { X, BadgeCheck, Building2, Search, UserPlus, AlertCircle } from 'lucide-react';
import {
  CLAIM_FEE,
  premiumFeatures,
  founderSupplierOptions,
} from '../data/claimPricing';

interface ClaimProjectModalProps {
  projectTitle: string;
  onClose: () => void;
}

export function ClaimProjectModal({ projectTitle, onClose }: ClaimProjectModalProps) {
  const [selectedPerks, setSelectedPerks] = useState<Set<string>>(new Set());

  const perksTotal = premiumFeatures
    .filter((p) => selectedPerks.has(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const totalDue = CLAIM_FEE + perksTotal;

  const togglePerk = (id: string) => {
    setSelectedPerks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-title"
    >
      <div
        className="my-4 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <h2 id="claim-title" className="text-xl font-bold text-white">
              Claim this project
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{projectTitle}</p>
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

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          {/* Claim fee */}
          <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-sky-400" />
                <span className="font-semibold text-white">Official claim</span>
              </div>
              <span className="text-2xl font-bold text-sky-400">${CLAIM_FEE}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Pay ${CLAIM_FEE} to claim ownership. You become the verified founder — able to edit
              the roadmap, tokenomics, and assign a supplier to build the product.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-foreground/80">
              <li>· Verified founder badge on your project page</li>
              <li>· Full control of roadmap and milestones</li>
              <li>· Access to marketing wallet and studio marketplace</li>
            </ul>
          </div>

          {/* Premium perks advisory */}
          <div>
            <div className="mb-2 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs text-muted-foreground">
                Optional investor perks are <strong className="text-amber-200">not included</strong>{' '}
                in the ${CLAIM_FEE} claim fee. Add them now or enable later from your founder
                dashboard — each requires a separate payment.
              </p>
            </div>

            <h3 className="mb-3 text-sm font-semibold text-white">Optional investor perks</h3>
            <div className="space-y-2">
              {premiumFeatures.map((perk) => (
                <label
                  key={perk.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    selectedPerks.has(perk.id)
                      ? 'border-sky-500/40 bg-sky-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPerks.has(perk.id)}
                    onChange={() => togglePerk(perk.id)}
                    className="mt-1 accent-sky-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{perk.name}</span>
                      <span className="shrink-0 text-sm font-semibold text-sky-400">
                        +${perk.price}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{perk.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Founder role — suppliers */}
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
              <Building2 className="h-4 w-4 text-sky-400" />
              Your role as founder
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              After claiming, you are responsible for getting the product built. You have two paths:
            </p>
            <div className="space-y-2">
              {founderSupplierOptions.map((opt, i) => (
                <div
                  key={opt.title}
                  className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                    {i === 0 ? (
                      <Search className="h-4 w-4 text-sky-400" />
                    ) : (
                      <UserPlus className="h-4 w-4 text-sky-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total & CTA */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Claim fee</span>
              <span className="text-foreground">${CLAIM_FEE}</span>
            </div>
            {perksTotal > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Selected perks</span>
                <span className="text-foreground">${perksTotal}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="font-semibold text-white">Total due today</span>
              <span className="text-xl font-bold text-sky-400">${totalDue}</span>
            </div>
            <button type="button" className="dex-btn-green mt-4 w-full justify-center">
              Claim for ${totalDue}
            </button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Perks can be added later from your founder dashboard at the same listed prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
