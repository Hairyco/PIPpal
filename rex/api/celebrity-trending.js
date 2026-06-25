const FEEDS = [
  'https://news.google.com/rss/search?q=celebrity+news+when:3d&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=entertainment+celebrity+gossip+when:3d&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=hollywood+celebrity+when:3d&hl=en-US&gl=US&ceid=US:en',
];

const SKIP_TITLE = [
  'recipe',
  'weather',
  'stock market',
  'election',
  'nfl draft',
  'nba playoffs',
  'premier league',
];

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

function plainTextFromHtml(input) {
  if (!input || typeof input !== 'string') return '';
  let s = decodeHtmlEntities(input);
  s = s.replace(/<[^>]+>/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

function cleanGoogleNewsTitle(title) {
  return title.replace(/\s+-\s+[^-]+$/, '').trim();
}

const VERB_PATTERN =
  /\s+(says|said|announces|announced|reveals|revealed|spotted|breaks|shares|shared|posts|posted|files|filed|wins|won|loses|lost|dies|died|marries|married|splits|split|dating|debuts|returns|slams|claps back|responds|addresses|opens up|speaks out|makes|made|are approaching|is facing|has been|was seen|brings|looks|spotlights)\b/i;

const LEADING_FILLER =
  /^(How|What|Why|Where|When|Who|Inside|Watch|See|Look|All About|Everything to Know About|The Latest on|A Look at|Disturbing|Shocking)\s+/i;

const NAME_PATTERN = /^[A-Z][\p{L}.'-]+(?:\s+[A-Z][\p{L}.'-]+){0,2}$/u;

function normalizeCelebrity(name) {
  return name
    .replace(/'s$/i, '')
    .replace(/\s+Faces$/i, '')
    .replace(/^ABC's\s+/i, '')
    .trim();
}

function namesFromListSection(text) {
  const cleaned = text.replace(/ and more.*/i, '').replace(/ more celebrity.*/i, '');
  const parts = cleaned.split(/,|\sand\s/).map((s) => s.trim());
  return parts.find((part) => NAME_PATTERN.test(part));
}

function extractCelebrity(title) {
  let t = cleanGoogleNewsTitle(title);
  t = t.replace(/^(Breaking|Exclusive|Watch|Photos?|Video|Report|Opinion|Review):\s*/i, '');
  t = t.replace(LEADING_FILLER, '');
  t = t.replace(
    /^(Disheveled|Stunning|Surprising|Bold|Rare|Latest|Inside|All the Details on)\s+/i,
    '',
  );
  t = t.replace(/^[A-Z]{2,}['']s\s+/i, '');

  if (/premiere|red carpet|celebrity style|fashion week/i.test(t)) {
    const namesSection = t.match(/:\s*(.+)$/);
    if (namesSection) {
      const name = namesFromListSection(namesSection[1]);
      if (name) return normalizeCelebrity(name);
    }
  }

  const verbIdx = t.search(VERB_PATTERN);
  if (verbIdx > 3) t = t.slice(0, verbIdx).trim();
  const andIdx = t.search(/\s+and\s+/i);
  if (andIdx > 3 && andIdx < 35) t = t.slice(0, andIdx).trim();
  const comma = t.indexOf(',');
  if (comma > 3 && comma < 40) t = t.slice(0, comma).trim();
  const nameMatch = t.match(/^([A-Z][\p{L}.'-]+(?:\s+[A-Z][\p{L}.'-]+){0,2})/u);
  if (nameMatch && !/^(The|A|An|In|On|At|For|With)\b/.test(nameMatch[1])) {
    return normalizeCelebrity(nameMatch[1].trim());
  }
  return normalizeCelebrity(t.split(/[:\-–|]/)[0].trim().slice(0, 48));
}

const BLOCKED_NAMES = new Set([
  'celebrities',
  'celebrity',
  'hollywood',
  'entertainment',
  'fox news',
  'cnn',
  'nbc',
  'abc news',
  'people magazine',
]);

function isValidCelebrity(name) {
  const normalized = normalizeCelebrity(name);
  if (!normalized || normalized.length < 3 || normalized.length > 40) return false;
  if (BLOCKED_NAMES.has(normalized.toLowerCase())) return false;
  if (/premiere|photos?|style|fashion|hollywood|celebrity news|invite|incident|details revealed/i.test(normalized)) {
    return false;
  }
  if (/^['"‘]/.test(normalized)) return false;
  return NAME_PATTERN.test(normalized);
}

function parseRSS(xml) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const item = match[1];
    const titleRaw =
      (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const descRaw =
      (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] ||
      '';
    const link = (item.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const date = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '';
    const publisher = decodeHtmlEntities(
      ((item.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '').trim(),
    );
    const headline = plainTextFromHtml(titleRaw.trim());
    const summary = plainTextFromHtml(descRaw).slice(0, 220);
    if (!headline) continue;
    const lower = headline.toLowerCase();
    if (SKIP_TITLE.some((s) => lower.includes(s))) continue;
    const celebrity = normalizeCelebrity(extractCelebrity(headline));
    if (!isValidCelebrity(celebrity)) continue;
    items.push({
      id: link || headline,
      celebrity,
      headline: cleanGoogleNewsTitle(headline),
      summary,
      link,
      source: publisher || 'Google News',
      date: date
        ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '',
    });
  }
  return items;
}

async function fetchFeed(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RexTrending/1.0)',
        Accept: 'application/rss+xml, application/xml, */*',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    return parseRSS(await res.text());
  } catch {
    return [];
  }
}

function dedupeTrends(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = item.celebrity.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  try {
    const batches = await Promise.all(FEEDS.map((url) => fetchFeed(url)));
    const merged = dedupeTrends(batches.flat()).slice(0, 12);
    res.status(200).json({
      trends: merged,
      scannedAt: new Date().toISOString(),
      source: 'live',
    });
  } catch (err) {
    res.status(500).json({ error: err.message, trends: [] });
  }
}
