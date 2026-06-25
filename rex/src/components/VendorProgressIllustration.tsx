import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { VENDOR_ACTIVITY, VENDOR_DELIVERABLES, type VendorDeliverable } from '../data/vendorProgress';

function statusStyles(status: VendorDeliverable['status']) {
  if (status === 'complete') {
    return {
      bar: 'bg-emerald-400',
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      label: 'Complete',
    };
  }
  if (status === 'in-progress') {
    return {
      bar: 'bg-sky-400',
      badge: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
      label: 'In progress',
    };
  }
  return {
    bar: 'bg-white/25',
    badge: 'border-white/15 bg-white/5 text-muted-foreground',
    label: 'Queued',
  };
}

function DeliverableRow({ item }: { item: VendorDeliverable }) {
  const styles = statusStyles(item.status);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{item.label}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{item.vendor}</p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
          >
            {styles.label}
          </span>
          <p className="mt-1 text-[10px] text-muted-foreground">{item.eta}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${styles.bar}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-white/90">
          {item.progress}%
        </span>
      </div>
    </div>
  );
}

export function VendorProgressIllustration() {
  const overall =
    Math.round(
      VENDOR_DELIVERABLES.reduce((sum, d) => sum + d.progress, 0) / VENDOR_DELIVERABLES.length,
    );

  return (
    <div className="dex-card overflow-hidden">
      <div className="relative z-[1]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
              Build tracker
            </p>
            <p className="mt-0.5 text-sm font-medium text-white">
              Track vendor delivery in real time
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-emerald-300">Live updates</span>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-white/[0.08] bg-[#060a12]/80 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Overall build progress
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{overall}%</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[10px] text-emerald-200">
              <CheckCircle2 className="h-3 w-3" />1 shipped
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/20 bg-sky-500/5 px-2 py-1 text-[10px] text-sky-200">
              <Clock className="h-3 w-3" />2 in build
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">
              <Circle className="h-3 w-3" />1 queued
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {VENDOR_DELIVERABLES.map((item) => (
            <DeliverableRow key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent activity
          </p>
          <ul className="space-y-1.5">
            {VENDOR_ACTIVITY.map((entry) => (
              <li
                key={entry.id}
                className="flex gap-2 text-[11px] leading-relaxed text-foreground/75"
              >
                <span className="shrink-0 tabular-nums text-muted-foreground">{entry.time}</span>
                <span>{entry.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
