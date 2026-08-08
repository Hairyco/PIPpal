/** Demo trending news — tags drive the Trenches bar and /news page. */

export type NewsTagId =
  | 'trump'
  | 'fed'
  | 'solana-etf'
  | 'elon'
  | 'ai-bill';

export type TrendingNewsTag = {
  id: NewsTagId;
  label: string;
};

export type TrendingNewsStory = {
  id: string;
  tagId: NewsTagId;
  title: string;
  /** One–two sentence context shown on the news page. */
  context: string;
  when: string;
  source: string;
  /** How many coins launched off this narrative (may exceed linked tickers). */
  coinsLaunched: number;
  /** Optional related CTOgo tickers for deep links + logos. */
  tickers?: string[];
};

export const TRENDING_NEWS_TAGS: TrendingNewsTag[] = [
  { id: 'trump', label: 'Trump' },
  { id: 'fed', label: 'Fed Rate' },
  { id: 'solana-etf', label: 'Solana ETF' },
  { id: 'elon', label: 'Elon' },
  { id: 'ai-bill', label: 'AI Bill' },
];

export const TRENDING_NEWS_STORIES: TrendingNewsStory[] = [
  {
    id: 'trump-truth-memes',
    tagId: 'trump',
    title: 'Truth Social clip sparks fresh Trump meme rotation',
    context:
      'A short Truth Social post is circulating in Solana group chats. Traders are rotating into political tickers with active marketing wallets while volume stays thin outside CTOgo rails.',
    when: '12m',
    source: 'CTOgo Desk',
    coinsLaunched: 14,
    tickers: ['MPEG', 'DUMP'],
  },
  {
    id: 'trump-rally',
    tagId: 'trump',
    title: 'Campaign stop chatter lifts political meme volume',
    context:
      'Raid links spiked after a rally mention hit X. External Pump.fun clones are noisy — CTOs with verified socials are holding better than fresh mints.',
    when: '48m',
    source: 'X / CTOgo',
    coinsLaunched: 9,
    tickers: ['GHOST', 'CALL'],
  },
  {
    id: 'fed-hold',
    tagId: 'fed',
    title: 'Markets price a hold — risk appetite flips to high-beta SOL',
    context:
      'Fed funds futures lean hold. Meme desks usually see a 1–2h liquidity bump after the statement; Growth wallets with DexScreener spend queued may catch the first wave.',
    when: '1h',
    source: 'Macro brief',
    coinsLaunched: 6,
    tickers: ['NITE', 'SURV'],
  },
  {
    id: 'fed-speak',
    tagId: 'fed',
    title: 'Speaker remarks: “data dependent” — traders fade the first print',
    context:
      'Headline bots faded the first candle. Watch for a second-leg bounce into SOL memes if DXY cools into the US afternoon.',
    when: '3h',
    source: 'Desk note',
    coinsLaunched: 4,
    tickers: ['MODA'],
  },
  {
    id: 'sol-etf-filing',
    tagId: 'solana-etf',
    title: 'Solana ETF chatter returns after fresh filing noise',
    context:
      'Another spot SOL ETF rumor lap. Native launches with clean bundler rings are seeing early sniper flow; graduated Raydium names lag until confirmation.',
    when: '26m',
    source: 'Market wire',
    coinsLaunched: 22,
    tickers: ['CBACK', 'GOB'],
  },
  {
    id: 'sol-etf-flows',
    tagId: 'solana-etf',
    title: 'ETF narrative: SOL beta names lead Prelaunch watchlists',
    context:
      'Prelaunch boards filled with “ETF” tickers overnight. Most are vapor — Growth stage coins with real MW balance are the cleaner expression.',
    when: '2h',
    source: 'CTOgo Growth',
    coinsLaunched: 31,
    tickers: ['MPEG', 'LMARS'],
  },
  {
    id: 'elon-post',
    tagId: 'elon',
    title: 'Elon reply boosts dog-adjacent Solana pairs',
    context:
      'A short reply on X lit doge-adjacent tickers. Expect copycat mints for ~30m; prefer CTOs where the original dev already sold.',
    when: '9m',
    source: 'X radar',
    coinsLaunched: 18,
    tickers: ['DUMP', 'TFROG'],
  },
  {
    id: 'elon-space',
    tagId: 'elon',
    title: 'Spaces teaser: AI + crypto crossover talk',
    context:
      'Mention of AI agents trading on-chain. AI Bill and Elon tags are overlapping — AAI-style tickers may see both narratives.',
    when: '5h',
    source: 'Spaces clip',
    coinsLaunched: 7,
    tickers: ['AAI', 'GOB'],
  },
  {
    id: 'ai-bill-vote',
    tagId: 'ai-bill',
    title: 'AI Bill headline hits — policy memes wake up',
    context:
      'Draft bill language leaked into crypto Twitter. Thin books: size down, use quick-buy only on coins with green bundle rings.',
    when: '34m',
    source: 'Policy watch',
    coinsLaunched: 11,
    tickers: ['AAI', 'EXIT'],
  },
  {
    id: 'ai-bill-lobby',
    tagId: 'ai-bill',
    title: 'Lobby notes: enforcement timeline unclear',
    context:
      'Analysts say any vote is months out. Narrative still prints volume — treat as a short narrative trade, not a hold.',
    when: '6h',
    source: 'Briefing',
    coinsLaunched: 5,
    tickers: ['CABAL'],
  },
];

export function newsTagById(id: string | null | undefined): TrendingNewsTag | undefined {
  if (!id) return undefined;
  return TRENDING_NEWS_TAGS.find((t) => t.id === id || t.label.toLowerCase() === id.toLowerCase());
}

export function storiesForTag(tagId: NewsTagId | 'all'): TrendingNewsStory[] {
  if (tagId === 'all') return TRENDING_NEWS_STORIES;
  return TRENDING_NEWS_STORIES.filter((s) => s.tagId === tagId);
}

export function newsTagLabel(tagId: NewsTagId): string {
  return TRENDING_NEWS_TAGS.find((t) => t.id === tagId)?.label ?? tagId;
}

export function totalCoinsLaunched(stories: TrendingNewsStory[]): number {
  return stories.reduce((sum, s) => sum + s.coinsLaunched, 0);
}

export function storyById(id: string | null | undefined): TrendingNewsStory | undefined {
  if (!id) return undefined;
  return TRENDING_NEWS_STORIES.find((s) => s.id === id);
}

function salt(str: string, mod = 1000): number {
  let s = 0;
  for (let i = 0; i < str.length; i += 1) s = (s * 31 + str.charCodeAt(i)) % mod;
  return s;
}

/**
 * Featured + extra catalog coins so the story’s “coins launched” count
 * has a full list for the portfolio-style page (demo until live feeds).
 */
export function tickersForStory(
  story: TrendingNewsStory,
  catalogTickers: string[],
): string[] {
  const featured = (story.tickers ?? []).map((t) => t.toUpperCase());
  const seen = new Set(featured);
  const out = [...featured];
  const need = Math.max(story.coinsLaunched, featured.length);
  if (out.length >= need || catalogTickers.length === 0) return out.slice(0, need);

  const start = salt(story.id, catalogTickers.length);
  for (let i = 0; out.length < need && i < catalogTickers.length * 2; i += 1) {
    const t = catalogTickers[(start + i) % catalogTickers.length]?.toUpperCase();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}
