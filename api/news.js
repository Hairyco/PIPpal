const GOOGLE_NEWS_PIP =
  'https://news.google.com/rss/search?q=PIP+personal+independence+payment+UK&hl=en-GB&gl=GB&ceid=GB:en';
const GOOGLE_NEWS_DWP =
  'https://news.google.com/rss/search?q=DWP+PIP+disability+benefit+UK&hl=en-GB&gl=GB&ceid=GB:en';

const SOURCES = [
  // Google News — reliable PIP-specific syndication (replaces many dead regional RSS feeds)
  { url: GOOGLE_NEWS_PIP, name: 'Google News', showSource: false, format: 'rss', curated: true },
  { url: GOOGLE_NEWS_DWP, name: 'Google News', showSource: false, format: 'rss', curated: true },
  // GOV.UK — official announcements when they mention PIP in the title
  { url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment', name: 'GOV.UK', showSource: true, format: 'atom' },
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

/** Decode entities first, then strip tags — Google News RSS uses encoded HTML in descriptions */
function plainTextFromHtml(input) {
  if (!input || typeof input !== 'string') return '';
  let s = decodeHtmlEntities(input);
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
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
  'recipe', 'weather forecast', 'traffic', 'celebrity', 'tv show', 'film review',
];

/** Regional SEO roundups and generic multi-benefit guides — not PIP news for claimants */
const IRRELEVANT_TITLE_PATTERNS = [
  /\b(barrow|cumbria)\b.*\b(guide|universal credit|benefits)\b/i,
  /\byour guide to\b.*\b(universal credit|pip|benefits)\b/i,
  /\bwhich uk areas qualify\b/i,
  /\btop \d+ conditions\b.*\beligible\b/i,
  /\bnew rules for universal credit, pip and esa\b/i,
];

const META_BODY_PATTERNS = [
  /^this article is/i,
  /^it directly concerns/i,
  /relevant to pippal/i,
  /however, i cannot write/i,
  /you have only provided/i,
  /^not_relevant/i,
];

function titleIsLikelyIrrelevant(title) {
  const t = String(title || '');
  return IRRELEVANT_TITLE_PATTERNS.some(p => p.test(t));
}

function bodyLooksLikeHtmlLeak(body) {
  return /<\s*a\s+href|<\s*\/?\w+|news\.google\.com\/rss/i.test(String(body || ''));
}

function bodyIsBroken(body) {
  const b = plainTextFromHtml(String(body || ''));
  if (!b || b.length < 50) return true;
  if (bodyLooksLikeHtmlLeak(b)) return true;
  if (/&nbsp;|&#160;/i.test(String(body || ''))) return true;
  if (META_BODY_PATTERNS.some(p => p.test(b))) return true;
  if (b.split(/[.!?]+/).filter(s => s.trim().length > 12).length < 2) return true;
  return false;
}

function bodyIsValidNewsBody(body) {
  return !bodyIsBroken(body);
}

const TAG_RULES = [
  { tag: 'Legislation', keywords: ['law', 'legislation', 'parliament', 'bill', 'reform', 'policy', 'budget', 'government', 'conservative', 'labour', 'minister'] },
  { tag: 'Assessment', keywords: ['assessment', 'assessor', 'medical', 'face-to-face', 'telephone', 'capita', 'atos', 'maximus'] },
  { tag: 'Appeals', keywords: ['appeal', 'tribunal', 'mandatory reconsideration', 'challenge', 'overturn', 'won', 'lost'] },
  { tag: 'Rates & Payments', keywords: ['rate', 'payment', 'increase', 'rise', 'amount', 'weekly', '£', 'uprat'] },

  { tag: 'Official', keywords: ['gov.uk', 'dwp', 'department for work', 'official'] },
];

function cleanGoogleNewsTitle(title) {
  return title.replace(/\s+-\s+[^-]+$/, '').trim();
}

function firstPassFilter(title, summary, curated = false) {
  const text = (title + ' ' + (summary || '')).toLowerCase();
  if (titleIsLikelyIrrelevant(title)) return false;
  if (HARD_REJECT.some(t => title.toLowerCase().includes(t))) return false;
  if (curated) return mentionsPipBenefit(title, summary);
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
    const summaryRaw = (e.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '';
    const title = plainTextFromHtml(titleRaw.trim());
    const summary = plainTextFromHtml(summaryRaw);
    const link = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const date = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    if (title && firstPassFilter(title, summary)) {
      items.push({ title, summary: summary.slice(0, 400), link, date });
    }
  }
  return items;
}

function parseRSS(xml, curated = false) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const item = match[1];
    const titleRaw = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const descRaw = (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '';
    let title = plainTextFromHtml(titleRaw.trim());
    const desc = plainTextFromHtml(descRaw);
    const link = (item.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const date = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '';
    const publisher = decodeHtmlEntities(((item.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '').trim());
    if (curated) title = cleanGoogleNewsTitle(title);
    if (title && firstPassFilter(title, desc, curated)) {
      items.push({ title, summary: desc.slice(0, 400), link, date, publisher });
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
    const items = source.format === 'atom' ? parseAtom(xml) : parseRSS(xml, source.curated);
    return items.slice(0, 10).map(item => ({
      ...item,
      sourceName: item.publisher || source.name,
      showSource: source.showSource,
    }));
  } catch {
    return [];
  }
}

async function rewriteWithClaude(title, summary) {
  const cleanSummary = plainTextFromHtml(summary);
  const cleanTitle = plainTextFromHtml(title);
  if (titleIsLikelyIrrelevant(cleanTitle)) {
    return { body: '', relevant: false };
  }
  const sourceText = cleanSummary && cleanSummary.length >= 15 ? cleanSummary : cleanTitle;
  if (!sourceText || sourceText.length < 15) {
    return { body: '', relevant: false };
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 220,
        messages: [{
          role: 'user',
          content: `You write news for PIPpal, a UK service helping people claim PIP disability benefit.

Step 1 — decide relevance. NOT relevant if the story is mainly about: Universal Credit or ESA without a clear PIP angle; local/regional benefits guides (e.g. one town or county); generic listicles ("top 5 conditions"); sports or entertainment; or anything that only mentions PIP in passing alongside other benefits.

If NOT relevant, respond with exactly: NOT_RELEVANT

Step 2 — if relevant, write ONLY three plain sentences (no labels, no reasoning, no preamble):
- Sentence 1: what happened
- Sentence 2: what it means for PIP claimants
- Sentence 3: what they should know or do

Never write "This article is about…", never mention PIPpal, never explain your decision. No ** or !!.

Title: ${cleanTitle}
Source summary: ${sourceText}`
        }],
      }),
    });
    const data = await response.json();
    const raw = data.content?.[0]?.text?.trim() || '';
    if (!raw || raw.startsWith('NOT_RELEVANT')) {
      return { body: '', relevant: false };
    }
    const text = plainTextFromHtml(raw);
    if (!bodyIsValidNewsBody(text)) {
      return { body: '', relevant: false };
    }
    return { body: text, relevant: true };
  } catch {
    return { body: '', relevant: false };
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function loadStoredArticles() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/news_articles?order=created_at.desc&limit=40&is_relevant=neq.false`,
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

async function ingestFreshArticles() {
  const feedResults = await Promise.all(SOURCES.map(s => fetchFeed(s)));
  const allItems = feedResults.flat();
  allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const candidates = allItems.slice(0, 8);

  console.log(`Total candidates from RSS: ${candidates.length}`);
  candidates.slice(0, 5).forEach(c => console.log(`  - [${c.sourceName}] ${c.title}`));

  const freshArticles = [];
  if (candidates.length === 0) return freshArticles;

  for (const item of candidates) {
    if (titleIsLikelyIrrelevant(item.title)) {
      console.log(`SKIPPED irrelevant title: ${item.title}`);
      continue;
    }
    const { body, relevant } = await rewriteWithClaude(item.title, item.summary);
    if (!relevant || !bodyIsValidNewsBody(body)) {
      console.log(`NOT_RELEVANT or bad body: ${item.title}`);
      continue;
    }
    const tags = autoTag(item.title, item.summary);
    const dateStr = item.date
      ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    freshArticles.push({
      title: plainTextFromHtml(String(item.title || '')),
      body: plainTextFromHtml(String(body || '')),
      link: item.showSource ? item.link : null,
      source: item.showSource ? item.sourceName : 'PIPpal News',
      date: dateStr,
      tags,
      is_relevant: true,
    });
  }

  await saveArticles(freshArticles);
  return freshArticles;
}

function mergeArticles(freshArticles, stored) {
  const seen = new Set();
  return [...freshArticles, ...stored]
    .filter(a => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    })
    .filter(
      a =>
        !titleIsLikelyIrrelevant(a.title) &&
        mentionsPipBenefit(a.title, a.body || '') &&
        a.is_relevant !== false &&
        !String(a.body || '').startsWith('NOT_RELEVANT') &&
        bodyIsValidNewsBody(a.body),
    )
    .slice(0, 30);
}

function formatArticles(merged) {
  return merged
    .map(a => ({
      title: plainTextFromHtml(String(a.title || '')),
      body: plainTextFromHtml(String(a.body || '')),
      link: a.link,
      source: a.source,
      date: a.date,
      tags: Array.isArray(a.tags) ? a.tags : [a.tags || 'News'],
    }))
    .filter(a => !titleIsLikelyIrrelevant(a.title) && bodyIsValidNewsBody(a.body));
}

async function patchArticle(id, fields) {
  await fetch(`${SUPABASE_URL}/rest/v1/news_articles?id=eq.${id}`, {
    method: 'PATCH',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
  }).catch(() => {});
}

/** Re-rewrite or archive stored articles with HTML leaks, RSS snippets, or AI meta-text */
async function repairStoredArticles(stored, { rewriteLimit = 6 } = {}) {
  let archived = 0;
  let rewritten = 0;
  let rewritesDone = 0;

  for (const row of stored || []) {
    if (!row.id) continue;

    if (titleIsLikelyIrrelevant(row.title)) {
      await patchArticle(row.id, { is_relevant: false });
      row.is_relevant = false;
      archived++;
      continue;
    }

    if (!bodyIsBroken(row.body)) continue;

    if (rewritesDone >= rewriteLimit || !process.env.ANTHROPIC_API_KEY) {
      await patchArticle(row.id, { is_relevant: false });
      row.is_relevant = false;
      archived++;
      continue;
    }

    rewritesDone++;
    const sourceSummary = plainTextFromHtml(row.body) || row.title;
    const { body, relevant } = await rewriteWithClaude(row.title, sourceSummary);
    if (!relevant || !bodyIsValidNewsBody(body)) {
      await patchArticle(row.id, { is_relevant: false });
      row.is_relevant = false;
      archived++;
      continue;
    }

    await patchArticle(row.id, { body: plainTextFromHtml(body), is_relevant: true });
    row.body = body;
    row.is_relevant = true;
    rewritten++;
  }

  if (archived || rewritten) {
    console.log(`News repair: ${rewritten} rewritten, ${archived} archived`);
  }
}

async function archiveIrrelevantTitles(stored) {
  for (const row of stored || []) {
    if (!row.id || row.is_relevant === false) continue;
    if (!titleIsLikelyIrrelevant(row.title)) continue;
    await patchArticle(row.id, { is_relevant: false });
    row.is_relevant = false;
  }
}

function isCronRequest(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return (req.headers.authorization || '') === `Bearer ${cronSecret}`;
}

async function archiveLeakedArticles(stored) {
  const leakedIds = stored
    .filter(a => String(a.body || '').startsWith('NOT_RELEVANT') && a.id)
    .map(a => a.id);
  if (leakedIds.length === 0) return;
  await fetch(`${SUPABASE_URL}/rest/v1/news_articles?id=in.(${leakedIds.join(',')})`, {
    method: 'PATCH',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_relevant: false }),
  }).catch(() => {});
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800');

  try {
    let freshArticles = [];
    if (isCronRequest(req)) {
      freshArticles = await ingestFreshArticles();
    }

    const stored = await loadStoredArticles();
    await archiveIrrelevantTitles(stored);
    if (isCronRequest(req)) {
      await repairStoredArticles(stored, { rewriteLimit: 8 });
    }
    await archiveLeakedArticles(stored);

    const articles = formatArticles(mergeArticles(freshArticles, stored));
    res.status(200).json({ articles });
  } catch (err) {
    console.error('news handler:', err.message);
    try {
      const stored = await loadStoredArticles();
      const articles = formatArticles(mergeArticles([], stored));
      if (articles.length > 0) {
        return res.status(200).json({ articles, degraded: true });
      }
    } catch {
      // fall through
    }
    res.status(500).json({ error: err.message, articles: [] });
  }
}
