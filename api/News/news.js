// api/news.js — Fetches PIP news from RSS feeds and rewrites with Claude
const Anthropic = require('@anthropic-ai/sdk');

const SOURCES = [
  // Tier 1 — show source and link
  {
    url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment',
    name: 'GOV.UK',
    showSource: true,
    format: 'atom',
  },
  // Tier 2/3 — rewrite as PIPpal News, no outbound link
  {
    url: 'https://www.mirror.co.uk/money/benefits/rss.xml',
    name: 'Mirror',
    showSource: false,
    format: 'rss',
  },
  {
    url: 'https://www.manchestereveningnews.co.uk/rss.xml',
    name: 'MEN',
    showSource: false,
    format: 'rss',
  },
  {
    url: 'https://www.birminghammail.co.uk/rss.xml',
    name: 'Birmingham Live',
    showSource: false,
    format: 'rss',
  },
  {
    url: 'https://www.liverpoolecho.co.uk/rss.xml',
    name: 'Liverpool Echo',
    showSource: false,
    format: 'rss',
  },
  {
    url: 'https://www.disabilityrightsuk.org/feed',
    name: 'Disability Rights UK',
    showSource: false,
    format: 'rss',
  },
];

const PIP_KEYWORDS = ['pip', 'personal independence payment', 'disability benefit', 'dwp', 'pip claim', 'pip assessment', 'pip award', 'pip review', 'disability payment', 'pip rate', 'pip change', 'pip news', 'benefit', 'disabled'];

const TAG_RULES = [
  { tag: 'Legislation', keywords: ['law', 'legislation', 'parliament', 'bill', 'act', 'reform', 'policy', 'government', 'chancellor', 'budget', 'autumn statement', 'spring statement'] },
  { tag: 'Assessment', keywords: ['assessment', 'assessor', 'medical', 'health professional', 'face-to-face', 'telephone', 'video', 'wca', 'atos', 'capita', 'maximus'] },
  { tag: 'Appeals', keywords: ['appeal', 'tribunal', 'mandatory reconsideration', 'mr', 'challenge', 'overturn', 'success rate', 'won', 'lost'] },
  { tag: 'Rates & Payments', keywords: ['rate', 'payment', 'increase', 'rise', 'amount', 'weekly', 'uprated', 'uprating', 'inflation', '£'] },
  { tag: 'Tips', keywords: ['how to', 'tip', 'advice', 'guide', 'help', 'apply', 'applying', 'application', 'claim', 'claimant', 'eligible', 'eligibility', 'qualify'] },
  { tag: 'Official', keywords: ['gov.uk', 'dwp', 'department', 'minister', 'secretary of state', 'official'] },
];

function autoTag(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  const tags = [];
  for (const rule of TAG_RULES) {
    if (rule.keywords.some(k => text.includes(k))) {
      tags.push(rule.tag);
    }
  }
  return tags.length > 0 ? tags.slice(0, 2) : ['News'];
}

function isPIPRelated(title, summary) {
  const text = (title + ' ' + (summary || '')).toLowerCase();
  return PIP_KEYWORDS.some(k => text.includes(k));
}

function parseAtom(xml) {
  const items = [];
  const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
  for (const match of entryMatches) {
    const entry = match[1];
    const title = (entry.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
    const summary = (entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '';
    const link = (entry.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const published = (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    const cleanSummary = summary.replace(/<[^>]*>/g, '').trim();
    if (title && isPIPRelated(title, cleanSummary)) {
      items.push({ title: title.trim(), summary: cleanSummary, link, date: published });
    }
  }
  return items;
}

function parseRSS(xml) {
  const items = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const item = match[1];
    const title = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const description = (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '';
    const link = (item.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '';
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim().slice(0, 300);
    if (title && isPIPRelated(title, cleanDesc)) {
      items.push({ title: title.trim(), summary: cleanDesc, link, date: pubDate });
    }
  }
  return items;
}

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PIPpal/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = source.format === 'atom' ? parseAtom(xml) : parseRSS(xml);
    return items.slice(0, 5).map(item => ({ ...item, sourceName: source.name, showSource: source.showSource }));
  } catch {
    return [];
  }
}

async function rewriteSummary(client, title, summary, showSource) {
  if (!summary || summary.length < 20) return summary;
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `Rewrite this news summary in plain English for a PIP claimant. 2-3 sentences max. Focus on what it means for them practically. No ** or !!. No jargon.\n\nTitle: ${title}\nSummary: ${summary}`,
      }],
    });
    return response.content[0].text.trim();
  } catch {
    return summary;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600'); // cache for 1 hour

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    // Fetch all feeds in parallel
    const feedResults = await Promise.all(SOURCES.map(s => fetchFeed(s)));
    const allItems = feedResults.flat();

    // Sort by date, most recent first
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Take top 20
    const topItems = allItems.slice(0, 20);

    // Rewrite summaries for non-GOV.UK items (in parallel, max 5 at a time)
    const rewritten = await Promise.all(topItems.map(async item => {
      const rewrittenSummary = await rewriteSummary(client, item.title, item.summary, item.showSource);
      const tags = autoTag(item.title, item.summary);
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return {
        title: item.title,
        summary: rewrittenSummary,
        link: item.showSource ? item.link : null,
        source: item.showSource ? item.sourceName : 'PIPpal News',
        date: dateStr,
        tags,
      };
    }));

    res.status(200).json({ articles: rewritten });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', articles: [] });
  }
};