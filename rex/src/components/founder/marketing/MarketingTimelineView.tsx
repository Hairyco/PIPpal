import { Calendar, ChevronRight, Lock, Wallet } from 'lucide-react';
import { formatAdCost, getAdPlatform, getAdPlatformOption } from '../../../data/adPlatforms';
import type { MarketingTimelinePhase } from '../../../utils/buildMarketingRoadmap';
import { TIMING_OFFSET_PRESETS } from '../../../utils/buildMarketingRoadmap';
import { ApprovalStatusBadge, PlatformLogo } from './PlatformLogo';

interface MarketingTimelineViewProps {
  phases: MarketingTimelinePhase[];
  kycCompleted: boolean;
  pmApprovedPhases: string[];
  onSelectPlatform: (platformId: string, phaseId: string) => void;
  onTimingChange?: (phaseId: string, offsetDays: number) => void;
  onSubmitPmApproval?: (phaseId: string) => void;
}

export function MarketingTimelineView({
  phases,
  kycCompleted,
  pmApprovedPhases,
  onSelectPlatform,
  onTimingChange,
  onSubmitPmApproval,
}: MarketingTimelineViewProps) {
  return (
    <div className="relative min-w-0">
      <div
        className="pointer-events-none absolute bottom-4 left-[1.375rem] top-4 w-0.5 bg-gradient-to-b from-sky-500/50 via-indigo-400/30 to-sky-500/20"
        aria-hidden
      />

      <ol className="space-y-0">
        {phases.map((phase, index) => {
          const isLast = index === phases.length - 1;
          const pmApproved = pmApprovedPhases.includes(phase.id);
          const effectiveStatus = pmApproved && phase.approvalStatus === 'pending-pm'
            ? 'approved'
            : phase.approvalStatus;

          return (
            <li key={phase.id} className={`relative ${isLast ? '' : 'pb-8'}`}>
              <div className="relative z-[1] flex gap-4">
                {/* Step marker */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-[#030711] text-sm font-bold text-sky-400">
                  {phase.step}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Phase header */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{phase.title}</h3>
                        <ApprovalStatusBadge status={effectiveStatus} />
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-sky-400/90">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {phase.timing}
                        {phase.walletThreshold && (
                          <>
                            <span className="text-white/20">·</span>
                            <Wallet className="h-3 w-3 shrink-0" />
                            <span>{formatAdCost(phase.walletThreshold)} wallet</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* KYC timing editor */}
                    {kycCompleted && phase.platforms.length > 0 && onTimingChange && (
                      <select
                        value={phase.offsetDays}
                        onChange={(e) => onTimingChange(phase.id, Number(e.target.value))}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-foreground"
                        aria-label={`Change timing for ${phase.title}`}
                      >
                        {TIMING_OFFSET_PRESETS.map((preset) => (
                          <option key={preset.days} value={preset.days}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {phase.description}
                  </p>

                  {/* PM approval gate */}
                  {phase.requiresPmApproval && !pmApproved && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                      <p className="text-xs text-amber-200">
                        Requires Rex project manager approval before execution.
                      </p>
                      {onSubmitPmApproval && (
                        <button
                          type="button"
                          onClick={() => onSubmitPmApproval(phase.id)}
                          className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
                        >
                          Submit for review
                        </button>
                      )}
                    </div>
                  )}

                  {/* Platform blocks — horizontal scroll */}
                  {phase.platforms.length > 0 && (
                    <div className="layout-clip relative mt-4 -mx-1">
                      <div className="flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory hide-scrollbar">
                        {phase.platforms.map((entry) => {
                          const platform = getAdPlatform(entry.platformId);
                          const option = getAdPlatformOption(entry.platformId, entry.optionId);
                          if (!platform || !option) return null;

                          return (
                            <button
                              key={`${phase.id}-${entry.platformId}`}
                              type="button"
                              onClick={() => onSelectPlatform(entry.platformId, phase.id)}
                              className="group flex w-[148px] shrink-0 snap-start flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-all hover:border-sky-500/30 hover:bg-sky-500/5"
                            >
                              <PlatformLogo platformId={entry.platformId} size="md" />
                              <p className="mt-2 line-clamp-1 text-xs font-semibold text-white">
                                {platform.name}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                                {option.name}
                              </p>
                              <p className="mt-2 text-[10px] font-medium text-sky-400">
                                {formatAdCost(option.costFrom)}
                              </p>
                              <span className="mt-2 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground group-hover:text-sky-300">
                                View campaign
                                <ChevronRight className="h-3 w-3" />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!kycCompleted && phase.platforms.some((p) => {
                    const opt = getAdPlatformOption(p.platformId, p.optionId);
                    return opt?.kycRequired;
                  }) && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-amber-300/80">
                      <Lock className="h-3 w-3" />
                      Complete KYC to customise platform packages and timing
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
