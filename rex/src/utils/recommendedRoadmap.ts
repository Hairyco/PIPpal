import { projectDeliverables, type DeliverableId } from '../data/devStudios';
import { industries } from '../data/industries';

export interface RecommendedMilestone {
  step: number;
  title: string;
  description: string;
  unlock: string;
}

export function buildRecommendedRoadmap(input: {
  categoryId: string;
  projectName: string;
  deliverables: DeliverableId[];
}): RecommendedMilestone[] {
  const categoryName = industries.find((i) => i.id === input.categoryId)?.name ?? 'your category';
  const name = input.projectName.trim() || 'Your project';

  const milestones: RecommendedMilestone[] = [
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
      unlock: '~$12K wallet',
    },
    {
      step: 3,
      title: 'First growth push',
      description: `Automated ads and community pushes for ${categoryName} projects at the first milestone threshold.`,
      unlock: '~$25K wallet',
    },
    {
      step: 4,
      title: 'Roadmap wallet unlock',
      description: 'Trading volume unlocks the build budget. Rex holds funds in milestone escrow.',
      unlock: '~$50K MCAP',
    },
  ];

  input.deliverables.forEach((id, index) => {
    const deliverable = projectDeliverables.find((d) => d.id === id);
    if (!deliverable) return;
    milestones.push({
      step: milestones.length + 1,
      title: `Build: ${deliverable.label}`,
      description: `Vetted vendor delivers ${deliverable.description.toLowerCase()}. Paid from roadmap wallet on completion.`,
      unlock: `Milestone ${index + 1}`,
    });
  });

  milestones.push({
    step: milestones.length + 1,
    title: 'MVP release to holders',
    description: 'Token-gated beta or public launch — marketing wallet keeps funding growth.',
    unlock: 'Final milestone',
  });

  return milestones;
}
