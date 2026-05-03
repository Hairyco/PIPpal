const SOURCES = [
  { url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment', name: 'GOV.UK', showSource: true, format: 'atom' },
  { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', name: 'BBC', showSource: false, format: 'rss' },
  { url: 'https://www.mirror.co.uk/money/benefits/rss.xml', name: 'Mirror', showSource: false, format: 'rss' },
  { url: 'https://www.manchestereveningnews.co.uk/rss.xml', name: 'MEN', showSource: false, format: 'rss' },
];

const PIP_KEYWORDS = ['pip', 'personal independence payment', 'pip claim', 'pip assessment', 'pip award', 'pip payment', 'pip benefit', 'pip claimant', 'pip review', 'pip reform', 'pip cut', 'pip increase', 'pip appeal', 'pip tribunal', 'pip rate', 'disability benefit', 'pip change'];
const TAG_RULES = [
  { tag: 'Legislation', keywords: ['law', 'legislation', 'parliament', 'bill', 'reform', 'policy', 'budget'] },
  { tag: 'Assessment', keywords: ['assessment', 'assessor', 'medical', 'face-to-face', 'telephone'] },
  { tag: 'Appeals', keywords: ['appeal', 'tribunal', 'mandatory reconsideration', 'challenge', 'overturn'] },
  { tag: 'Rates & Payments', keywords: ['rate', 'payment', 'increase', 'rise', 'amount', 'weekly', '£'] },
  { tag: 'Tips', keywords: ['how to', 'tip', 'advice', 'guide', 'help', 'apply', 'eligible', 'qualify'] },
  { tag: 'Official', keywords: ['gov.uk', 'dwp', 'department', 'minister', 'official'] },
];

function autoTag(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  const tags = [];
  for (const rule of TAG_RULES) {
    if (rule.keywords.some(k => text.includes(k))) tags.push(rule.tag);
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
      items.push({ title: title.trim(), summary: cleanSummary.slice(0, 500), link, date: published });
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
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim().slice(0, 500);
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
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)', 'Accept': 'application/rss+xml, application/atom+xml, */*' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    const items = source.format === 'atom' ? parseAtom(xml) : parseRSS(xml);
    return items.slice(0, 6).map(item => ({ ...item, sourceName: source.name, showSource: source.showSource }));
  } catch {
    return [];
  }
}

async function rewriteArticle(title, summary, tags) {
  if (!summary || summary.length < 20) return { headline: title, body: summary };
  try {
    const tagContext = tags.join(', ');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are a writer for PIPpal, a UK service that helps people claim Personal Independence Payment.

Rewrite this news item in PIPpal's voice. Warm, plain English, claimant-focused. Write 3-4 sentences. 
- Start with what happened
- Explain what it means for PIP claimants specifically  
- End with what they should do or be aware of
- No ** or !! or jargon
- Category: ${tagContext}

Title: ${title}
Summary: ${summary}

Return only the rewritten body text. No headline.`
        }],
      }),
    });
    const data = await response.json();
    return {
      headline: title,
      body: data.content?.[0]?.text?.trim() || summary,
    };
  } catch {
    return { headline: title, body: summary };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  try {
    const feedResults = await Promise.all(SOURCES.map(s => fetchFeed(s)));
    const allItems = feedResults.flat();

    if (allItems.length === 0) {
      return res.status(200).json({ articles: [], message: 'No articles found' });
    }

    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const topItems = allItems.slice(0, 12);

    const rewritten = await Promise.all(topItems.map(async item => {
      const tags = autoTag(item.title, item.summary);
      const { headline, body } = await rewriteArticle(item.title, item.summary, tags);
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return {
        title: headline,
        body,
        link: item.showSource ? item.link : null,
        source: item.showSource ? item.sourceName : 'PIPpal News',
        date: dateStr,
        tags,
      };
    }));

    res.status(200).json({ articles: rewritten });
  } catch (err) {
    res.status(500).json({ error: err.message, articles: [] });
  }
}
