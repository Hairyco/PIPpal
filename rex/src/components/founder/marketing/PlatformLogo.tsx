import { adPlatformCategories, getAdPlatform, type AdPlatformCategory } from '../../../data/adPlatforms';

export function PlatformLogo({
  platformId,
  size = 'md',
}: {
  platformId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const platform = getAdPlatform(platformId);
  if (!platform) return null;

  const sizeClass =
    size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]`}
      title={platform.name}
    >
      <img
        src={platform.logo}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function PlatformCategoryBadge({ category }: { category: AdPlatformCategory }) {
  const meta = adPlatformCategories[category];
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {meta.label}
    </span>
  );
}

export function ApprovalStatusBadge({
  status,
}: {
  status: 'recommended' | 'pending-pm' | 'approved' | 'active' | 'completed';
}) {
  const styles: Record<string, string> = {
    recommended: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    'pending-pm': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    active: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    completed: 'border-white/15 bg-white/5 text-muted-foreground',
  };

  const labels: Record<string, string> = {
    recommended: 'Recommended',
    'pending-pm': 'PM review',
    approved: 'Approved',
    active: 'Active',
    completed: 'Done',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function CampaignStatusDot({
  status,
}: {
  status: 'upcoming' | 'queued' | 'active' | 'completed';
}) {
  const colors = {
    upcoming: 'bg-white/25',
    queued: 'bg-amber-400',
    active: 'bg-sky-400 animate-pulse',
    completed: 'bg-emerald-400',
  };

  return <span className={`inline-block h-2 w-2 rounded-full ${colors[status]}`} />;
}
