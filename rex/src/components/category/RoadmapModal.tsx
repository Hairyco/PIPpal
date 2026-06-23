import { X, BadgeCheck, Lock, Sparkles, Building2, PieChart, Gift, Wallet } from 'lucide-react';
import type { ActiveProject } from '../../data/categoryContent';
import type { ProjectDetails } from '../../data/projectDetails';
import { CLAIM_FEE, premiumFeatures } from '../../data/claimPricing';

interface RoadmapModalProps {
  project: ActiveProject;
  details: ProjectDetails;
  onClose: () => void;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-emerald-400',
    in_progress: 'bg-sky-400',
    active: 'bg-sky-400',
    upcoming: 'bg-white/20',
  };
  return <span className={`h-2 w-2 shrink-0 rounded-full ${colors[status] ?? 'bg-white/20'}`} />;
}

export function RoadmapModal({ project, details, onClose }: RoadmapModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-title"
    >
      <div
        className="my-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="roadmap-title" className="text-xl font-bold text-white">
                {project.name}
              </h2>
              {details.claimed && (
                <span className="flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-400">
                  <BadgeCheck className="h-3 w-3" />
                  Founder claimed
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{project.symbol} · {details.tagline}</p>
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
          {/* Milestones */}
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-sky-400">
              Milestones
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {details.milestones.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border p-3 ${
                    m.status === 'completed'
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : m.status === 'active'
                        ? 'border-sky-500/30 bg-sky-500/5'
                        : 'border-white/5 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusDot status={m.status} />
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Target: {m.target}</p>
                  <p className="mt-0.5 text-xs text-sky-400/80">Unlocks: {m.unlocks}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Marketing wallet */}
          <section className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Wallet className="h-4 w-4" />
              Marketing wallet
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-semibold text-emerald-400">{details.marketingWallet.balance}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ad threshold</p>
                <p className="font-medium text-foreground">{details.marketingWallet.threshold}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next spend</p>
                <p className="font-medium text-foreground">{details.marketingWallet.nextAdSpend}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trade tax</p>
                <p className="font-medium text-foreground">{details.marketingWallet.taxRate}</p>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sky-400">
              <Sparkles className="h-4 w-4" />
              Roadmap
            </h3>
            <div className="space-y-3">
              {details.roadmap.map((phase) => (
                <div
                  key={phase.phase}
                  className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <StatusDot status={phase.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{phase.phase}</span>
                      <span className="text-xs text-white/40">· {phase.timeline}</span>
                    </div>
                    <p className="font-medium text-foreground">{phase.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tokenomics */}
          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sky-400">
              <PieChart className="h-4 w-4" />
              Tokenomics
            </h3>
            <div className="space-y-2">
              {details.tokenomics.map((slice) => (
                <div key={slice.label} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm text-muted-foreground">{slice.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-500/70"
                      style={{ width: `${slice.percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-medium text-foreground">
                    {slice.percent}%
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Marketing wallet receives {details.tokenomics[0].percent}% of every trade via buy/sell tax.
              Funds auto-deploy to DexScreener or Coinzilla at {details.marketingWallet.threshold}.
            </p>
          </section>

          {/* Supplier */}
          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sky-400">
              <Building2 className="h-4 w-4" />
              Delivery supplier
            </h3>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{details.supplier.name}</p>
                  <p className="text-sm text-muted-foreground">{details.supplier.specialty}</p>
                </div>
                <div className="text-right">
                  {details.supplier.vetted && (
                    <span className="text-xs text-emerald-400">Rex vetted</span>
                  )}
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {details.supplier.status === 'assigned'
                      ? 'Assigned'
                      : details.supplier.status === 'pending'
                        ? 'Pending assignment'
                        : 'Open — claim to assign'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Investor perks */}
          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sky-400">
              <Gift className="h-4 w-4" />
              Investor perks
            </h3>
            <div className="space-y-2">
              {details.investorPerks.map((perk) => (
                <div
                  key={perk.title}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{perk.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{perk.description}</p>
                  </div>
                  {perk.premium && (
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-400">
                      Premium
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Premium perks are optional paid add-ons (from $
              {Math.min(...premiumFeatures.map((p) => p.price))} each) — not included in the $
              {CLAIM_FEE} claim fee.
            </p>
          </section>

          {/* KYC callout */}
          {!details.claimed && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-200">Unclaimed project</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Claim for ${CLAIM_FEE} to become the verified founder. Investor perks like profit
                  share require separate paid add-ons. As founder, browse our active supplier list or
                  bring your own team — they must be onboarded and vetted by Rex before receiving
                  roadmap funds.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
