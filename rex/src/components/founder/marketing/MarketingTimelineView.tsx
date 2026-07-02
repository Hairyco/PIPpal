import { useState } from 'react';
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

const COL = 'w-[176px] shrink-0 sm:w-[200px]';

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

  const activePhase = phases.find((p) => p.id === activePhaseId);

  return (
    <div className="min-w-0 space-y-4">
      {/* Page 1: horizontal timeline + vendor columns below each step */}
      <div className="layout-clip relative rounded-xl border border-white/10 bg-[#060a12]/40">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="inline-flex min-w-full px-3 py-4">
            {phases.map((phase, index) => {
              const isActive = phase.id === activePhaseId;
              const isLast = index === phases.length - 1;
              const pmApproved = pmApprovedPhases.includes(phase.id);
              const effectiveStatus =
                pmApproved && phase.approvalStatus === 'pending-pm'
                  ? 'approved'
                  : phase.approvalStatus;

              return (
                <div
                  key={phase.id}
                  className={`relative flex flex-col ${COL} ${isLast ? '' : 'pr-3'}`}
                >
                  {/* Horizontal connector between steps */}
                  {!isLast && (
                    <div
                      className="pointer-events-none absolute left-[calc(50%+1.25rem)] top-[1.125rem] h-0.5 w-[calc(100%-2.5rem+0.75rem)] bg-gradient-to-r from-sky-500/45 to-sky-500/10"
                      aria-hidden
                    />
                  )}

                  {/* Timeline node */}
                  <button
                    type="button"
                    onClick={() => setActivePhaseId(phase.id)}
                    className="relative z-[1] mx-auto flex flex-col items-center text-center"
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                        isActive
                          ? 'border-sky-400 bg-sky-500/20 text-sky-300 ring-4 ring-sky-500/15'
                          : 'border-sky-500/30 bg-[#030711] text-sky-400/80'
                      }`}
                    >
                      {phase.step}
                    </div>
                    <p
                      className={`mt-2 line-clamp-2 px-1 text-[11px] font-semibold leading-snug ${
                        isActive ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {phase.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-sky-400/90">
                      <Calendar className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{phase.timing.split('·')[0].trim()}</span>
                    </p>
                    <div className="mt-1.5">
                      <ApprovalStatusBadge status={effectiveStatus} />
                    </div>
                  </button>

                  {/* Vendors below this step */}
                  <div
                    className={`mt-4 flex min-h-[120px] flex-col gap-2 rounded-lg border p-2 transition-colors ${
                      isActive
                        ? 'border-sky-500/25 bg-sky-500/5'
                        : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    {phase.platforms.length === 0 ? (
                      <p className="flex flex-1 items-center justify-center px-1 text-center text-[10px] leading-snug text-muted-foreground">
                        {phase.phaseType === 'launch'
                          ? 'Launch day'
                          : phase.requiresPmApproval
                            ? 'PM approval'
                            : 'Build phase'}
                      </p>
                    ) : (
                      phase.platforms.map((entry) => {
                        const platform = getAdPlatform(entry.platformId);
                        const option = getAdPlatformOption(entry.platformId, entry.optionId);
                        if (!platform || !option) return null;

                        return (
                          <button
                            key={`${phase.id}-${entry.platformId}`}
                            type="button"
                            onClick={() => {
                              setActivePhaseId(phase.id);
                              onSelectPlatform(entry.platformId, phase.id);
                            }}
                            className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#030711]/80 p-2 text-left transition-all hover:border-sky-500/30 hover:bg-sky-500/5"
                          >
                            <PlatformLogo platformId={entry.platformId} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[10px] font-semibold text-white">
                                {platform.name}
                              </p>
                              <p className="truncate text-[9px] text-muted-foreground">
                                {formatAdCost(option.costFrom)}
                              </p>
                            </div>
                            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-sky-400" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Scroll horizontally to see the full path · Tap a vendor for campaign details
      </p>

      {/* Expanded detail for selected step */}
      {activePhase && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
                Selected · Step {activePhase.step}
              </p>
              <h3 className="mt-0.5 text-sm font-semibold text-white">{activePhase.title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {activePhase.timing}
                </span>
                {activePhase.walletThreshold && (
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    {formatAdCost(activePhase.walletThreshold)} wallet threshold
                  </span>
                )}
              </p>
            </div>

            {kycCompleted && activePhase.platforms.length > 0 && onTimingChange && (
              <select
                value={activePhase.offsetDays}
                onChange={(e) => onTimingChange(activePhase.id, Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-foreground"
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

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {activePhase.description}
          </p>

          {activePhase.requiresPmApproval && !pmApprovedPhases.includes(activePhase.id) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
              <p className="text-xs text-amber-200">
                Requires Rex project manager approval before execution.
              </p>
              {onSubmitPmApproval && (
                <button
                  type="button"
                  onClick={() => onSubmitPmApproval(activePhase.id)}
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
                >
                  Submit for review
                </button>
              )}
            </div>
          )}

          {!kycCompleted && (
            <p className="mt-3 inline-flex items-center gap-1 text-[10px] text-amber-300/80">
              <Lock className="h-3 w-3" />
              Complete KYC to change timing and pick alternative vendor packages
            </p>
          )}
        </div>
      )}
    </div>
  );
}
