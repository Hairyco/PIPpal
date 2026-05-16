const SOURCES = [
  // GOV.UK — official PIP and DWP news
  { url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment', name: 'GOV.UK', showSource: true, format: 'atom' },
  { url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=disability+benefit+dwp', name: 'GOV.UK DWP', showSource: true, format: 'atom' },
  // Mirror — benefits-specific section
  { url: 'https://www.mirror.co.uk/money/benefits/rss.xml', name: 'Mirror', showSource: false, format: 'rss' },
  { url: 'https://www.mirror.co.uk/money/rss.xml', name: 'Mirror Money', showSource: false, format: 'rss' },
  // Regional Reach PLC — money/benefits sections
  { url: 'https://www.manchestereveningnews.co.uk/money/rss.xml', name: 'MEN', showSource: false, format: 'rss' },
  { url: 'https://www.birminghammail.co.uk/money/rss.xml', name: 'Birmingham Live', showSource: false, format: 'rss' },
  { url: 'https://www.liverpoolecho.co.uk/money/rss.xml', name: 'Liverpool Echo', showSource: false, format: 'rss' },
  { url: 'https://www.leeds-live.co.uk/money/rss.xml', name: 'Leeds Live', showSource: false, format: 'rss' },
  { url: 'https://www.chroniclelive.co.uk/money/rss.xml', name: 'Chronicle Live', showSource: false, format: 'rss' },
  { url: 'https://www.walesonline.co.uk/money/rss.xml', name: 'Wales Online', showSource: false, format: 'rss' },
  // National
  { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', name: 'BBC', showSource: false, format: 'rss' },
  { url: 'https://www.disabilityrightsuk.org/feed', name: 'Disability Rights UK', showSource: false, format: 'rss' },
];

/** Decode XML/HTML entities from RSS titles and summaries */
function decodeHtmlEntities(input) {
  if (!input || typeof input !== 'string') return '';
  let s = input.replace(/\u00a0/g, ' ');
  s = s.replace(/&#x([0-9a-f]{1,6});/gi, (_, hex) => {
    const n = parseInt(hex, 16);
    return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : `&#x${hex};`;
  });
  s = s.replace(/&#(\d{1,7});/g, (_, dec) => {
    const n = parseInt(dec, 10);
    return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : `&#${dec};`;
  });
  s = s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  s = s.replace(/&amp;/g, '&');
  return s;
}

// Broad first-pass filter — must also mention PIP (see mentionsPipBenefit)
const BROAD_KEYWORDS = [
  'pip', 'personal independence payment', 'disability benefit', 'disability payment',
  'dwp', 'welfare', 'benefit', 'disabled', 'incapacity', 'universal credit',
  'claimant', 'assessment', 'social security', 'dla', 'attendance allowance'
];

/** Title + summary/body must reference PIP or spell it out — stops generic benefits/UC noise */
function mentionsPipBenefit(title, summary) {
  const combined = `${title || ''} ${summary || ''}`;
  if (/\bpip\b/i.test(combined)) return true;
  return combined.toLowerCase().includes('personal independence payment');
}

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

  { tag: 'Official', keywords: ['gov.uk', 'dwp', 'department for work', 'official'] },
];

function firstPassFilter(title, summary) {
  const text = (title + ' ' + (summary || '')).toLowerCase();
  if (HARD_REJECT.some(t => title.toLowerCase().includes(t))) return false;
  if (!mentionsPipBenefit(title, summary)) return false;
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
    const titleRaw = (e.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
    const summaryRaw = ((e.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
    const title = decodeHtmlEntities(titleRaw.trim());
    const summary = decodeHtmlEntities(summaryRaw);
    const link = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const date = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    if (title && firstPassFilter(title, summary)) {
      items.push({ title, summary: summary.slice(0, 400), link, date });
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
    const titleRaw = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const descRaw = ((item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
    const title = decodeHtmlEntities(titleRaw.trim());
    const desc = decodeHtmlEntities(descRaw);
    const link = (item.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const date = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '';
    if (title && firstPassFilter(title, desc)) {
      items.push({ title, summary: desc.slice(0, 400), link, date });
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

First decide: is this article primarily about PIP (Personal Independence Payment) for UK claimants? Relevant ONLY if it clearly concerns PIP, not merely generic UC or unrelated benefits news. NOT relevant = sports events, entertainment, charity fun runs, or articles that mention DWP/disability payments but not PIP.

If NOT relevant, respond with exactly: NOT_RELEVANT

If relevant, write 3 sentences starting directly with what happened. Second sentence: what it means for PIP claimants. Third: what they should know or do. No opening phrase like "This article". No greetings. No sign-off. No ** or !!.

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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function loadStoredArticles() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/news_articles?order=created_at.desc&limit=40`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function saveArticles(articles) {
  try {
    // Only save articles not already stored (check by title)
    const existing = await loadStoredArticles();
    const existingTitles = new Set(existing.map(a => a.title));
    const newArticles = articles.filter(a => !existingTitles.has(a.title));
    if (newArticles.length === 0) return;
    await fetch(
      `${SUPABASE_URL}/rest/v1/news_articles`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(newArticles),
      }
    );
    console.log(`Saved ${newArticles.length} new articles to Supabase`);
  } catch (err) {
    console.log('Save error:', err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800');

  try {
    // Fetch fresh articles from RSS in background
    const feedResults = await Promise.all(SOURCES.map(s => fetchFeed(s)));
    const allItems = feedResults.flat();
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const candidates = allItems.slice(0, 25);

    // Process new articles with Claude
    console.log(`Total candidates from RSS: ${candidates.length}`);
    candidates.slice(0, 5).forEach(c => console.log(`  - [${c.sourceName}] ${c.title}`));
    const freshArticles = [];
    if (candidates.length > 0) {
      const processed = await Promise.all(candidates.map(async item => {
        const { body, relevant } = await rewriteWithClaude(item.title, item.summary, item.sourceName);
        if (!relevant) {
          console.log(`NOT_RELEVANT: ${item.title}`);
          return null;
        }
        const tags = autoTag(item.title, item.summary);
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        return {
          title: decodeHtmlEntities(String(item.title || '')),
          body: decodeHtmlEntities(String(body || '')),
          link: item.showSource ? item.link : null,
          source: item.showSource ? item.sourceName : 'PIPpal News',
          date: dateStr,
          tags,
        };
      }));
      freshArticles.push(...processed.filter(Boolean));
      // Save new articles to Supabase
      await saveArticles(freshArticles);
    }

    // Load all stored articles (includes today + historical)
    const stored = await loadStoredArticles();

    // Merge: fresh first, then stored (deduplicated by title)
    const seen = new Set();
    const merged = [...freshArticles, ...stored].filter(a => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    }).filter(a => mentionsPipBenefit(a.title, a.body || '')).slice(0, 30);

    // Format stored articles (they may have array tags)
    const articles = merged.map(a => ({
      title: decodeHtmlEntities(String(a.title || '')),
      body: decodeHtmlEntities(String(a.body || '')),
      link: a.link,
      source: a.source,
      date: a.date,
      tags: Array.isArray(a.tags) ? a.tags : [a.tags || 'News'],
    }));

    res.status(200).json({ articles });
  } catch (err) {
    res.status(500).json({ error: err.message, articles: [] });
  }
}
