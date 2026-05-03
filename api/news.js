const SOURCES = [
  { url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment', name: 'GOV.UK', showSource: true, format: 'atom' },
  { url: 'https://www.mirror.co.uk/money/benefits/rss.xml', name: 'Mirror', showSource: false, format: 'rss' },
  { url: 'https://www.manchestereveningnews.co.uk/rss.xml', name: 'MEN', showSource: false, format: 'rss' },
  { url: 'https://www.birminghammail.co.uk/rss.xml', name: 'Birmingham Live', showSource: false, format: 'rss' },
  { url: 'https://www.liverpoolecho.co.uk/rss.xml', name: 'Liverpool Echo', showSource: false, format: 'rss' },
  { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', name: 'BBC', showSource: false, format: 'rss' },
];

// Broad first-pass filter — catch anything that MIGHT be PIP related
// Claude will then decide properly
const BROAD_KEYWORDS = [
  'pip', 'personal independence payment', 'disability benefit', 'disability payment',
  'dwp', 'welfare', 'benefit', 'disabled', 'incapacity', 'universal credit',
  'claimant', 'assessment', 'social security', 'dla', 'attendance allowance'
];

// Hard reject — clearly nothing to do with benefits
const HARD_REJECT = [
  'marathon', 'fun run', 'triathlon', 'athletics', 'olympic', 'football match',
  'rugby match', 'cricket match', 'premier league', 'champions league', 'transfer',
  'recipe', 'weather forecast', 'traffic', 'celebrity', 'tv show', 'film review'
];

const TAG_RULES = [
  { tag: 'Legislation', keywords: ['law', 'legislation', 'parliament', 'bill', 'reform', 'policy', 'budget', 'government', 'conservative', 'labour', 'minister'] },
  { tag: 'Assessment', keywords: ['assessment', 'assessor', 'medical', 'face-to-face', 'telephone', 'capita', 'atos', 'maximus'] },
  { tag: 'Appeals', keywords: ['appeal', 'tribunal', 'mandatory reconsideration', 'challenge', 'overturn', 'won', 'lost'] },
  { tag: 'Rates & Payments', keywords: ['rate', 'payment', 'increase', 'rise', 'amount', 'weekly', '£', 'uprat'] },
  { tag: 'Tips', keywords: ['how to', 'tip', 'advice', 'guide', 'help', 'apply', 'eligible', 'qualify', 'claim'] },
  { tag: 'Official', keywords: ['gov.uk', 'dwp', 'department for work', 'official'] },
];

function firstPassFilter(title, summary) {
  const text = (title + ' ' + (summary || '')).toLowerCase();
  if (HARD_REJECT.some(t => title.toLowerCase().includes(t))) return false;
  return BROAD_KEYWORDS.some(k => text.includes(k));
}

function autoTag(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  const tags = [];
  for (const rule of TAG_RULES) {
    if (rule.keywords.some(k => text.includes(k))) tags.push(rule.tag);
  }
  return tags.length > 0 ? tags.slice(0, 2) : ['News'];
}

function parseAtom(xml) {
  const items = [];
  const regex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const e = match[1];
    const title = (e.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
    const summary = ((e.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
    const link = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const date = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    if (title && firstPassFilter(title, summary)) {
      items.push({ title: title.trim(), summary: summary.slice(0, 400), link, date });
    }
  }
  return items;
}

function parseRSS(xml) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const desc = ((item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
    const link = (item.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const date = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '';
    if (title && firstPassFilter(title, desc)) {
      items.push({ title: title.trim(), summary: desc.slice(0, 400), link, date });
    }
  }
  return items;
}

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)', 'Accept': 'application/rss+xml, application/atom+xml, */*' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = source.format === 'atom' ? parseAtom(xml) : parseRSS(xml);
    return items.slice(0, 8).map(item => ({ ...item, sourceName: source.name, showSource: source.showSource }));
  } catch {
    return [];
  }
}

async function rewriteWithClaude(title, summary, sourceName) {
  if (!summary || summary.length < 20) return { body: summary, relevant: true };
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You write news for PIPpal, a UK service helping people claim PIP disability benefit.

First decide: is this article relevant to PIP claimants? It is relevant if it covers PIP, DWP benefits, disability payments, welfare reform, or benefit assessments. It is NOT relevant if it is about sports events, entertainment, general disability charity events, or unrelated topics.

If NOT relevant, respond with exactly: NOT_RELEVANT

If relevant, write 3 sentences in plain English: what happened, what it means for PIP claimants, what they should know. No greetings. No sign-off. No ** or !!.

Title: ${title}
Summary: ${summary}`
        }],
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || summary;
    if (text === 'NOT_RELEVANT') return { body: summary, relevant: false };
    return { body: text, relevant: true };
  } catch {
    return { body: summary, relevant: true };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800');

  try {
    const feedResults = await Promise.all(SOURCES.map(s => fetchFeed(s)));
    const allItems = feedResults.flat();

    // Sort by date — most recent first, but keep older ones as fallback
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Take top 25 candidates for Claude to assess
    const candidates = allItems.slice(0, 25);

    if (candidates.length === 0) {
      return res.status(200).json({ articles: [], message: 'No articles found from feeds' });
    }

    // Let Claude decide relevance and rewrite
    const processed = await Promise.all(candidates.map(async item => {
      const { body, relevant } = await rewriteWithClaude(item.title, item.summary, item.sourceName);
      if (!relevant) return null;
      const tags = autoTag(item.title, item.summary);
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return {
        title: item.title,
        body,
        link: item.showSource ? item.link : null,
        source: item.showSource ? item.sourceName : 'PIPpal News',
        date: dateStr,
        tags,
      };
    }));

    const articles = processed.filter(Boolean).slice(0, 15);

    res.status(200).json({ articles });
  } catch (err) {
    res.status(500).json({ error: err.message, articles: [] });
  }
}
