import { Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import type { CloneWebsiteJob } from '../utils/cloneWebsiteJob';

type CloneProgressBarProps = {
  job: CloneWebsiteJob;
  /** Show link to dashboard while cloning */
  showDashboardLink?: boolean;
  className?: string;
};

export function CloneProgressBar({
  job,
  showDashboardLink = false,
  className = '',
}: CloneProgressBarProps) {
  const cloning = job.status === 'cloning';
  const ready = job.status === 'ready';

  return (
    <div
      className={`space-y-2 rounded-2xl border border-white/[0.08] bg-[#121214] px-3.5 py-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-white">
            {cloning ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#d5ff69]" />
            ) : ready ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-[#d5ff69]" />
            ) : null}
            {cloning
              ? job.statusLabel || 'Cloning website…'
              : ready
                ? job.statusLabel || 'Clone ready'
                : job.statusLabel || 'Clone'}
          </p>
          {job.sourceUrl ? (
            <p className="mt-0.5 truncate text-[10px] text-white/35">{job.sourceUrl}</p>
          ) : null}
        </div>
        <p className="shrink-0 font-mono text-[11px] tabular-nums text-white/45">
          {job.progress}%
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-[#c8ff3d] transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(job.progress, cloning ? 4 : 0)}%` }}
        />
      </div>
      {showDashboardLink && cloning ? (
        <p className="text-[11px] text-white/40">
          You can keep launching —{' '}
          <Link to="/launch?dashboard=1" className="font-semibold text-[#d5ff69] hover:underline">
            open dashboard
          </Link>{' '}
          anytime; progress continues there.
        </p>
      ) : null}
    </div>
  );
}
