import { Link } from 'react-router-dom';
import { Star, Users } from 'lucide-react';
import { projectDeliverables, type DeliverableId } from '../../data/devStudios';
import { getTalentForDeliverable, talentPool } from '../../data/talentPool';

interface LaunchTalentStepProps {
  deliverables: DeliverableId[];
  talentAssignments: Record<string, string>;
  onAssignTalent: (deliverableId: string, talentId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function LaunchTalentStep({
  deliverables,
  talentAssignments,
  onAssignTalent,
  onBack,
  onContinue,
}: LaunchTalentStepProps) {
  return (
    <div className="space-y-5">
      <div className="dex-card">
        <div className="relative z-[1]">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-400" />
            <h2 className="font-semibold text-white">Talent pool</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Some parts of your project need individuals — not a full studio. Hire vetted freelancers
            for specific deliverables.
          </p>

          <div className="mt-6 space-y-6">
            {deliverables.map((deliverableId) => {
              const deliverable = projectDeliverables.find((d) => d.id === deliverableId)!;
              const workers = getTalentForDeliverable(deliverableId);
              const assignedId = talentAssignments[deliverableId];

              return (
                <div key={deliverableId} className="rounded-xl border border-white/10 p-4">
                  <p className="text-sm font-medium text-white">{deliverable.label}</p>
                  <p className="text-xs text-muted-foreground">{deliverable.description}</p>

                  {workers.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No talent listed yet — your studio can handle this part.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {workers.map((worker) => {
                        const assigned = assignedId === worker.id;
                        return (
                          <button
                            key={worker.id}
                            type="button"
                            disabled={!worker.available}
                            onClick={() => onAssignTalent(deliverableId, worker.id)}
                            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-50 ${
                              assigned
                                ? 'border-emerald-500/40 bg-emerald-500/10'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                              {worker.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white">{worker.name}</p>
                              <p className="text-xs text-muted-foreground">{worker.role}</p>
                            </div>
                            <div className="shrink-0 text-right text-xs">
                              <p className="font-medium text-foreground">{worker.rate}</p>
                              <p className="flex items-center justify-end gap-1 text-muted-foreground">
                                <Star className="h-3 w-3 fill-sky-400 text-sky-400" />
                                {worker.rating}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Optional — skip workers you don&apos;t need. {talentPool.length} vetted freelancers in
            the Rex talent pool.{' '}
            <Link to="/become-a-supplier" className="text-sky-400 hover:underline">
              Join as talent
            </Link>
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <button type="button" onClick={onContinue} className="dex-btn">
          Review & launch
        </button>
      </div>
    </div>
  );
}
