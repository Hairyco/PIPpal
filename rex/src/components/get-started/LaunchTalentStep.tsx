import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ExternalLink, MessageCircle, Star, Users } from 'lucide-react';
import { projectDeliverables, type DeliverableId } from '../../data/devStudios';
import { getTalentForDeliverable, talentPool, type TalentWorker } from '../../data/talentPool';
import { getTalentPortfolio } from '../../data/portfolios';
import type { VendorChatTarget } from '../../utils/vendorChat';
import { vendorChatKey } from '../../utils/vendorChat';
import { PortfolioModal } from './PortfolioModal';
import { TalentExploreModal } from './TalentExploreModal';

interface LaunchTalentStepProps {
  deliverables: DeliverableId[];
  talentAssignments: Record<string, string>;
  vendorChatKeys: string[];
  onAssignTalent: (deliverableId: string, talentId: string) => void;
  onOpenChat: (target: VendorChatTarget) => void;
  onBack: () => void;
  onContinue: () => void;
}

function openTalentChat(worker: TalentWorker, onOpenChat: (target: VendorChatTarget) => void) {
  onOpenChat({
    key: vendorChatKey('talent', worker.id),
    kind: 'talent',
    name: worker.name,
    subtitle: worker.specialty,
    avatar: worker.avatar,
  });
}

export function LaunchTalentStep({
  deliverables,
  talentAssignments,
  vendorChatKeys,
  onAssignTalent,
  onOpenChat,
  onBack,
  onContinue,
}: LaunchTalentStepProps) {
  const [portfolioWorker, setPortfolioWorker] = useState<TalentWorker | null>(null);
  const [exploreDeliverable, setExploreDeliverable] = useState<DeliverableId | null>(null);

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
            for specific deliverables, or chat to align scope after launch.
          </p>

          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200/90">
            Talent hires are optional at launch — message freelancers now and finalise contracts when
            milestones unlock.
          </div>

          <div className="mt-6 space-y-6">
            {deliverables.map((deliverableId) => {
              const deliverable = projectDeliverables.find((d) => d.id === deliverableId)!;
              const workers = getTalentForDeliverable(deliverableId);
              const assignedId = talentAssignments[deliverableId];

              return (
                <div key={deliverableId} className="rounded-xl border border-white/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{deliverable.label}</p>
                      <p className="text-xs text-muted-foreground">{deliverable.description}</p>
                    </div>
                    {workers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExploreDeliverable(deliverableId)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-sky-300 hover:border-sky-500/30 hover:bg-sky-500/10"
                      >
                        <Compass className="h-3.5 w-3.5" />
                        Explore all ({workers.length})
                      </button>
                    )}
                  </div>

                  {workers.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No talent listed yet — your studio can handle this part.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {workers.slice(0, 3).map((worker) => {
                        const assigned = assignedId === worker.id;
                        return (
                          <div
                            key={worker.id}
                            className={`rounded-lg border transition-colors ${
                              assigned
                                ? 'border-emerald-500/40 bg-emerald-500/10'
                                : 'border-white/10 bg-white/[0.02]'
                            }`}
                          >
                            <button
                              type="button"
                              disabled={!worker.available}
                              onClick={() => onAssignTalent(deliverableId, worker.id)}
                              className="flex w-full items-center gap-3 p-3 text-left disabled:opacity-50"
                            >
                              <img
                                src={worker.avatar}
                                alt=""
                                className="h-9 w-9 shrink-0 rounded-full object-cover"
                              />
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
                            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2">
                              <button
                                type="button"
                                onClick={() => setPortfolioWorker(worker)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View portfolio
                              </button>
                              <button
                                type="button"
                                onClick={() => openTalentChat(worker, onOpenChat)}
                                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                  vendorChatKeys.includes(vendorChatKey('talent', worker.id))
                                    ? 'text-emerald-400'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <MessageCircle className="h-3 w-3" />
                                {vendorChatKeys.includes(vendorChatKey('talent', worker.id))
                                  ? 'Chat open'
                                  : 'Chat'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {workers.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setExploreDeliverable(deliverableId)}
                          className="w-full py-2 text-center text-xs font-medium text-sky-400 hover:text-sky-300"
                        >
                          + {workers.length - 3} more in {deliverable.label}
                        </button>
                      )}
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

      {portfolioWorker && (
        <PortfolioModal
          name={portfolioWorker.name}
          subtitle={`${portfolioWorker.role} · ${portfolioWorker.specialty}`}
          banner={portfolioWorker.banner}
          avatar={portfolioWorker.avatar}
          items={getTalentPortfolio(portfolioWorker.id)}
          onClose={() => setPortfolioWorker(null)}
        />
      )}

      {exploreDeliverable && (
        <TalentExploreModal
          deliverableId={exploreDeliverable}
          assignedId={talentAssignments[exploreDeliverable]}
          vendorChatKeys={vendorChatKeys}
          onAssign={(talentId) => onAssignTalent(exploreDeliverable, talentId)}
          onOpenChat={onOpenChat}
          onClose={() => setExploreDeliverable(null)}
        />
      )}
    </div>
  );
}
