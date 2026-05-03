// api/news.js — Fetches PIP news from RSS feeds and rewrites with Claude
const Anthropic = require('@anthropic-ai/sdk');

const SOURCES = [
  {
    url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment',
    name: 'GOV.UK',
    showSource: true,
    format: 'atom',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/uk/rss.xml',
    name: 'BBC',
    showSource: false,
    format: 'rss',
  },
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
];

const PIP_KEYWORDS = ['pip', 'personal independence payment', 'disability benefit', 'dwp', 'pip claim', 'pip assessment', 'pip award', 'benefit', 'disabled', 'disability payment'];

const TAG_RULES = [
  { tag: 'Legislation', keywords: ['law', 'legislation', 'parliament', 'bill', 'act', 'reform', 'policy', 'government', 'budget'] },
  { tag: 'Assessment', keywords: ['assessment', 'assessor', 'medical', 'face-to-face', 'telephone', 'video'] },
  { tag: 'Appeals', keywords: ['appeal', 'tribunal', 'mandatory reconsideration', 'challenge', 'overturn', 'won', 'lost'] },
  { tag: 'Rates & Payments', keywords: ['rate', 'payment', 'increase', 'rise', 'amount', 'weekly', 'uprated', '£'] },
  { tag: 'Tips', keywords: ['how to', 'tip', 'advice', 'guide', 'help', 'apply', 'applying', 'eligible', 'eligibility', 'qualify'] },
  { tag: 'Official', keywords: ['gov.uk', 'dwp', 'department', 'minister', 'official'] },
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
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = (entry.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
    const summary = (entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '';
    const link = (entry.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const published = (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    const cleanSummary = summary.replace(/<[^>]*>/g, '').trim();
    if (title && isPIPRelated(title, cleanSummary)) {
      items.push({ title: title.trim(), summary: cleanSummary.slice(0, 300), link, date: published });
    }
  }
  return items;
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.log(`Feed ${source.name} returned ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const items = source.format === 'atom' ? parseAtom(xml) : parseRSS(xml);
    console.log(`Feed ${source.name}: ${items.length} PIP articles found`);
    return items.slice(0, 6).map(item => ({ ...item, sourceName: source.name, showSource: source.showSource }));
  } catch (err) {
    console.log(`Feed ${source.name} failed: ${err.message}`);
    return [];
  }
}

async function rewriteSummary(client, title, summary) {
  if (!summary || summary.length < 20) return summary;
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Rewrite in plain English for a PIP claimant. 2 sentences max. What does this mean for them? No ** or !!.\n\nTitle: ${title}\nSummary: ${summary}`,
      }],
    });
    return response.content[0].text.trim();
  } catch {
    return summary;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Fetch all feeds in parallel
    const feedResults = await Promise.all(SOURCES.map(s => fetchFeed(s)));
    const allItems = feedResults.flat();
    console.log(`Total PIP articles found: ${allItems.length}`);

    if (allItems.length === 0) {
      return res.status(200).json({ articles: [], message: 'No articles found' });
    }

    // Sort by date
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const topItems = allItems.slice(0, 15);

    // Rewrite summaries
    const rewritten = await Promise.all(topItems.map(async item => {
      const rewrittenSummary = await rewriteSummary(client, item.title, item.summary);
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
    console.error('News API error:', err.message);
    res.status(500).json({ error: err.message, articles: [] });
  }
};
