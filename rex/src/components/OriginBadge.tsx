import { Link } from 'react-router-dom';
import { ORIGIN_META, type ProjectOrigin } from '../data/ctoProjects';

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
  sourceVenue,
  href = '/launch',
}: {
  ticker: string;
  sourceVenue?: string;
  devDumpedPct?: number;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-[#c8ff3d]/25 bg-gradient-to-br from-[#c8ff3d]/10 via-transparent to-transparent p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
            Want a fresh start?
          </p>
          <p className="mt-1.5 text-sm font-semibold text-white">
            Launch ${ticker} on CTOgo
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
            Still trading on {sourceVenue ?? 'another venue'}? Mint a CTOgo version with a marketing
            wallet built in — and keep discovery here.
          </p>
        </div>
        <Link
          to={href}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
        >
          Launch ${ticker} on CTOgo
        </Link>
      </div>
    </div>
  );
}
