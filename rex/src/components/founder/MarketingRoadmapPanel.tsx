import { useMemo, useState, type ReactNode } from 'react';
import { Megaphone, Route } from 'lucide-react';
import type { DeliverableId } from '../../data/devStudios';
import type { RoadmapHorizonId } from '../../data/roadmapHorizons';
import type { FounderProject } from '../../utils/founderProject';
import { saveFounderProject } from '../../utils/founderProject';
import {
  buildMarketingTimeline,
  type MarketingTimelineOverrides,
} from '../../utils/buildMarketingRoadmap';
import { buildRecommendedRoadmap } from '../../utils/recommendedRoadmap';
import { RecommendedRoadmapList, RoadmapHorizonSelect } from '../get-started/LaunchFlowParts';
import { MarketingTimelineView } from './marketing/MarketingTimelineView';
import { PlatformCampaignDetail } from './marketing/PlatformCampaignDetail';

type RoadmapView = 'marketing' | 'build' | 'platform-detail';

interface MarketingRoadmapPanelProps {
  project: FounderProject;
  roadmapHorizon: RoadmapHorizonId;
  kycCompleted: boolean;
  onHorizonChange: (horizon: RoadmapHorizonId) => void;
}

export function MarketingRoadmapPanel({
  project,
  roadmapHorizon,
  kycCompleted,
  onHorizonChange,
}: MarketingRoadmapPanelProps) {
  const [view, setView] = useState<RoadmapView>('marketing');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<MarketingTimelineOverrides>(
    project.marketingTimelineOverrides ?? {},
  );
  const [pmApproved, setPmApproved] = useState<string[]>(project.pmApprovedPhases ?? []);

  const marketingPhases = useMemo(
    () =>
      buildMarketingTimeline({
        projectName: project.projectName,
        categoryId: project.categoryId,
        deliverables: project.deliverables,
        horizon: roadmapHorizon,
        overrides,
      }),
    [project, roadmapHorizon, overrides],
  );

  const buildMilestones = useMemo(
    () =>
      buildRecommendedRoadmap({
        categoryId: project.categoryId,
        projectName: project.projectName,
        deliverables: project.deliverables.filter(
          (d) => d !== 'physical-product',
        ) as DeliverableId[],
        horizon: roadmapHorizon,
      }),
    [project, roadmapHorizon],
  );

  const persist = (patch: Partial<FounderProject>) => {
    saveFounderProject({ ...project, ...patch });
  };

  const handleTimingChange = (phaseId: string, offsetDays: number) => {
    if (!kycCompleted) return;
    const next = {
      ...overrides,
      [phaseId]: { ...overrides[phaseId], offsetDays },
    };
    setOverrides(next);
    persist({ marketingTimelineOverrides: next });
  };

  const handleSelectOption = (platformId: string, optionId: string) => {
    if (!kycCompleted) return;
    const phase = marketingPhases.find((p) =>
      p.platforms.some((pl) => pl.platformId === platformId),
    );
    if (!phase) return;

    const next = {
      ...overrides,
      [phase.id]: {
        ...overrides[phase.id],
        selectedOptions: {
          ...overrides[phase.id]?.selectedOptions,
          [platformId]: optionId,
        },
      },
    };
    setOverrides(next);
    persist({ marketingTimelineOverrides: next });
  };

  const handlePmSubmit = (phaseId: string) => {
    const next = [...pmApproved, phaseId];
    setPmApproved(next);
    persist({ pmApprovedPhases: next });
  };

  const selectedOptionId = selectedPlatformId
    ? overrides[
        marketingPhases.find((p) => p.platforms.some((pl) => pl.platformId === selectedPlatformId))
          ?.id ?? ''
      ]?.selectedOptions?.[selectedPlatformId]
    : undefined;

  if (view === 'platform-detail' && selectedPlatformId) {
    return (
      <PlatformCampaignDetail
        platformId={selectedPlatformId}
        phases={marketingPhases}
        kycCompleted={kycCompleted}
        selectedOptionId={selectedOptionId}
        onSelectOption={(optionId) => handleSelectOption(selectedPlatformId, optionId)}
        onBack={() => {
          setView('marketing');
          setSelectedPlatformId(null);
        }}
      />
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      {/* View switcher */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <ViewTab
          active={view === 'marketing'}
          onClick={() => setView('marketing')}
          icon={<Megaphone className="h-3.5 w-3.5" />}
          label="Marketing campaign"
        />
        <ViewTab
          active={view === 'build'}
          onClick={() => setView('build')}
          icon={<Route className="h-3.5 w-3.5" />}
          label="Build roadmap"
        />
      </div>

      {view === 'marketing' ? (
        <>
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-sky-500/[0.07] via-transparent to-indigo-500/[0.05] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
                  Your marketing plan
                </p>
                <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
                  Community first, then charting and scale
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Rex sequences paid placements as your marketing wallet fills — Telegram and
                  callers early, then charting, growth banners, and high-impact scale buys.
                  {!kycCompleted &&
                    ' Complete KYC to adjust timing and pick alternative vendor packages.'}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 text-[10px] font-medium">
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                  Funded by trade tax
                </span>
                <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-sky-300">
                  {marketingPhases.length} phases
                </span>
              </div>
            </div>
          </div>

          <MarketingTimelineView
            phases={marketingPhases}
            kycCompleted={kycCompleted}
            pmApprovedPhases={pmApproved}
            onSelectPlatform={(platformId) => {
              setSelectedPlatformId(platformId);
              setView('platform-detail');
            }}
            onTimingChange={kycCompleted ? handleTimingChange : undefined}
            onSubmitPmApproval={handlePmSubmit}
          />
        </>
      ) : (
        <>
          <RoadmapHorizonSelect value={roadmapHorizon} onChange={onHorizonChange} />
          <RecommendedRoadmapList milestones={buildMilestones} />
        </>
      )}
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
        active
          ? 'bg-sky-500/15 text-sky-400'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
