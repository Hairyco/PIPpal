import { ChevronDown, Sparkles } from 'lucide-react';
import {
  INSPIRE_INTERESTS,
  inspireFromInterest,
  type InspireIdeaResult,
} from '../../utils/launchIdeaAssistant';
import { InspireResultCard } from './LaunchFlowParts';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

interface InspireMePanelProps {
  open: boolean;
  interest: string;
  result: InspireIdeaResult | null;
  loading: boolean;
  onToggle: () => void;
  onInterestChange: (value: string) => void;
  onSelectPill: (label: string, categoryId?: string) => void;
  onGenerate: () => void;
  onUseIdea: () => void;
}

export function InspireMePanel({
  open,
  interest,
  result,
  loading,
  onToggle,
  onInterestChange,
  onSelectPill,
  onGenerate,
  onUseIdea,
}: InspireMePanelProps) {
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/15"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Inspire me
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
          <p className="text-sm font-medium text-white">What are you interested in?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a topic or type anything — basketball, coffee shops, AI tutors…
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {INSPIRE_INTERESTS.map((pill) => {
              const selected = interest.toLowerCase() === pill.label.toLowerCase();
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => onSelectPill(pill.label, pill.categoryId)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
                      : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <input
              className={inputClass}
              placeholder="Or type anything — e.g. basketball, vintage watches…"
              value={interest}
              onChange={(e) => onInterestChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onGenerate();
                }
              }}
            />
          </div>

          <button
            type="button"
            disabled={!interest.trim() || loading}
            onClick={onGenerate}
            className="mt-3 w-full rounded-lg border border-sky-500/30 bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Generating…' : 'Generate idea'}
          </button>

          {result && (
            <div className="mt-4">
              <InspireResultCard result={result} onUseIdea={onUseIdea} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function runInspireGenerate(
  interest: string,
  categoryId: string,
  onDone: (result: InspireIdeaResult) => void,
  onLoading: (loading: boolean) => void,
) {
  onLoading(true);
  window.setTimeout(() => {
    onDone(inspireFromInterest({ interest, categoryId }));
    onLoading(false);
  }, 400);
}
