import { projectDeliverables, type DeliverableId } from '../data/devStudios';
import {
  EXIT_MARKETPLACE_FEE_PERCENT,
  FOUNDER_ALLOCATION_PERCENT,
} from '../data/founderTokenomics';
import { getRoadmapHorizon, type RoadmapHorizonId } from '../data/roadmapHorizons';
import { industries } from '../data/industries';

export interface RecommendedMilestone {
  step: number;
  title: string;
  description: string;
  unlock: string;
}

function baseMilestones(
  name: string,
  categoryName: string,
  horizon: RoadmapHorizonId,
): RecommendedMilestone[] {
  if (horizon === '2-3-years') {
    return [
      {
        step: 1,
        title: 'Launch & liquidity',
        description: `${name} goes live on Rex with marketing and roadmap wallets created automatically.`,
        unlock: 'Year 1 · Day 0',
      },
      {
        step: 2,
        title: 'Marketing wallet fills',
        description:
          'Buy/sell tax (2–10%) flows into your marketing wallet. Rex runs sustained community and listing growth.',
        unlock: 'Year 1',
      },
      {
        step: 3,
        title: 'Growth & holder base',
        description: `Long-horizon marketing and community programmes for ${categoryName} projects as volume builds.`,
        unlock: 'Year 1–2',
      },
      {
        step: 4,
        title: 'Roadmap wallet unlock',
        description: 'Trading volume unlocks the build budget. Rex holds funds in milestone escrow.',
        unlock: 'Year 1–2 · ~$50K MCAP',
      },
    ];
  }

  return [
    {
      step: 1,
      title: 'Launch & liquidity',
      description: `${name} goes live on Rex with marketing and roadmap wallets created automatically.`,
      unlock: 'Day 0 · $1 launch',
    },
    {
      step: 2,
      title: 'Marketing wallet fills',
      description:
        'Buy/sell tax (2–10%) flows into your marketing wallet. Rex runs Telegram, DexScreener, and trending placements.',
      unlock: 'Month 1–2',
    },
    {
      step: 3,
      title: 'First growth push',
      description: `Automated ads and community pushes for ${categoryName} projects at the first milestone threshold.`,
      unlock: 'Month 2–3',
    },
    {
      step: 4,
      title: 'Roadmap wallet unlock',
      description: 'Trading volume unlocks the build budget. Rex holds funds in milestone escrow.',
      unlock: 'Month 3–4 · ~$50K MCAP',
    },
  ];
}

function buildUnlockLabel(
  horizon: RoadmapHorizonId,
  buildIndex: number,
  buildCount: number,
): string {
  if (horizon === '2-3-years') {
    if (buildCount <= 1) return 'Year 2';
    const startYear = 2;
    const endYear = buildCount > 2 ? 3 : 2;
    const phase = buildIndex + 1;
    return phase === buildCount ? `Year ${endYear}` : `Year ${startYear}–${endYear} · Phase ${phase}`;
  }

  const startMonth = 4 + buildIndex * 2;
  const endMonth = Math.min(startMonth + 2, 10);
  return `Month ${startMonth}–${endMonth}`;
}

export function buildRecommendedRoadmap(input: {
  categoryId: string;
  projectName: string;
  deliverables: DeliverableId[];
  horizon?: RoadmapHorizonId;
}): RecommendedMilestone[] {
  const horizon = input.horizon ?? '12-months';
  const horizonMeta = getRoadmapHorizon(horizon);
  const categoryName = industries.find((i) => i.id === input.categoryId)?.name ?? 'your category';
  const name = input.projectName.trim() || 'Your project';

  const milestones = baseMilestones(name, categoryName, horizon);

  milestones.splice(1, 0, {
    step: 0,
    title: 'Founder KYC & vesting clock',
    description: `Complete KYC to start vesting on your ${FOUNDER_ALLOCATION_PERCENT}% founder allocation. Share-pool grants follow the same rules. Tokens stay locked through the cliff period, then unlock linearly.`,
    unlock: 'Anytime post-launch',
  });
  milestones.forEach((m, i) => {
    m.step = i + 1;
  });

  const validDeliverables = input.deliverables
    .map((id) => projectDeliverables.find((d) => d.id === id))
    .filter(Boolean);

  validDeliverables.forEach((deliverable, index) => {
    if (!deliverable) return;
    milestones.push({
      step: milestones.length + 1,
      title: `Build: ${deliverable.label}`,
      description: `Vetted vendor delivers ${deliverable.description.toLowerCase()}. Paid from roadmap wallet on completion.`,
      unlock: buildUnlockLabel(horizon, index, validDeliverables.length),
    });
  });

  milestones.push({
    step: milestones.length + 1,
    title: 'MVP release to holders',
    description: 'Token-gated beta or public launch — marketing wallet keeps funding growth.',
    unlock: horizon === '2-3-years' ? 'Year 2' : 'Month 9–10',
  });

  milestones.push({
    step: milestones.length + 1,
    title: 'Exit — optional marketplace sale',
    description: `List ${name} on Rex's exit marketplace when your founder allocation (${FOUNDER_ALLOCATION_PERCENT}%) has vested. Buyers acquire the product and listing; your vested stake transfers as part of the deal. Rex charges ${EXIT_MARKETPLACE_FEE_PERCENT}% on qualified exit transactions under T&Cs.`,
    unlock: `${horizonMeta.exitWindow} · optional`,
  });

  return milestones;
}
