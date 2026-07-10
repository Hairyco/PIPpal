import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { projectDeliverables } from '../../data/devStudios';
import type { RexConceptSummary } from '../../utils/conceptSummary';

interface RexConceptSummaryStepProps {
  summary: RexConceptSummary;
  categoryLabel?: string;
  onBack: () => void;
  onContinue: () => void;
}

export function RexConceptSummaryStep({
  summary,
  categoryLabel,
  onBack,
  onContinue,
}: RexConceptSummaryStepProps) {
  return (
    <div className="space-y-5">
      <div className="dex-card">
        <div className="relative z-[1] space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20">
              <Sparkles className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                Rex concept summary
              </p>
              <h2 className="mt-1 font-semibold text-white">{summary.headline}</h2>
              {categoryLabel && (
                <p className="mt-0.5 text-xs text-muted-foreground">{categoryLabel}</p>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{summary.summary}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Target audience
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground">{summary.audience}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Growth approach
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground">{summary.growthPlan}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Rex will focus on</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.inferredDeliverables.map((id) => {
                const d = projectDeliverables.find((x) => x.id === id);
                return (
                  <span
                    key={id}
                    className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-300"
                  >
                    {d?.label ?? id}
                  </span>
                );
              })}
            </div>
          </div>

          <ul className="space-y-2 border-t border-white/10 pt-4">
            {summary.highlights.map((item) => (
              <li key={item} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                {item}
              </li>
            ))}
          </ul>

          <p className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-xs text-muted-foreground">
            Next, Rex builds your marketing roadmap from this concept — then you&apos;ll set up
            landing page and banners in the creative suite.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <button type="button" onClick={onContinue} className="dex-btn">
          See marketing roadmap
          <ArrowRight className="ml-2 inline h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
