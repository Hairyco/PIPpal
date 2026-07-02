import { useMemo, useState } from 'react';
import {
  Calendar,
  ChevronRight,
  Lock,
  Megaphone,
  Package,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { formatAdCost, getAdPlatform, getAdPlatformOption } from '../../../data/adPlatforms';
import type { MarketingTimelinePhase } from '../../../utils/buildMarketingRoadmap';
import { TIMING_OFFSET_PRESETS } from '../../../utils/buildMarketingRoadmap';
import { ApprovalStatusBadge, PlatformCategoryBadge, PlatformLogo } from './PlatformLogo';

interface MarketingTimelineViewProps {
  phases: MarketingTimelinePhase[];
  kycCompleted: boolean;
  pmApprovedPhases: string[];
  onSelectPlatform: (platformId: string, phaseId: string) => void;
  onTimingChange?: (phaseId: string, offsetDays: number) => void;
  onSubmitPmApproval?: (phaseId: string) => void;
}

const phaseAccent: Record<
  MarketingTimelinePhase['phaseType'],
  { icon: typeof Rocket; ring: string; bg: string; text: string }
> = {
  launch: {
    icon: Rocket,
    ring: 'ring-emerald-500/25',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
  },
  community: {
    icon: Users,
    ring: 'ring-sky-500/25',
    bg: 'bg-sky-500/10',
    text: 'text-sky-300',
  },
  charting: {
    icon: TrendingUp,
    ring: 'ring-indigo-500/25',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-300',
  },
  growth: {
    icon: Megaphone,
    ring: 'ring-violet-500/25',
    bg: 'bg-violet-500/10',
    text: 'text-violet-300',
  },
  scale: {
    icon: Zap,
    ring: 'ring-amber-500/25',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
  },
  build: {
    icon: Wrench,
    ring: 'ring-white/15',
    bg: 'bg-white/[0.06]',
    text: 'text-muted-foreground',
  },
  product: {
    icon: Package,
    ring: 'ring-pink-500/25',
    bg: 'bg-pink-500/10',
    text: 'text-pink-300',
  },
  approval: {
    icon: ShieldCheck,
    ring: 'ring-amber-500/25',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
  },
};

function phaseLabel(phase: MarketingTimelinePhase): string {
  if (phase.phaseType === 'launch') return 'Launch';
  if (phase.phaseType === 'community') return 'Community';
  if (phase.phaseType === 'charting') return 'Charting';
  if (phase.phaseType === 'growth') return 'Growth';
  if (phase.phaseType === 'scale') return 'Scale';
  if (phase.phaseType === 'build') return 'Build';
  if (phase.phaseType === 'product') return 'Product';
  return 'Review';
}

export function MarketingTimelineView({
  phases,
  kycCompleted,
  pmApprovedPhases,
  onSelectPlatform,
  onTimingChange,
  onSubmitPmApproval,
}: MarketingTimelineViewProps) {
  const firstWithPlatforms = phases.find((p) => p.platforms.length > 0)?.id ?? phases[0]?.id;
  const [activePhaseId, setActivePhaseId] = useState(firstWithPlatforms);

  const activePhase = phases.find((p) => p.id === activePhaseId) ?? phases[0];
  const accent = activePhase ? phaseAccent[activePhase.phaseType] : phaseAccent.community;
  const PhaseIcon = accent.icon;

  const summary = useMemo(() => {
    const withVendors = phases.filter((p) => p.platforms.length > 0);
    const minSpend = withVendors.reduce((sum, phase) => {
      const phaseMin = phase.platforms.reduce((min, entry) => {
        const option = getAdPlatformOption(entry.platformId, entry.optionId);
        return option ? Math.min(min, option.costFrom) : min;
      }, Infinity);
      return sum + (Number.isFinite(phaseMin) ? phaseMin : 0);
    }, 0);

    return {
      phaseCount: phases.length,
      vendorCount: withVendors.reduce((n, p) => n + p.platforms.length, 0),
      minSpend,
    };
  }, [phases]);

  if (!activePhase) return null;

  const pmApproved = pmApprovedPhases.includes(activePhase.id);
  const effectiveStatus =
    pmApproved && activePhase.approvalStatus === 'pending-pm'
      ? 'approved'
      : activePhase.approvalStatus;

  return (
    <div className="min-w-0 space-y-5">
      {/* Summary strip */}
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { label: 'Campaign phases', value: String(summary.phaseCount) },
          { label: 'Vendor placements', value: String(summary.vendorCount) },
          {
            label: 'Est. from',
            value: summary.minSpend > 0 ? formatAdCost(summary.minSpend) : '—',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-0.5 text-lg font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Phase selector */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex min-w-max gap-2 pb-1 sm:min-w-0 sm:flex-wrap">
          {phases.map((phase) => {
            const isActive = phase.id === activePhaseId;
            const meta = phaseAccent[phase.phaseType];
            const Icon = meta.icon;

            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setActivePhaseId(phase.id)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? 'border-sky-500/40 bg-sky-500/10 shadow-[0_0_0_1px_rgba(14,165,233,0.15)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.text}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Step {phase.step} · {phaseLabel(phase)}
                  </span>
                  <span
                    className={`block max-w-[140px] truncate text-xs font-semibold sm:max-w-[180px] ${
                      isActive ? 'text-white' : 'text-white/85'
                    }`}
                  >
                    {phase.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Journey progress */}
      <div className="hidden items-center gap-1 sm:flex" aria-hidden>
        {phases.map((phase, index) => {
          const isPast = phase.step < activePhase.step;
          const isCurrent = phase.id === activePhaseId;
          return (
            <div key={phase.id} className="flex flex-1 items-center gap-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  isCurrent ? 'bg-sky-400' : isPast ? 'bg-sky-500/35' : 'bg-white/10'
                }`}
              />
              {index < phases.length - 1 && <span className="w-0" />}
            </div>
          );
        })}
      </div>

      {/* Active phase detail */}
      <div className={`rounded-2xl border border-white/10 bg-[#060a12]/50 p-5 ring-1 ${accent.ring}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text}`}
            >
              <PhaseIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
                  Step {activePhase.step}
                </p>
                <ApprovalStatusBadge status={effectiveStatus} />
              </div>
              <h3 className="mt-0.5 text-base font-semibold text-white sm:text-lg">
                {activePhase.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-400/80" />
                  {activePhase.timing}
                </span>
                {activePhase.walletThreshold != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-emerald-400/80" />
                    Wallet from {formatAdCost(activePhase.walletThreshold)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {kycCompleted && activePhase.platforms.length > 0 && onTimingChange && (
            <select
              value={activePhase.offsetDays}
              onChange={(e) => onTimingChange(activePhase.id, Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground"
              aria-label={`Change timing for ${activePhase.title}`}
            >
              {TIMING_OFFSET_PRESETS.map((preset) => (
                <option key={preset.days} value={preset.days}>
                  Move to {preset.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {activePhase.description}
        </p>

        {activePhase.requiresPmApproval && !pmApprovedPhases.includes(activePhase.id) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <p className="text-xs text-amber-200">
              Requires Rex project manager approval before this phase runs.
            </p>
            {onSubmitPmApproval && (
              <button
                type="button"
                onClick={() => onSubmitPmApproval(activePhase.id)}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
              >
                Submit for review
              </button>
            )}
          </div>
        )}

        {/* Vendors or empty state */}
        <div className="mt-5 border-t border-white/[0.06] pt-5">
          {activePhase.platforms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
              <PhaseIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-white">
                {activePhase.phaseType === 'launch'
                  ? 'Launch day setup'
                  : activePhase.phaseType === 'build'
                    ? 'Build milestone'
                    : activePhase.requiresPmApproval
                      ? 'Awaiting approval'
                      : 'No paid placements'}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                {activePhase.phaseType === 'launch'
                  ? 'Your token goes live on Rex. Marketing and roadmap wallets are created automatically from trade activity.'
                  : activePhase.phaseType === 'build'
                    ? 'Funded from your roadmap wallet when this deliverable milestone is reached.'
                    : 'Rex will coordinate this step once earlier phases are complete.'}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Recommended vendors for this phase
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {activePhase.platforms.map((entry) => {
                  const platform = getAdPlatform(entry.platformId);
                  const option = getAdPlatformOption(entry.platformId, entry.optionId);
                  if (!platform || !option) return null;

                  return (
                    <button
                      key={`${activePhase.id}-${entry.platformId}-${entry.optionId}`}
                      type="button"
                      onClick={() => onSelectPlatform(entry.platformId, activePhase.id)}
                      className="group flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#030711]/60 p-4 text-left transition-all hover:border-sky-500/35 hover:bg-sky-500/[0.04]"
                    >
                      <PlatformLogo platformId={entry.platformId} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{platform.name}</p>
                          <PlatformCategoryBadge category={platform.category} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {option.name}
                        </p>
                        <p className="mt-2 text-xs font-medium text-sky-300/90">
                          From {formatAdCost(option.costFrom)}
                          {option.duration ? ` · ${option.duration}` : ''}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-sky-400" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {!kycCompleted && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Complete KYC to adjust timing and swap vendor packages
          </p>
        )}
      </div>
    </div>
  );
}
