import { industries } from '../data/industries';
import type { ProjectOrigin } from './projectOrigin';

export type AnalysisPoint = {
  id: string;
  text: string;
};

export type AnalysisRecommendation = {
  id: string;
  title: string;
  detail: string;
  /** Applied to project description when approved */
  descriptionPatch?: string;
};

export type MarketAnalysis = {
  fitLabel: string;
  overview: string;
  strengths: AnalysisPoint[];
  weaknesses: AnalysisPoint[];
  recommendations: AnalysisRecommendation[];
};

export type AnalysisDocument = {
  id: string;
  name: string;
  excerpt: string;
  uploadedAt: string;
};

export type AnalysisChatMessage = {
  id: string;
  role: 'user' | 'rex';
  text: string;
};

const MAX_DOC_CHARS = 8000;

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

function hasKeyword(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

export function buildMarketAnalysis(input: {
  projectName: string;
  categoryId: string;
  description: string;
  projectOrigin: ProjectOrigin;
  existingProductUrl?: string;
  documents?: AnalysisDocument[];
}): MarketAnalysis {
  const name = input.projectName.trim() || 'Your project';
  const categoryName =
    industries.find((i) => i.id === input.categoryId)?.name ?? 'your category';
  const desc = input.description.trim();
  const lower = desc.toLowerCase();
  const isExisting = input.projectOrigin === 'existing';

  const strengths: AnalysisPoint[] = [];
  const weaknesses: AnalysisPoint[] = [];
  const recommendations: AnalysisRecommendation[] = [];

  if (desc.length >= 80) {
    strengths.push({
      id: nextId('s'),
      text: 'Clear product narrative — enough detail for Rex to shape positioning and roadmap milestones.',
    });
  } else {
    weaknesses.push({
      id: nextId('w'),
      text: 'Idea description is thin — harder to differentiate in a crowded launch calendar.',
    });
    recommendations.push({
      id: nextId('r'),
      title: 'Expand your pitch',
      detail: 'Add who you serve, the problem you solve, and why a token accelerates growth.',
      descriptionPatch: `${desc}${desc.endsWith('.') ? '' : '.'} Built for a defined audience with a clear reason to hold and engage.`,
    });
  }

  if (input.categoryId) {
    strengths.push({
      id: nextId('s'),
      text: `${categoryName} is an active category on Rex — proven demand for community tokens and vendor delivery.`,
    });
  } else {
    weaknesses.push({
      id: nextId('w'),
      text: 'No category selected — Rex cannot benchmark against comparable launches.',
    });
  }

  if (hasKeyword(lower, ['community', 'telegram', 'discord', 'holders', 'fans'])) {
    strengths.push({
      id: nextId('s'),
      text: 'Community-first positioning — aligns with Rex bonding-curve and trade-tax marketing model.',
    });
  } else {
    weaknesses.push({
      id: nextId('w'),
      text: 'Community angle is unclear — most successful Rex launches lead with holder benefits.',
    });
    recommendations.push({
      id: nextId('r'),
      title: 'Lead with community utility',
      detail: 'Explain what holders get early — access, rewards, governance, or exclusive content.',
      descriptionPatch: `${desc}${desc.endsWith('.') ? '' : '.'} Holders gain early access and shared upside as the community grows.`,
    });
  }

  if (isExisting && input.existingProductUrl?.trim()) {
    strengths.push({
      id: nextId('s'),
      text: 'Existing product URL gives Rex real assets for token page, landing page, and marketing creative.',
    });
  } else if (isExisting) {
    weaknesses.push({
      id: nextId('w'),
      text: 'Existing project path without a live link — harder to validate traction and brand fit.',
    });
  }

  if (hasKeyword(lower, ['token', 'utility', 'staking', 'rewards', 'app', 'platform'])) {
    strengths.push({
      id: nextId('s'),
      text: 'Concrete utility mentioned — supports credible tokenomics and post-launch retention.',
    });
  }

  if (hasKeyword(lower, ['meme', 'viral', 'trend']) && !hasKeyword(lower, ['roadmap', 'product', 'utility'])) {
    weaknesses.push({
      id: nextId('w'),
      text: 'Meme-forward positioning without product depth — higher fade risk after initial hype.',
    });
    recommendations.push({
      id: nextId('r'),
      title: 'Add a retention hook',
      detail: 'Pair viral energy with one tangible utility so marketing wallet spend converts to holders.',
    });
  }

  if ((input.documents?.length ?? 0) > 0) {
    strengths.push({
      id: nextId('s'),
      text: `Supporting documents uploaded (${input.documents!.length}) — Rex can align analysis with your materials.`,
    });
  }

  const docHints = input.documents?.flatMap((d) => extractDocSignals(d.excerpt)) ?? [];
  for (const hint of docHints.slice(0, 2)) {
    strengths.push({ id: nextId('s'), text: hint });
  }

  if (strengths.length < 2) {
    strengths.push({
      id: nextId('s'),
      text: `${name} can launch on Rex for $1 with marketing wallet and roadmap escrow built in.`,
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push({
      id: nextId('w'),
      text: 'Competition in this category is high — budget for sustained marketing after day one.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: nextId('r'),
      title: 'Prelaunch recommended',
      detail: 'Consider prelaunch to build Telegram before trading opens — especially if creative assets are still queued.',
    });
  }

  const fitScore = strengths.length - weaknesses.length;
  const fitLabel =
    fitScore >= 3 ? 'Strong market fit' : fitScore >= 1 ? 'Moderate market fit' : 'Needs refinement';

  const overview = isExisting
    ? `Rex analyzed ${name} as an existing ${categoryName.toLowerCase()} product entering crypto markets. ${fitLabel} — approve Rex's suggested tweaks or discuss below before your concept summary.`
    : `Rex analyzed ${name} in ${categoryName.toLowerCase()}. ${fitLabel} — review strengths and gaps, upload any pitch decks or notes, then approve changes to continue.`;

  return {
    fitLabel,
    overview,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    recommendations: recommendations.slice(0, 4),
  };
}

function extractDocSignals(excerpt: string): string[] {
  const signals: string[] = [];
  const lower = excerpt.toLowerCase();
  if (hasKeyword(lower, ['revenue', 'mrr', 'arr', 'users', 'customers'])) {
    signals.push('Documents reference traction metrics — strong signal for investor-facing token page copy.');
  }
  if (hasKeyword(lower, ['roadmap', 'milestone', 'phase', 'q1', 'q2'])) {
    signals.push('Roadmap material detected — Rex can mirror milestones in your marketing roadmap.');
  }
  if (hasKeyword(lower, ['competitor', 'market size', 'tam', 'sam'])) {
    signals.push('Market sizing or competitive context found — useful for positioning vs similar Rex launches.');
  }
  return signals;
}

export async function readProjectDoc(file: File): Promise<AnalysisDocument> {
  const textLike =
    file.type.startsWith('text/') ||
    /\.(txt|md|markdown|csv|json)$/i.test(file.name);

  let excerpt: string;
  if (textLike) {
    const raw = await file.text();
    excerpt = raw.slice(0, MAX_DOC_CHARS);
  } else {
    excerpt = `[${file.name} uploaded — ${(file.size / 1024).toFixed(0)} KB. Summarize key points in the conversation if Rex should use specific figures or claims.]`;
  }

  return {
    id: nextId('doc'),
    name: file.name,
    excerpt,
    uploadedAt: new Date().toISOString(),
  };
}

export function generateAnalysisChatReply(input: {
  message: string;
  projectName: string;
  categoryId: string;
  description: string;
  documents: AnalysisDocument[];
  analysis: MarketAnalysis;
}): { reply: string; analysisPatch?: Partial<MarketAnalysis> } {
  const msg = input.message.trim().toLowerCase();
  const categoryName =
    industries.find((i) => i.id === input.categoryId)?.name ?? 'your category';

  if (!msg) {
    return {
      reply: 'Ask Rex anything about positioning, competition, or launch timing — or upload a pitch deck for deeper analysis.',
    };
  }

  if (hasKeyword(msg, ['competitor', 'competition', 'similar', 'compare'])) {
    return {
      reply: `In ${categoryName}, comparable Rex launches succeed when they differentiate on utility and community cadence — not just ticker branding. I would lean into what ${input.projectName || 'your project'} does that others cannot copy in week one.`,
      analysisPatch: {
        weaknesses: [
          ...input.analysis.weaknesses,
          {
            id: nextId('w'),
            text: 'Competitive set is crowded — sharpen one unique hook in your description.',
          },
        ].slice(-5),
      },
    };
  }

  if (hasKeyword(msg, ['audience', 'who', 'target', 'customer', 'user'])) {
    return {
      reply: 'Your strongest audience story should name one primary persona and one reason they buy early. Rex will reflect that in your concept summary and roadmap copy once you approve the recommendations.',
      analysisPatch: {
        recommendations: [
          ...input.analysis.recommendations,
          {
            id: nextId('r'),
            title: 'Name your core persona',
            detail: 'Add one sentence: “Built for [specific audience] who need [outcome].”',
            descriptionPatch: `${input.description.trim()}${input.description.trim().endsWith('.') ? '' : '.'} Built for a specific early-adopter audience with a clear reason to join at launch.`,
          },
        ].slice(-4),
      },
    };
  }

  if (hasKeyword(msg, ['prelaunch', 'launch', 'timing', 'when'])) {
    return {
      reply: 'If creative assets or Telegram are still warming up, prelaunch in Launching Soon reduces day-one sell pressure. If your community is ready and description is tight, launch immediately to start filling the marketing wallet.',
    };
  }

  if (hasKeyword(msg, ['weak', 'weakness', 'risk', 'concern'])) {
    const top = input.analysis.weaknesses[0]?.text ?? 'Focus on clarifying audience and utility.';
    return {
      reply: `Top risk I see: ${top} Addressing that before roadmap generation will improve conversion from visitors to holders.`,
    };
  }

  if (hasKeyword(msg, ['doc', 'document', 'deck', 'pdf', 'upload', 'file'])) {
    if (input.documents.length === 0) {
      return {
        reply: 'Upload a .txt, .md, or .csv export of your deck (or paste a summary here). Rex will fold figures and roadmap language into your analysis.',
      };
    }
    return {
      reply: `I've reviewed ${input.documents.length} document${input.documents.length > 1 ? 's' : ''}. Ask me to stress-test claims, compare to category norms, or suggest description edits based on what you uploaded.`,
    };
  }

  if (input.documents.length > 0 && msg.length > 20) {
    return {
      reply: `Noted. Cross-checking your message with ${input.documents[input.documents.length - 1].name} — I would tighten the opening line of your description so traders grasp the utility within five seconds.`,
      analysisPatch: {
        strengths: [
          ...input.analysis.strengths,
          {
            id: nextId('s'),
            text: 'Founder provided extra context — analysis updated with your latest input.',
          },
        ].slice(-5),
      },
    };
  }

  return {
    reply: `For ${input.projectName || 'this project'}, I recommend approving the suggested edits above, then moving to your Rex concept summary. If you want to push back on anything, tell me which weakness feels wrong and I will revise.`,
  };
}

export function applyAnalysisRecommendations(
  description: string,
  recommendations: AnalysisRecommendation[],
  selectedIds: string[],
): string {
  const patches = recommendations
    .filter((r) => selectedIds.includes(r.id) && r.descriptionPatch)
    .map((r) => r.descriptionPatch!);

  if (patches.length === 0) return description;

  const last = patches[patches.length - 1];
  if (last.length > description.length + 20) return last;
  return description.trim().endsWith('.') ? `${description.trim()} ${last}` : `${description.trim()}. ${last}`;
}

export function mergeAnalysisPatch(
  current: MarketAnalysis,
  patch?: Partial<MarketAnalysis>,
): MarketAnalysis {
  if (!patch) return current;
  return {
    fitLabel: patch.fitLabel ?? current.fitLabel,
    overview: patch.overview ?? current.overview,
    strengths: patch.strengths ?? current.strengths,
    weaknesses: patch.weaknesses ?? current.weaknesses,
    recommendations: patch.recommendations ?? current.recommendations,
  };
}
