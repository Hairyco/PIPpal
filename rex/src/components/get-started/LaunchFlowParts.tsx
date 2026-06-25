import { useState } from 'react';
import { ChevronDown, MapPin, Sparkles } from 'lucide-react';
import type { RecommendedMilestone } from '../../utils/recommendedRoadmap';
import { roadmapHorizons, type RoadmapHorizonId } from '../../data/roadmapHorizons';

const MOBILE_PREVIEW_COUNT = 4;

export function RecommendedRoadmapList({ milestones }: { milestones: RecommendedMilestone[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = milestones.length > MOBILE_PREVIEW_COUNT;
  const mobileVisible = expanded ? milestones : milestones.slice(0, MOBILE_PREVIEW_COUNT);

  return (
    <div className="min-w-0">
      {/* Mobile: compact list with expand */}
      <ol className="space-y-2.5 md:hidden">
        {mobileVisible.map((milestone) => (
          <MilestoneCard key={`${milestone.step}-${milestone.title}`} milestone={milestone} compact />
        ))}
      </ol>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-2.5 text-sm text-muted-foreground transition-colors hover:border-sky-500/30 hover:text-foreground md:hidden"
        >
          {expanded ? 'Show fewer milestones' : `Show all ${milestones.length} milestones`}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Desktop: full list */}
      <ol className="hidden space-y-3 md:block">
        {milestones.map((milestone) => (
          <MilestoneCard key={`${milestone.step}-${milestone.title}`} milestone={milestone} />
        ))}
      </ol>
    </div>
  );
}

function MilestoneCard({
  milestone,
  compact = false,
}: {
  milestone: RecommendedMilestone;
  compact?: boolean;
}) {
  return (
    <li
      className={`min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-rex-gradient font-bold text-white ${
            compact ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
          }`}
          aria-hidden
        >
          {milestone.step}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`break-words font-medium text-white ${compact ? 'text-sm' : ''}`}>
            {milestone.title}
          </h3>
          <span className="mt-1.5 inline-block max-w-full break-words rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium leading-snug text-sky-300">
            {milestone.unlock}
          </span>
          <p
            className={`mt-2 break-words leading-relaxed text-muted-foreground ${
              compact ? 'text-xs' : 'text-sm'
            }`}
          >
            {milestone.description}
          </p>
        </div>
      </div>
    </li>
  );
}

export function RoadmapHorizonSelect({
  value,
  onChange,
}: {
  value: RoadmapHorizonId;
  onChange: (id: RoadmapHorizonId) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Roadmap horizon
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {roadmapHorizons.map((horizon) => {
          const selected = value === horizon.id;
          return (
            <button
              key={horizon.id}
              type="button"
              onClick={() => onChange(horizon.id)}
              className={`min-w-0 rounded-xl border p-4 text-left transition-colors ${
                selected
                  ? 'border-sky-500/50 bg-sky-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <p className="font-medium text-white">{horizon.label}</p>
              <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
                {horizon.summary}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RoadmapKycNotice() {
  return (
    <div className="min-w-0 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
      <div className="flex gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Recommended roadmap — Rex managed</p>
          <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
            This path is included in your $1 launch. Shortlist studios and talent on the next steps.
            Complete KYC ($150) to unlock your founder token allocation, edit milestones, and approve
            vendor spend yourself.
          </p>
        </div>
      </div>
    </div>
  );
}

export function InspireResultCard({
  result,
  onUseIdea,
}: {
  result: import('../../utils/launchIdeaAssistant').InspireResult;
  onUseIdea?: () => void;
}) {
  if (result.type === 'idea') {
    return (
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
              Inspired idea
            </p>
            <p className="mt-1 font-medium text-white">{result.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{result.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Est. raise {result.estimatedRaise} · Build {result.buildTime}
            </p>
            {onUseIdea && (
              <button
                type="button"
                onClick={onUseIdea}
                className="mt-3 text-sm font-medium text-sky-400 hover:text-sky-300"
              >
                Use this idea →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-sky-400">Feedback</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {result.suggestions.map((item) => (
              <li key={item} className="text-sm text-foreground/80">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
