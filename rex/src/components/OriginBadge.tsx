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
  devDumpedPct,
  href = '/launch',
}: {
  ticker: string;
  sourceVenue?: string;
  devDumpedPct?: number;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-rose-400/35 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-300">
            External CTO · migrate to Native V2
          </p>
          <p className="mt-1.5 text-sm font-semibold text-white">
            ${ticker} is still on {sourceVenue ?? 'an external launchpad'}
            {devDumpedPct != null ? ` — original dev dumped ${devDumpedPct}%` : ''}.
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">
            Is the original dev still stealing creator fees on this token? Launch a Native V2 CTO to
            burn V1 tokens, cut off the scammer, and route 100% of creator fees to the community.
          </p>
        </div>
        <Link
          to={href}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
        >
          Launch a CTO
        </Link>
      </div>
    </div>
  );
}
