import { CheckCircle2, Circle, Clock, Wallet, X } from 'lucide-react';
import {
  CREATOR_FEE_BPS,
  MARKETING_FEE_BPS,
  PLATFORM_FEE_BPS,
  TRADE_FEE_BPS,
  TRADE_FEE_LABEL,
} from '../data/chainConfig';
import {
  MARKETING_SPEND_FLOW,
  formatSpendCost,
} from '../data/marketingSpendFlow';

function formatBpsPercent(bps: number) {
  const pct = bps / 100;
  return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(2).replace(/0$/, '')}%`;
}

const FEE_ROWS = [
  { label: 'Platform (Rex)', bps: PLATFORM_FEE_BPS, tone: 'text-white/80' },
  { label: 'Creator vault', bps: CREATOR_FEE_BPS, tone: 'text-[#7dd3fc]' },
  { label: 'Marketing wallet', bps: MARKETING_FEE_BPS, tone: 'text-[#d5ff69]' },
] as const;

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

/** Progress tracker — same pattern as the original Rex build tracker, for marketing spends. */
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

  const overall = Math.round(rows.reduce((sum, r) => sum + r.progress, 0) / rows.length);
  const funded = rows.filter((r) => r.status === 'complete').length;
  const filling = rows.filter((r) => r.status === 'in-progress').length;
  const queued = rows.filter((r) => r.status === 'upcoming').length;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-3.5'}>
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-white/[0.08] bg-black/30 p-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Wallet fill</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{overall}%</p>
          <p className="mt-0.5 text-[11px] text-white/45">
            Balance {formatSpendCost(balanceUsd)} · next unlocks as tax fills the vault
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[10px] text-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            {funded} funded
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-2 py-1 text-[10px] text-[#d5ff69]">
            <Clock className="h-3 w-3" />
            {filling} filling
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/45">
            <Circle className="h-3 w-3" />
            {queued} queued
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
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
                    Unlocks at {formatSpendCost(item.unlockAt)} wallet
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
    </div>
  );
}

export function MarketingWalletExplainer({
  balanceUsd,
  showLiveBadge = true,
}: {
  balanceUsd?: number;
  showLiveBadge?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#050505]">
      <div className="border-b border-white/[0.06] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2aabee]/15 text-[#2aabee]">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2aabee]/90">
                Marketing wallet
              </p>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-white sm:text-xl">
                How spend gets funded
              </h3>
            </div>
          </div>
          {showLiveBadge ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-medium text-emerald-300">Live tracker</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/35 p-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                Trade fees
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                {formatBpsPercent(TRADE_FEE_BPS)}{' '}
                <span className="text-sm font-medium text-white/45">per buy &amp; sell</span>
              </p>
            </div>
            <p className="max-w-[14rem] text-right text-[10px] leading-relaxed text-white/35">
              {TRADE_FEE_LABEL}
            </p>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {FEE_ROWS.map((row) => (
              <li
                key={row.label}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2"
              >
                <p className="text-[10px] text-white/40">{row.label}</p>
                <p className={`mt-0.5 text-sm font-bold tabular-nums ${row.tone}`}>
                  {formatBpsPercent(row.bps)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
          The marketing share ({formatBpsPercent(MARKETING_FEE_BPS)}) lands in a non-custodial vault
          for this coin. Creator fees ({formatBpsPercent(CREATOR_FEE_BPS)}) update the creator vault
          for withdrawal. As the marketing balance rises, Rex unlocks supplier spends in order —
          you track progress here the same way builds used to show on the Rex landing page.
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <MarketingWalletProgressTracker balanceUsd={balanceUsd} />
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={onClose} />
      <div className="relative z-[1] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#050505] shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-white/[0.06] bg-[#050505]/95 px-4 py-3 backdrop-blur">
          <p className="text-sm font-semibold text-white">Marketing wallet</p>
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
          <MarketingWalletExplainer />
        </div>
      </div>
    </div>
  );
}
