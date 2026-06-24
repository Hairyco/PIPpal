import { useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import type { ProjectIdea } from '../../data/categoryContent';
import { ClaimProjectModal } from '../ClaimProjectModal';

export function IdeasPanel({ ideas }: { ideas: ProjectIdea[] }) {
  const [claimingIdea, setClaimingIdea] = useState<ProjectIdea | null>(null);

  return (
    <>
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          AI-generated project ideas waiting for a founder. Claim one for $1 to become the verified
          owner — then assign a supplier and optionally add investor perks.
        </p>

        <div className="grid gap-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="dex-card !flex-row items-start justify-between gap-4 p-5 sm:flex"
            >
              <div className="relative z-[1] min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                    Generated idea
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground">{idea.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {idea.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Est. raise: <span className="text-foreground">{idea.estimatedRaise}</span></span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Build: <span className="text-foreground">{idea.buildTime}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setClaimingIdea(idea)}
                className="dex-btn-green relative z-[1] shrink-0 whitespace-nowrap"
              >
                Claim this project
              </button>
            </div>
          ))}
        </div>
      </div>

      {claimingIdea && (
        <ClaimProjectModal
          projectTitle={claimingIdea.title}
          onClose={() => setClaimingIdea(null)}
        />
      )}
    </>
  );
}
