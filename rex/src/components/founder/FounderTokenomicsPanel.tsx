import { useState } from 'react';
import { BadgeCheck, ChevronDown, Lock, PieChart, Plus, Trash2, Users } from 'lucide-react';
import {
  createShareGrant,
  EXIT_MARKETPLACE_FEE_PERCENT,
  FOUNDER_ALLOCATION_PERCENT,
  getVestingProgress,
  getVestingSchedule,
  sharePoolRemaining,
  SHARE_POOL_PERCENT,
  tokenSupplySlices,
  type ShareGrant,
} from '../../data/founderTokenomics';
import type { RoadmapHorizonId } from '../../data/roadmapHorizons';

export function FounderTokenomicsPanel({
  horizon,
  shareGrants,
  onShareGrantsChange,
  editable = false,
  compact = false,
  defaultExpanded = true,
}: {
  horizon: RoadmapHorizonId;
  shareGrants: ShareGrant[];
  onShareGrantsChange?: (grants: ShareGrant[]) => void;
  editable?: boolean;
  compact?: boolean;
  /** Collapse heavy sections on the roadmap step (mobile-friendly). */
  defaultExpanded?: boolean;
}) {
  const vesting = getVestingSchedule(horizon);
  const poolRemaining = sharePoolRemaining(shareGrants);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [grantName, setGrantName] = useState('');
  const [grantRole, setGrantRole] = useState('');
  const [grantPercent, setGrantPercent] = useState('1');

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-sky-500/30"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Founder allocation &amp; share pool</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {FOUNDER_ALLOCATION_PERCENT}% founder · {SHARE_POOL_PERCENT}% share pool · KYC + vesting
          </p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  const addGrant = () => {
    if (!onShareGrantsChange) return;
    const percent = Number(grantPercent);
    if (!grantName.trim() || !grantRole.trim() || !Number.isFinite(percent) || percent <= 0) return;
    if (percent > poolRemaining) return;
    onShareGrantsChange([...shareGrants, createShareGrant(grantName, grantRole, percent)]);
    setGrantName('');
    setGrantRole('');
    setGrantPercent('1');
  };

  const removeGrant = (id: string) => {
    onShareGrantsChange?.(shareGrants.filter((g) => g.id !== id));
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 shrink-0 text-sky-400" />
            <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
              Founder allocation &amp; tokenomics
            </p>
          </div>
          {!compact && (
            <p className="mt-1 text-sm text-muted-foreground">
              Supply split is published at launch. Your {FOUNDER_ALLOCATION_PERCENT}% founder tranche
              unlocks only after KYC and the vesting schedule below.
            </p>
          )}
        </div>
        {!defaultExpanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Collapse
          </button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {tokenSupplySlices.map((slice) => (
          <div
            key={slice.id}
            className={`rounded-xl border p-3 ${
              slice.id === 'founder'
                ? 'border-sky-500/30 bg-sky-500/5'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <p className="text-lg font-bold text-white">{slice.percent}%</p>
            <p className="mt-0.5 text-sm font-medium text-white">{slice.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{slice.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          <div>
            <p className="text-sm font-medium text-white">
              Founder tranche — {FOUNDER_ALLOCATION_PERCENT}% · KYC + vesting required
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Tokens are allocated at launch but stay locked until you complete KYC. After verification,{' '}
              {vesting.label.toLowerCase()}. No personal funds required — this is your earned stake in
              the project.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-sky-400" />
          <p className="text-sm font-medium text-white">
            Share pool — {SHARE_POOL_PERCENT}% for co-founders &amp; advisors
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Offer allocations from the pool. Recipients complete KYC and follow the same vesting rules
          before tokens unlock.
        </p>

        {shareGrants.length > 0 && (
          <ul className="mt-3 space-y-2">
            {shareGrants.map((grant) => (
              <li
                key={grant.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{grant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {grant.role} · {grant.percent}% of supply
                  </p>
                </div>
                {editable && (
                  <button
                    type="button"
                    onClick={() => removeGrant(grant.id)}
                    className="text-muted-foreground hover:text-rose-400"
                    aria-label={`Remove ${grant.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {poolRemaining.toFixed(1)}% remaining in pool
          {shareGrants.length > 0 && ` · ${shareGrants.reduce((s, g) => s + g.percent, 0).toFixed(1)}% allocated`}
        </p>

        {editable && poolRemaining > 0 && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Name"
              value={grantName}
              onChange={(e) => setGrantName(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Role (e.g. CTO, advisor)"
              value={grantRole}
              onChange={(e) => setGrantRole(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={0.1}
                max={poolRemaining}
                step={0.1}
                value={grantPercent}
                onChange={(e) => setGrantPercent(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-foreground focus:border-sky-500/40 focus:outline-none"
                aria-label="Percent of supply"
              />
              <button
                type="button"
                onClick={addGrant}
                disabled={!grantName.trim() || !grantRole.trim() || Number(grantPercent) <= 0}
                className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:border-sky-500/30 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-medium text-white">Exit marketplace (T&amp;Cs)</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          When your founder allocation is vested, you may list the project on Rex&apos;s exit
          marketplace. Buyers acquire the product, listing, and agreed token bundle. Your vested
          stake transfers or is bought out as part of the deal. Rex charges{' '}
          {EXIT_MARKETPLACE_FEE_PERCENT}% on qualified exit transactions. Sale is optional — keep
          building if you prefer.
        </p>
      </div>
    </div>
  );
}

export function FounderVestingStatus({
  horizon,
  launchedAt,
  kycCompleted,
}: {
  horizon: RoadmapHorizonId;
  launchedAt: string;
  kycCompleted: boolean;
}) {
  const progress = getVestingProgress(launchedAt, horizon, kycCompleted);
  const schedule = getVestingSchedule(horizon);
  const barPercent =
    progress.status === 'locked-kyc' || progress.status === 'cliff'
      ? 0
      : Math.min(100, (progress.founderUnlockedPercent / FOUNDER_ALLOCATION_PERCENT) * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Founder vesting</p>
          <p className="mt-1 text-xs text-muted-foreground">{progress.statusLabel}</p>
        </div>
        {kycCompleted ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <BadgeCheck className="h-3 w-3" />
            KYC complete
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200">
            <Lock className="h-3 w-3" />
            KYC required
          </span>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
          style={{ width: `${barPercent}%` }}
        />
      </div>
      <div className="mt-2 flex flex-col gap-0.5 text-[10px] text-muted-foreground sm:flex-row sm:justify-between">
        <span>0%</span>
        <span className="break-words sm:text-center">
          {progress.founderUnlockedPercent}% / {FOUNDER_ALLOCATION_PERCENT}% unlocked
        </span>
        <span className="sm:text-right">{FOUNDER_ALLOCATION_PERCENT}%</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{schedule.label}</p>
      <p className="mt-1 text-xs text-sky-300/80">{progress.nextUnlockLabel}</p>
    </div>
  );
}
