import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import {
  demoMarketingWalletActivity,
  formatMarketingSol,
  formatMarketingUsd,
  MARKETING_ACTIVITY_IS_DEMO,
  solscanTxUrl,
  type MarketingTxDirection,
  type MarketingWalletTx,
} from '../data/marketingWalletActivity';

type Filter = 'all' | 'in' | 'out';

type MarketingWalletActivityProps = {
  ticker: string;
  /** Compact list for coin page; full for dashboard. */
  compact?: boolean;
  className?: string;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'In' },
  { id: 'out', label: 'Out' },
];

function directionIcon(direction: MarketingTxDirection) {
  return direction === 'in' ? ArrowDownLeft : ArrowUpRight;
}

function kindBadge(tx: MarketingWalletTx): string {
  switch (tx.kind) {
    case 'trade_fee':
      return 'Fee';
    case 'investor_in':
      return 'Pay-in';
    case 'supplier_payout':
      return 'Supplier';
    case 'affiliate_payout':
      return 'Affiliate';
    default:
      return 'Tx';
  }
}

export function MarketingWalletActivity({
  ticker,
  compact = false,
  className = '',
}: MarketingWalletActivityProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const txs = useMemo(() => demoMarketingWalletActivity(ticker), [ticker]);

  const visible = useMemo(() => {
    const filtered =
      filter === 'all' ? txs : txs.filter((tx) => tx.direction === filter);
    return compact ? filtered.slice(0, 5) : filtered;
  }, [txs, filter, compact]);

  const inTotal = txs
    .filter((tx) => tx.direction === 'in')
    .reduce((sum, tx) => sum + tx.amountUsd, 0);
  const outTotal = txs
    .filter((tx) => tx.direction === 'out')
    .reduce((sum, tx) => sum + tx.amountUsd, 0);

  return (
    <section className={className}>
      {!compact ? (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-white/45">Transaction history</p>
            <p className="mt-1 text-[12px] text-white/45">
              Fees, investor pay-ins, and whitelisted supplier payouts — live here without opening
              Solscan.
            </p>
            {MARKETING_ACTIVITY_IS_DEMO ? (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">
                Demo ledger · replace when indexer + receipts are live
              </p>
            ) : null}
          </div>
          <div className="text-right text-[11px] text-white/40">
            <p>
              In <span className="font-semibold text-[#d5ff69]">{formatMarketingUsd(inTotal)}</span>
              <span className="mx-1.5 text-white/20">·</span>
              Out <span className="font-semibold text-rose-300">{formatMarketingUsd(outTotal)}</span>
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={`${compact ? '' : 'mt-3 '}inline-flex gap-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5`}
      >
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
              filter === item.id
                ? 'bg-[#c8ff3d] text-[#090b14]'
                : 'text-white/45 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {visible.length === 0 ? (
          <li className="py-4 text-center text-[12px] text-white/35">No transactions yet</li>
        ) : (
          visible.map((tx) => {
            const Icon = directionIcon(tx.direction);
            const isIn = tx.direction === 'in';
            return (
              <li key={tx.id} className="flex items-start gap-2.5 py-3">
                <span
                  className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    isIn
                      ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                      : 'bg-rose-500/15 text-rose-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-[13px] font-semibold text-white">{tx.label}</p>
                    <span className="rounded border border-white/[0.08] px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-white/35">
                      {kindBadge(tx)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-white/40">
                    {tx.note ? (
                      <>
                        <span className="text-white/55">{tx.note}</span>
                        <span className="mx-1 text-white/20">·</span>
                      </>
                    ) : null}
                    {tx.counterparty}
                    <span className="mx-1 text-white/20">·</span>
                    {tx.when}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-[13px] font-semibold tabular-nums ${
                      isIn ? 'text-[#d5ff69]' : 'text-rose-300'
                    }`}
                  >
                    {isIn ? '+' : '−'}
                    {formatMarketingUsd(tx.amountUsd)}
                  </p>
                  <p className="mt-0.5 text-[10px] tabular-nums text-white/35">
                    {formatMarketingSol(tx.amountSol)}
                  </p>
                  <a
                    href={solscanTxUrl(tx.signature)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-white/35 hover:text-[#d5ff69]"
                    title="View on Solscan"
                  >
                    Tx
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {compact && txs.length > visible.length ? (
        <p className="mt-2 text-[11px] text-white/35">
          Showing latest {visible.length} of {txs.length}
        </p>
      ) : null}

      <p className="mt-3 text-[10px] leading-relaxed text-white/30">
        Demo ledger. On-chain memos (e.g. “DexScreener”) on Solscan will appear when the wallet
        contract is final.
      </p>
    </section>
  );
}
