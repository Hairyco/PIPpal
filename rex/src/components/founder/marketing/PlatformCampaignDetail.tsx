import { ArrowLeft, Calendar, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import {
  adPlatforms,
  formatAdCost,
  getAdPlatform,
  getAdPlatformOption,
  type AdPlatformOption,
} from '../../../data/adPlatforms';
import type { MarketingTimelinePhase } from '../../../utils/buildMarketingRoadmap';
import { getPlatformCampaignActivities } from '../../../utils/buildMarketingRoadmap';
import {
  ApprovalStatusBadge,
  CampaignStatusDot,
  PlatformCategoryBadge,
  PlatformLogo,
} from './PlatformLogo';

interface PlatformCampaignDetailProps {
  platformId: string;
  phases: MarketingTimelinePhase[];
  kycCompleted: boolean;
  selectedOptionId?: string;
  onSelectOption?: (optionId: string) => void;
  onBack: () => void;
}

export function PlatformCampaignDetail({
  platformId,
  phases,
  kycCompleted,
  selectedOptionId,
  onSelectOption,
  onBack,
}: PlatformCampaignDetailProps) {
  const platform = getAdPlatform(platformId);
  if (!platform) return null;

  const activities = getPlatformCampaignActivities(platformId, phases);
  const defaultOptionId = activities[0]?.optionId ?? platform.options[0]?.id;
  const activeOptionId = selectedOptionId ?? defaultOptionId;
  const activeOption = getAdPlatformOption(platformId, activeOptionId);

  return (
    <div className="min-w-0 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to timeline
      </button>

      <div className="flex items-start gap-4">
        <PlatformLogo platformId={platformId} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl text-white">{platform.name}</h2>
            <PlatformCategoryBadge category={platform.category} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{platform.tagline}</p>
        </div>
      </div>

      {/* Option selector */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Campaign package
          </p>
          {!kycCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-300">
              <Lock className="h-3 w-3" />
              Rex picks default until KYC
            </span>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {platform.options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selected={activeOptionId === option.id}
              disabled={!kycCompleted && !!option.kycRequired && activeOptionId !== option.id}
              onSelect={() => onSelectOption?.(option.id)}
            />
          ))}
        </div>
      </div>

      {/* Active campaign timeline */}
      {activeOption && (
        <div className="rounded-xl border border-white/10 bg-[#060a12]/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
            Active campaign plan
          </p>
          <h3 className="mt-2 font-semibold text-white">{activeOption.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{activeOption.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Budget</p>
              <p className="mt-0.5 font-semibold text-white">
                {formatAdCost(activeOption.costFrom)}
                {activeOption.costTo ? ` – ${formatAdCost(activeOption.costTo)}` : ''}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
              <p className="mt-0.5 font-semibold text-white">{activeOption.duration}</p>
            </div>
          </div>

          {activities.length > 0 && (
            <ol className="relative mt-6 space-y-0 border-l border-white/10 pl-5">
              {activities.map((activity, index) => (
                <li key={activity.id} className={`relative ${index < activities.length - 1 ? 'pb-6' : ''}`}>
                  <span className="absolute -left-[1.375rem] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-[#060a12] bg-[#060a12]">
                    <CampaignStatusDot status={activity.status} />
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{activity.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {activity.timingLabel}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-sky-400">
                      {formatAdCost(activity.costFrom)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Other platforms in same category */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Other {adPlatformCategories[platform.category].label.toLowerCase()} options
        </p>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
          {adPlatforms
            .filter((p) => p.category === platform.category && p.id !== platformId)
            .slice(0, 6)
            .map((p) => (
              <div
                key={p.id}
                className="flex w-[140px] shrink-0 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center"
              >
                <PlatformLogo platformId={p.id} size="md" />
                <p className="text-xs font-medium text-white">{p.name}</p>
                <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                  {p.tagline}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: AdPlatformOption;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
        selected
          ? 'border-sky-500/40 bg-sky-500/10'
          : disabled
            ? 'cursor-not-allowed border-white/5 bg-white/[0.01] opacity-50'
            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{option.name}</p>
          {option.kycRequired && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-300">
              <ShieldCheck className="h-3 w-3" />
              KYC
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
        <p className="mt-1.5 text-xs font-medium text-sky-400">
          {formatAdCost(option.costFrom)}
          {option.costTo ? ` – ${formatAdCost(option.costTo)}` : ''} · {option.duration}
        </p>
      </div>
      {selected && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-sky-400" />}
    </button>
  );
}
