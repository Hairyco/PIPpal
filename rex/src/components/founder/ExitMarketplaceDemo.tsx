import { useState } from 'react';
import { ArrowRightLeft, Store } from 'lucide-react';
import {
  EXIT_MARKETPLACE_FEE_PERCENT,
  FOUNDER_ALLOCATION_PERCENT,
  getVestingProgress,
} from '../../data/founderTokenomics';
import type { RoadmapHorizonId } from '../../data/roadmapHorizons';

export function ExitMarketplaceDemo({
  projectName,
  symbol,
  horizon,
  launchedAt,
  kycCompleted,
}: {
  projectName: string;
  symbol: string;
  horizon: RoadmapHorizonId;
  launchedAt: string;
  kycCompleted: boolean;
}) {
  const [listed, setListed] = useState(false);
  const progress = getVestingProgress(launchedAt, horizon, kycCompleted);
  const canList =
    kycCompleted &&
    (progress.status === 'vesting' || progress.status === 'fully-vested') &&
    progress.founderUnlockedPercent > 0;

  return (
    <section className="dex-card">
      <div className="relative z-[1] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
            Exit marketplace
          </span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-white">Sell your project on Rex</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          List {projectName} when your founder stake has started vesting. Buyers acquire the product,
          Rex listing, and agreed assets. Your vested {symbol} allocation is part of the transaction.
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-[#0a0e17]/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">
                {listed ? 'Listed (demo)' : 'Not listed'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {canList
                  ? `${progress.founderUnlockedPercent}% of ${FOUNDER_ALLOCATION_PERCENT}% founder allocation vested · eligible to list`
                  : !kycCompleted
                    ? 'Complete KYC to start vesting, then list after cliff'
                    : progress.status === 'cliff'
                      ? 'In cliff period — listing opens after first unlock'
                      : 'Vesting has not started yet'}
              </p>
            </div>
            {listed && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                Demo listing active
              </span>
            )}
          </div>

          {!listed && canList && (
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                Product, codebase, and Rex project page transfer to buyer
              </li>
              <li className="flex items-center gap-2">
                <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                Vested founder tokens included or bought out at closing
              </li>
              <li className="flex items-center gap-2">
                <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                Rex {EXIT_MARKETPLACE_FEE_PERCENT}% success fee on agreed sale price (T&amp;Cs)
              </li>
            </ul>
          )}
        </div>

        <button
          type="button"
          disabled={!canList || listed}
          onClick={() => setListed(true)}
          className="dex-btn-green mt-5 w-full justify-center sm:w-auto disabled:cursor-not-allowed disabled:opacity-40"
        >
          {listed ? 'Listed on marketplace (demo)' : canList ? 'List on exit marketplace (demo)' : 'Not yet eligible'}
        </button>

        <p className="mt-3 text-xs text-muted-foreground">
          Demo only — Rex exit marketplace is not live. Share-pool grants follow separate transfer
          rules on exit.
        </p>
      </div>
    </section>
  );
}
