import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MARKETING_SPEND_FLOW, formatSpendCost } from '../data/marketingSpendFlow';
import { PolessiaLogo } from './PolessiaLogo';

type SpendStatus = 'complete' | 'in-progress' | 'upcoming';

function statusForBalance(balance: number, cost: number, prevCost: number): SpendStatus {
  if (balance >= cost) return 'complete';
  if (balance >= prevCost) return 'in-progress';
  return 'upcoming';
}

function statusStyles(status: SpendStatus) {
  if (status === 'complete') {
    return {
      bar: 'bg-emerald-400',
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      label: 'Funded',
    };
  }
  if (status === 'in-progress') {
    return {
      bar: 'bg-[#c8ff3d]',
      badge: 'border-[#c8ff3d]/30 bg-[#c8ff3d]/10 text-[#d5ff69]',
      label: 'Filling',
    };
  }
  return {
    bar: 'bg-white/25',
    badge: 'border-white/15 bg-white/5 text-white/45',
    label: 'Queued',
  };
}

/** Progress tracker — spends unlock as the marketing vault fills from trades. */
export function MarketingWalletProgressTracker({
  balanceUsd = 420,
  compact = false,
}: {
  balanceUsd?: number;
  compact?: boolean;
}) {
  const rows = MARKETING_SPEND_FLOW.map((node, index) => {
    const prevThreshold = MARKETING_SPEND_FLOW.slice(0, index).reduce((sum, n) => sum + n.cost, 0);
    const unlockAt = prevThreshold + node.cost;
    const status = statusForBalance(balanceUsd, unlockAt, prevThreshold);
    const progress =
      status === 'complete'
        ? 100
        : status === 'in-progress'
          ? Math.min(99, Math.round(((balanceUsd - prevThreshold) / node.cost) * 100))
          : 0;
    return { ...node, status, progress, unlockAt };
  });

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-2.5'}>
      {rows.map((item) => {
        const styles = statusStyles(item.status);
        return (
          <div
            key={item.id}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-white/40">
                  Unlocks at {formatSpendCost(item.unlockAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
              >
                {styles.label}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${styles.bar}`}
                  style={{ width: `${Math.max(item.progress, 3)}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-white/90">
                {item.progress}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Marketing vault story — live milestone tracking.
 * Fill-rate schedule lives in FAQ; full fee math on /fees.
 */
export function MarketingWalletExplainer({
  balanceUsd,
  showChrome = true,
}: {
  balanceUsd?: number;
  /** When false, skip inner title (page already has a hero). */
  showChrome?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#050505]">
      {showChrome ? (
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <PolessiaLogo
              variant="mark"
              size="md"
              className="shrink-0 [&_img]:h-10 [&_img]:w-10 [&_img]:rounded-xl"
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2aabee]/90">
                Marketing wallet
              </p>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-white sm:text-xl">
                Trades fund growth
              </h3>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
            Live tracking
          </p>
          <p className="mt-1 text-[12px] text-white/50">
            Milestones fire in order — no founder wallet to drain, no chasing suppliers.
          </p>
          <div className="mt-3">
            <MarketingWalletProgressTracker balanceUsd={balanceUsd} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <p className="text-[11px] text-white/35">
            Vault fill rate & dump / quiet-coin rules →{' '}
            <Link to="/faq#marketing-wallet" className="font-semibold text-[#d5ff69] hover:underline">
              FAQ
            </Link>
            {' · '}
            <Link to="/fees" className="font-semibold text-[#d5ff69] hover:underline">
              Fees
            </Link>
          </p>
          <PolessiaLogo variant="powered" size="xs" />
        </div>
      </div>
    </div>
  );
}

export function MarketingWalletExplainerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal
    >
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={onClose} />
      <div className="relative z-[1] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#050505] shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-white/[0.06] bg-[#050505]/95 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Marketing wallet</p>
            <PolessiaLogo variant="powered" size="xs" className="mt-1" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <MarketingWalletExplainer showChrome={false} />
        </div>
      </div>
    </div>
  );
}
