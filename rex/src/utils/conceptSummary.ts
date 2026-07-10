import type { DeliverableId } from '../data/devStudios';
import { industries } from '../data/industries';
import { inspireUser } from './launchIdeaAssistant';
import type { ProjectOrigin } from './projectOrigin';

export type RexConceptSummary = {
  headline: string;
  summary: string;
  audience: string;
  growthPlan: string;
  inferredDeliverables: DeliverableId[];
  highlights: string[];
};

const CATEGORY_DELIVERABLES: Partial<Record<string, DeliverableId[]>> = {
  'meme-coins': ['marketing', 'smart-contract', 'website', 'design'],
  'celebrity-coins': ['marketing', 'smart-contract', 'website', 'design'],
  defi: ['marketing', 'smart-contract', 'website', 'dashboard'],
  apps: ['marketing', 'smart-contract', 'website', 'mobile-app', 'design'],
  gaming: ['marketing', 'smart-contract', 'website', 'mobile-app', 'design'],
  'ai-tech': ['marketing', 'smart-contract', 'website', 'api', 'design'],
};

const DEFAULT_DELIVERABLES: DeliverableId[] = [
  'marketing',
  'smart-contract',
  'website',
  'design',
];

const EXISTING_DELIVERABLES: DeliverableId[] = ['marketing', 'website', 'design'];

function inferDeliverables(categoryId: string, origin: ProjectOrigin): DeliverableId[] {
  if (origin === 'existing') return EXISTING_DELIVERABLES;
  return CATEGORY_DELIVERABLES[categoryId] ?? DEFAULT_DELIVERABLES;
}

function inferAudience(description: string, categoryName: string): string {
  const lower = description.toLowerCase();
  if (/\b(traders?|holders?|investors?|degens?)\b/.test(lower)) {
    return 'Crypto-native traders and early holders looking for the next community token.';
  }
  if (/\b(fans?|community|creators?)\b/.test(lower)) {
    return 'Fans and community members who want to participate in growth and rewards.';
  }
  if (/\b(users?|customers?|teams?|businesses?)\b/.test(lower)) {
    return 'Product users and customers who benefit from holding and engaging with the token.';
  }
  return `${categoryName} enthusiasts and early adopters on Rex.`;
}

function inferGrowthPlan(
  name: string,
  origin: ProjectOrigin,
  categoryName: string,
): string {
  if (origin === 'existing') {
    return `Rex routes trade tax into your marketing wallet to grow ${name}'s holder base, then scales campaigns across Telegram, charting, and paid channels as volume builds.`;
  }
  return `Launch ${name} on the bonding curve, fill the marketing wallet from trade tax, and run a ${categoryName.toLowerCase()}-focused growth sequence — community first, then listings and scale.`;
}

export function buildConceptSummary(input: {
  projectName: string;
  categoryId: string;
  description: string;
  projectOrigin: ProjectOrigin;
}): RexConceptSummary {
  const name = input.projectName.trim() || 'Your project';
  const categoryName =
    industries.find((i) => i.id === input.categoryId)?.name ?? 'your category';
  const inferredDeliverables = inferDeliverables(input.categoryId, input.projectOrigin);

  const inspire = inspireUser({
    categoryId: input.categoryId,
    description: input.description,
    projectName: input.projectName,
  });

  const summary =
    inspire.type === 'feedback'
      ? inspire.summary
      : `${name} is a ${categoryName.toLowerCase()} launch on Rex — community token, trade-tax marketing, and milestone-gated delivery.`;

  const highlights =
    inspire.type === 'feedback'
      ? inspire.suggestions.slice(0, 4)
      : [
          `Token page and bonding curve for ${name}`,
          'Marketing wallet funded by buy/sell tax on trades',
          'Creative suite for landing page and launch banners',
          'Optional exit marketplace when founder allocation vests',
        ];

  return {
    headline: `${name} on Rex`,
    summary,
    audience: inferAudience(input.description, categoryName),
    growthPlan: inferGrowthPlan(name, input.projectOrigin, categoryName),
    inferredDeliverables,
    highlights,
  };
}
