export type CelebrityTrend = {
  id: string;
  celebrity: string;
  headline: string;
  summary: string;
  link?: string;
  source: string;
  date: string;
};

export const FALLBACK_CELEBRITY_TRENDS: CelebrityTrend[] = [
  {
    id: 'fallback-1',
    celebrity: 'Taylor Swift',
    headline: 'Taylor Swift dominates headlines amid tour and media buzz',
    summary: 'Fan communities rally around every announcement — prime moment for a community token.',
    source: 'Trending',
    date: 'Today',
  },
  {
    id: 'fallback-2',
    celebrity: 'Drake',
    headline: 'Drake back in the news with new music and social chatter',
    summary: 'Music drops and celebrity moments drive viral trading narratives.',
    source: 'Trending',
    date: 'Today',
  },
  {
    id: 'fallback-3',
    celebrity: 'Kim Kardashian',
    headline: 'Kim Kardashian trends across entertainment and business news',
    summary: 'Reality-TV scale audiences translate well to holder perks and merch drops.',
    source: 'Trending',
    date: 'Today',
  },
  {
    id: 'fallback-4',
    celebrity: 'Elon Musk',
    headline: 'Elon Musk sparks headlines across tech and pop culture',
    summary: 'High-velocity news cycles suit trade-tax marketing and meme momentum.',
    source: 'Trending',
    date: 'Today',
  },
  {
    id: 'fallback-5',
    celebrity: 'Beyoncé',
    headline: 'Beyoncé in the news with culture-defining moments',
    summary: 'Fan-token launches around major artist news often see fast community growth.',
    source: 'Trending',
    date: 'Today',
  },
  {
    id: 'fallback-6',
    celebrity: 'Bad Bunny',
    headline: 'Bad Bunny trends globally across music and entertainment',
    summary: 'Cross-border fandom is a strong fit for Solana community coins.',
    source: 'Trending',
    date: 'Today',
  },
];

export function buildCelebrityCoinDraft(trend: CelebrityTrend) {
  const slug = trend.celebrity.replace(/[^a-zA-Z0-9]/g, '');
  const projectName = slug ? `${slug}Coin` : 'CelebrityCoin';
  const description = `Fan token around ${trend.celebrity}, inspired by today's news: "${trend.headline}". Launch with trade-tax marketing, holder perks, and milestone-funded community drops on Rex.`;

  return { projectName, description };
}

export function getStartedUrlForTrend(trend: CelebrityTrend): string {
  const { projectName, description } = buildCelebrityCoinDraft(trend);
  const params = new URLSearchParams({
    category: 'celebrity-coins',
    name: projectName,
    idea: description,
  });
  return `/get-started?${params.toString()}`;
}

export async function fetchCelebrityTrends(): Promise<{
  trends: CelebrityTrend[];
  live: boolean;
}> {
  try {
    const res = await fetch('/api/celebrity-trending');
    if (!res.ok) throw new Error('Trending fetch failed');
    const data = await res.json();
    const trends = Array.isArray(data.trends) ? data.trends : [];
    if (trends.length === 0) {
      return { trends: FALLBACK_CELEBRITY_TRENDS, live: false };
    }
    return { trends, live: data.source === 'live' };
  } catch {
    return { trends: FALLBACK_CELEBRITY_TRENDS, live: false };
  }
}
