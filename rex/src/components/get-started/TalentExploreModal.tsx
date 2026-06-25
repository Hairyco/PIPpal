import { useState } from 'react';
import { Star, X } from 'lucide-react';
import type { DeliverableId } from '../../data/devStudios';
import { projectDeliverables } from '../../data/devStudios';
import { getTalentForDeliverable, type TalentWorker } from '../../data/talentPool';
import { getTalentPortfolio } from '../../data/portfolios';
import type { VendorChatTarget } from '../../utils/vendorChat';
import { vendorChatKey } from '../../utils/vendorChat';
import { PortfolioModal } from './PortfolioModal';

interface TalentExploreModalProps {
  deliverableId: DeliverableId;
  assignedId?: string;
  vendorChatKeys: string[];
  onAssign: (talentId: string) => void;
  onOpenChat: (target: VendorChatTarget) => void;
  onClose: () => void;
}

export function TalentExploreModal({
  deliverableId,
  assignedId,
  vendorChatKeys,
  onAssign,
  onOpenChat,
  onClose,
}: TalentExploreModalProps) {
  const deliverable = projectDeliverables.find((d) => d.id === deliverableId)!;
  const workers = getTalentForDeliverable(deliverableId);
  const [portfolioWorker, setPortfolioWorker] = useState<TalentWorker | null>(null);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="my-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-white/10 p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-sky-400">Explore</p>
              <h2 className="mt-1 text-xl font-bold text-white">
                All {deliverable.label} talent
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{deliverable.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[60vh] space-y-2 overflow-y-auto p-5">
            {workers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No gig workers listed for this function yet.
              </p>
            ) : (
              workers.map((worker) => {
                const assigned = assignedId === worker.id;
                return (
                  <div
                    key={worker.id}
                    className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                      assigned
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <img
                        src={worker.avatar}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-white">{worker.name}</p>
                        <p className="text-xs text-muted-foreground">{worker.role}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {worker.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-xs sm:flex-col sm:items-end sm:gap-1">
                      <p className="font-medium text-foreground">{worker.rate}</p>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-3 w-3 fill-sky-400 text-sky-400" />
                        {worker.rating}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <button
                        type="button"
                        onClick={() => setPortfolioWorker(worker)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-white/10"
                      >
                        View portfolio
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenChat({
                            key: vendorChatKey('talent', worker.id),
                            kind: 'talent',
                            name: worker.name,
                            subtitle: worker.specialty,
                            avatar: worker.avatar,
                          })
                        }
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          vendorChatKeys.includes(vendorChatKey('talent', worker.id))
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
                        }`}
                      >
                        Chat
                      </button>
                      <button
                        type="button"
                        disabled={!worker.available}
                        onClick={() => {
                          onAssign(worker.id);
                          onClose();
                        }}
                        className="rounded-lg border border-sky-500/30 bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/25 disabled:opacity-40"
                      >
                        {assigned ? 'Selected' : 'Hire'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
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
    </>
  );
}
