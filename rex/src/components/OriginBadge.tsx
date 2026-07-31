import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ORIGIN_META, type ProjectOrigin } from '../data/ctoProjects';

const CTOGO_MINT_TICKS = ['Marketing wallet', 'No dev', 'No rugs'] as const;

export function OriginBadge({
  origin,
  compact = false,
}: {
  origin: ProjectOrigin;
  compact?: boolean;
}) {
  const meta = ORIGIN_META[origin];
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${meta.badgeClass}`}
      title={meta.description}
    >
      <span aria-hidden>{meta.emoji}</span>
      {compact ? meta.short : meta.label}
    </span>
  );
}

export function MigrateToV2Banner({
  ticker,
  href = '/launch',
}: {
  ticker: string;
  sourceVenue?: string;
  devDumpedPct?: number;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-[#c8ff3d]/25 bg-gradient-to-br from-[#c8ff3d]/10 via-transparent to-transparent px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 pt-1.5 text-sm font-semibold text-white">Launch on CTOgo</p>
        <Link
          to={href}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
        >
          Launch {ticker} CTO
        </Link>
      </div>
      <ul className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {CTOGO_MINT_TICKS.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-[12px] text-white/70">
            <Check className="h-3.5 w-3.5 shrink-0 text-[#c8ff3d]" strokeWidth={2.5} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Native V2 coin that still has a linked previous mint. */
export function UpgradedOnCtogoBanner({
  ticker,
  onViewV1,
}: {
  ticker: string;
  onViewV1?: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300/90">
            Upgraded on CTOgo
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/55">
            You&apos;re on the CTOgo mint for ${ticker}. Trade stays here — switch the chart to
            view the previous mint.
          </p>
        </div>
        {onViewV1 ? (
          <button
            type="button"
            onClick={onViewV1}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 text-[11px] font-semibold text-white/75 hover:border-white/25 hover:text-white"
          >
            View V1 chart
          </button>
        ) : null}
      </div>
    </div>
  );
}
