import type { DeliverableId } from '../data/devStudios';
import type { RoadmapHorizonId } from '../data/roadmapHorizons';
import type { ApprovalStatus } from '../data/adPlatforms';
import { getAdPlatform, getAdPlatformOption } from '../data/adPlatforms';
import { projectDeliverables } from '../data/devStudios';

export type CampaignActivityStatus = 'upcoming' | 'queued' | 'active' | 'completed';

export interface MarketingPhasePlatform {
  platformId: string;
  optionId: string;
  status: CampaignActivityStatus;
}

export interface MarketingTimelinePhase {
  id: string;
  step: number;
  title: string;
  timing: string;
  offsetDays: number;
  description: string;
  phaseType: 'launch' | 'community' | 'charting' | 'growth' | 'scale' | 'build' | 'product' | 'approval';
  approvalStatus: ApprovalStatus;
  walletThreshold?: number;
  platforms: MarketingPhasePlatform[];
  requiresPmApproval?: boolean;
}

export interface MarketingCampaignActivity {
  id: string;
  platformId: string;
  optionId: string;
  phaseId: string;
  dayOffset: number;
  timingLabel: string;
  status: CampaignActivityStatus;
  title: string;
  description: string;
  costFrom: number;
  duration: string;
}

export type MarketingTimelineOverrides = Record<
  string,
  { offsetDays?: number; selectedOptions?: Record<string, string> }
>;

interface BuildInput {
  projectName: string;
  categoryId: string;
  deliverables: DeliverableId[];
  horizon: RoadmapHorizonId;
  overrides?: MarketingTimelineOverrides;
}

function platformEntry(
  platformId: string,
  optionId: string,
  status: CampaignActivityStatus = 'upcoming',
): MarketingPhasePlatform {
  return { platformId, optionId, status };
}

function applyOverride(
  phase: MarketingTimelinePhase,
  overrides?: MarketingTimelineOverrides,
): MarketingTimelinePhase {
  const o = overrides?.[phase.id];
  if (!o) return phase;

  const offsetDays = o.offsetDays ?? phase.offsetDays;
  const timing = formatTimingFromOffset(offsetDays, phase.phaseType);

  const platforms = phase.platforms.map((p) => ({
    ...p,
    optionId: o.selectedOptions?.[p.platformId] ?? p.optionId,
  }));

  return { ...phase, offsetDays, timing, platforms };
}

function formatTimingFromOffset(days: number, phaseType: MarketingTimelinePhase['phaseType']): string {
  if (days === 0) return 'Day 0 · Launch';
  if (days <= 3 && phaseType === 'community') return `Day ${days}–${days + 2}`;
  if (days <= 14) return `Day ${days} · Week ${Math.ceil(days / 7)}`;
  if (days <= 60) return `Week ${Math.ceil(days / 7)}–${Math.ceil((days + 14) / 7)}`;
  const months = Math.ceil(days / 30);
  return `Month ${months}${months > 1 ? `–${months + 1}` : ''}`;
}

export function buildMarketingTimeline(input: BuildInput): MarketingTimelinePhase[] {
  const name = input.projectName.trim() || 'Your project';
  const isLong = input.horizon === '2-3-years';
  const hasPhysical = input.deliverables.includes('physical-product');

  const phases: MarketingTimelinePhase[] = [
    {
      id: 'launch',
      step: 1,
      title: 'Bonding curve goes live',
      timing: 'Day 0 · Launch',
      offsetDays: 0,
      description: `${name} launches on the Rex bonding curve. Marketing and roadmap wallets are created automatically.`,
      phaseType: 'launch',
      approvalStatus: 'completed',
      platforms: [],
    },
    {
      id: 'telegram-early',
      step: 2,
      title: 'Telegram call-outs & community',
      timing: 'Day 1–3',
      offsetDays: 1,
      description:
        'First momentum — paid caller groups, pinned shills, and Telegram channel ads while the wallet fills from trade tax.',
      phaseType: 'community',
      approvalStatus: 'recommended',
      walletThreshold: 150,
      platforms: [
        platformEntry('telegram-calls', 'tg-call-pinned'),
        platformEntry('telegram-calls', 'tg-call-basic'),
        platformEntry('telegram-ads', 'tg-ad-text'),
        platformEntry('whiz', 'whiz-prelaunch'),
      ],
    },
    {
      id: 'charting-baseline',
      step: 3,
      title: 'Charting baseline',
      timing: isLong ? 'Week 2–3' : 'Week 1–2',
      offsetDays: isLong ? 14 : 7,
      description:
        'Enhanced token info and micro-cap voting placements — baseline prerequisites for serious launches.',
      phaseType: 'charting',
      approvalStatus: 'recommended',
      walletThreshold: 500,
      platforms: [
        platformEntry('dexscreener', 'ds-enhanced'),
        platformEntry('coinsniper', 'cs-featured'),
        platformEntry('thekollab', 'kollab-burst'),
      ],
    },
    {
      id: 'growth-push',
      step: 4,
      title: 'First growth push',
      timing: isLong ? 'Month 1–2' : 'Week 3–4',
      offsetDays: isLong ? 30 : 21,
      description:
        'Banner ads on DEX Screener plus programmatic display to widen reach beyond charting platforms.',
      phaseType: 'growth',
      approvalStatus: 'recommended',
      walletThreshold: 2500,
      platforms: [
        platformEntry('dexscreener', 'ds-banner'),
        platformEntry('bitmedia', 'bm-cpm'),
        platformEntry('cointraffic', 'ct-native'),
      ],
    },
    {
      id: 'scale-campaign',
      step: 5,
      title: 'Scale campaign',
      timing: isLong ? 'Month 2–4' : 'Month 2–3',
      offsetDays: isLong ? 60 : 45,
      description:
        'High-impact placements — Coinzilla display, DEXTools spotlight, and optional wallet-targeted ads.',
      phaseType: 'scale',
      approvalStatus: 'pending-pm',
      walletThreshold: 7500,
      platforms: [
        platformEntry('coinzilla', 'cz-display'),
        platformEntry('dextools', 'dx-spotlight'),
        platformEntry('blockchain-ads', 'ba-wallet'),
        platformEntry('surgence', 'sur-raid'),
      ],
    },
  ];

  if (hasPhysical) {
    phases.push({
      id: 'product-pm-review',
      step: phases.length + 1,
      title: 'Physical product — PM review',
      timing: isLong ? 'Month 3–4' : 'Month 3',
      offsetDays: isLong ? 90 : 75,
      description:
        'Physical product roadmap requires Rex project manager approval — sourcing, manufacturing timeline, and supplier vetting.',
      phaseType: 'approval',
      approvalStatus: 'pending-pm',
      requiresPmApproval: true,
      platforms: [],
    });
    phases.push({
      id: 'product-launch',
      step: phases.length + 2,
      title: 'Product launch marketing',
      timing: isLong ? 'Month 5–6' : 'Month 4–5',
      offsetDays: isLong ? 150 : 120,
      description:
        'Coordinated push across charting, direct media, and agencies once product samples are approved.',
      phaseType: 'product',
      approvalStatus: 'recommended',
      walletThreshold: 10000,
      requiresPmApproval: true,
      platforms: [
        platformEntry('coinmarketcap', 'cmc-search'),
        platformEntry('coingecko', 'cg-boost'),
        platformEntry('solscan', 'solscan-banner'),
      ],
    });
  }

  const buildDeliverables = input.deliverables.filter(
    (id) => id !== 'marketing' && id !== 'physical-product',
  );

  buildDeliverables.forEach((deliverableId, index) => {
    const deliverable = projectDeliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return;

    const baseOffset = isLong ? 120 + index * 90 : 90 + index * 45;
    phases.push({
      id: `build-${deliverableId}`,
      step: phases.length + 1,
      title: `Build: ${deliverable.label}`,
      timing: formatTimingFromOffset(baseOffset, 'build'),
      offsetDays: baseOffset,
      description: `${deliverable.description}. Funded from roadmap wallet on milestone completion.`,
      phaseType: 'build',
      approvalStatus: index === 0 ? 'pending-pm' : 'recommended',
      requiresPmApproval: true,
      platforms: [],
    });
  });

  return phases.map((p, i) => ({
    ...applyOverride({ ...p, step: i + 1 }, input.overrides),
    step: i + 1,
  }));
}

export function buildCampaignActivities(phases: MarketingTimelinePhase[]): MarketingCampaignActivity[] {
  const activities: MarketingCampaignActivity[] = [];

  for (const phase of phases) {
    phase.platforms.forEach((p, index) => {
      const platform = getAdPlatform(p.platformId);
      const option = getAdPlatformOption(p.platformId, p.optionId);
      if (!platform || !option) return;

      activities.push({
        id: `${phase.id}-${p.platformId}-${index}`,
        platformId: p.platformId,
        optionId: p.optionId,
        phaseId: phase.id,
        dayOffset: phase.offsetDays + index,
        timingLabel: phase.timing,
        status: p.status,
        title: option.name,
        description: option.description,
        costFrom: option.costFrom,
        duration: option.duration,
      });
    });
  }

  return activities.sort((a, b) => a.dayOffset - b.dayOffset);
}

export function getPlatformCampaignActivities(
  platformId: string,
  phases: MarketingTimelinePhase[],
): MarketingCampaignActivity[] {
  return buildCampaignActivities(phases).filter((a) => a.platformId === platformId);
}

export const TIMING_OFFSET_PRESETS = [
  { label: 'Day 1', days: 1 },
  { label: 'Day 3', days: 3 },
  { label: 'Week 1', days: 7 },
  { label: 'Week 2', days: 14 },
  { label: 'Week 3', days: 21 },
  { label: 'Month 1', days: 30 },
  { label: 'Month 2', days: 60 },
  { label: 'Month 3', days: 90 },
] as const;
