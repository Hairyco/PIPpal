import { MapPin, Sparkles } from 'lucide-react';
import type { RecommendedMilestone } from '../../utils/recommendedRoadmap';

export function RecommendedRoadmapList({ milestones }: { milestones: RecommendedMilestone[] }) {
  return (
    <ol className="space-y-3">
      {milestones.map((milestone) => (
        <li
          key={`${milestone.step}-${milestone.title}`}
          className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rex-gradient text-sm font-bold text-white"
            aria-hidden
          >
            {milestone.step}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-medium text-white">{milestone.title}</h3>
              <span className="shrink-0 rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                {milestone.unlock}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {milestone.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RoadmapKycNotice() {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
      <div className="flex gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-medium text-white">Recommended roadmap — Rex managed</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This path is included in your $1 launch. Shortlist studios and talent on the next steps.
            Complete KYC ($150) later to edit milestones and approve vendor spend yourself.
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
