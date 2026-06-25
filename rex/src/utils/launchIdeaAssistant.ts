import { getCategoryContent } from '../data/categoryContent';
import type { ProjectIdea } from '../data/categoryContent';

export type InspireIdeaResult = {
  type: 'idea';
  title: string;
  description: string;
  estimatedRaise: string;
  buildTime: string;
};

export type InspireFeedbackResult = {
  type: 'feedback';
  summary: string;
  suggestions: string[];
};

export type InspireResult = InspireIdeaResult | InspireFeedbackResult;

export type InspireInterest = {
  id: string;
  label: string;
  categoryId?: string;
};

export const INSPIRE_INTERESTS: InspireInterest[] = [
  { id: 'meme', label: 'Meme coins', categoryId: 'meme-coins' },
  { id: 'ai', label: 'AI & tech', categoryId: 'ai-tech' },
  { id: 'sports', label: 'Sports', categoryId: 'sport' },
  { id: 'fitness', label: 'Fitness', categoryId: 'apps' },
  { id: 'gaming', label: 'Gaming', categoryId: 'gaming' },
  { id: 'music', label: 'Music', categoryId: 'music' },
  { id: 'defi', label: 'DeFi', categoryId: 'defi' },
  { id: 'celebrity', label: 'Celebrity', categoryId: 'celebrity-coins' },
  { id: 'creator', label: 'Creator economy', categoryId: 'media' },
  { id: 'apps', label: 'Mobile apps', categoryId: 'apps' },
];

const INTEREST_CATEGORY_HINTS: Record<string, string> = {
  basketball: 'sport',
  football: 'sport',
  soccer: 'sport',
  fitness: 'apps',
  gym: 'apps',
  workout: 'apps',
  crypto: 'defi',
  trading: 'defi',
  meme: 'meme-coins',
  ai: 'ai-tech',
  game: 'gaming',
  stream: 'media',
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function pickFromCategory(categoryId: string): ProjectIdea {
  const ideas = getCategoryContent(categoryId).ideas;
  return ideas[Math.floor(Math.random() * ideas.length)];
}

function resolveCategoryId(interest: string, fallbackCategoryId?: string): string | undefined {
  const lower = interest.toLowerCase().trim();
  const pill = INSPIRE_INTERESTS.find(
    (p) => p.id === lower || p.label.toLowerCase() === lower,
  );
  if (pill?.categoryId) return pill.categoryId;
  if (fallbackCategoryId) return fallbackCategoryId;

  for (const [hint, categoryId] of Object.entries(INTEREST_CATEGORY_HINTS)) {
    if (lower.includes(hint)) return categoryId;
  }

  return undefined;
}

function tailorIdea(idea: ProjectIdea, interest: string): InspireIdeaResult {
  const topic = capitalize(interest.trim());
  return {
    type: 'idea',
    title: `${topic} — ${idea.title}`,
    description: idea.description.replace(/\.$/, '') + ` Tailored for ${topic.toLowerCase()} fans and communities.`,
    estimatedRaise: idea.estimatedRaise,
    buildTime: idea.buildTime,
  };
}

function generateCustomIdea(interest: string): InspireIdeaResult {
  const topic = capitalize(interest.trim());
  return {
    type: 'idea',
    title: `${topic} community launch`,
    description: `Build a ${topic.toLowerCase()}-themed project on Rex — community token or app with trade-tax marketing, milestone escrow, and vetted vendor delivery.`,
    estimatedRaise: '$50K–$300K',
    buildTime: '2–4 weeks',
  };
}

export function inspireFromInterest(input: {
  interest: string;
  categoryId?: string;
}): InspireIdeaResult {
  const interest = input.interest.trim();
  if (!interest) {
    const fallback = pickFromCategory(input.categoryId || 'apps');
    return { type: 'idea', ...fallback };
  }

  const categoryId = resolveCategoryId(interest, input.categoryId);
  const isPillMatch = INSPIRE_INTERESTS.some(
    (p) => p.id === interest.toLowerCase() || p.label.toLowerCase() === interest.toLowerCase(),
  );

  if (categoryId) {
    const ideas = getCategoryContent(categoryId).ideas;
    const keyword = interest.toLowerCase();
    const matched = ideas.find(
      (idea) =>
        idea.title.toLowerCase().includes(keyword) ||
        idea.description.toLowerCase().includes(keyword),
    );

    if (matched) return { type: 'idea', ...matched };
    if (isPillMatch) return { type: 'idea', ...pickFromCategory(categoryId) };
    return tailorIdea(pickFromCategory(categoryId), interest);
  }

  return generateCustomIdea(interest);
}

/** Legacy feedback path when refining an existing description */
export function inspireUser(input: {
  categoryId: string;
  description: string;
  projectName: string;
}): InspireResult {
  const desc = input.description.trim();

  if (desc.length < 40) {
    const idea = pickFromCategory(input.categoryId || 'apps');
    return { type: 'idea', ...idea };
  }

  const suggestions: string[] = [];
  const lower = desc.toLowerCase();

  if (!/\b(for|who|users|customers|holders|fans|traders)\b/.test(lower)) {
    suggestions.push('Name your audience — who is this for and why will they care?');
  }
  if (desc.length < 120) {
    suggestions.push('Add one sentence on the problem you solve and what makes it different.');
  }
  if (!/\b(token|app|platform|coin|product|service|marketplace)\b/.test(lower)) {
    suggestions.push('Clarify what you are launching — app, token, platform, or service.');
  }
  if (!input.categoryId) {
    suggestions.push('Select a category so Rex can match the right roadmap and vendors.');
  }
  if (!input.projectName.trim()) {
    suggestions.push('Add a project name — it becomes your token symbol and page title.');
  }
  if (suggestions.length === 0) {
    suggestions.push(
      'Strong start. On the next step Rex will propose milestones tied to your deliverables.',
    );
  }

  const summary =
    desc.length >= 120 && input.categoryId
      ? 'Your idea has enough detail for a tailored roadmap. Tweak anything below, or continue.'
      : 'Good direction — a few tweaks will help Rex recommend the right milestones.';

  return { type: 'feedback', summary, suggestions };
}
