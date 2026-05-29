const BROAD = ['pip', 'personal independence payment', 'disability benefit', 'dwp', 'welfare', 'benefit', 'disabled', 'assessment'];

function mentionsPip(title, summary) {
  const combined = `${title || ''} ${summary || ''}`;
  if (/\bpip\b/i.test(combined)) return true;
  return combined.toLowerCase().includes('personal independence payment');
}

function firstPass(title, summary) {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();
  if (!mentionsPip(title, summary)) return false;
  return BROAD.some((k) => text.includes(k));
}

function parseAtom(xml) {
  const items = [];
  const regex = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const e = m[1];
    const title = ((e.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '').trim();
    const summary = (((e.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim());
    const date = ((e.match(/<published>([^<]+)<\/published>/) || [])[1] || '');
    if (title && firstPass(title, summary)) items.push({ title, date });
  }
  return items;
}

function parseRSS(xml, curated = false) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const item = m[1];
    let title = ((item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
    if (curated) title = title.replace(/\s+-\s+[^-]+$/, '').trim();
    const desc = (((item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim());
    const date = ((item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '');
    if (title && firstPass(title, desc)) items.push({ title, date });
  }
  return items;
}

const SOURCES = [
  { url: 'https://news.google.com/rss/search?q=PIP+personal+independence+payment+UK&hl=en-GB&gl=GB&ceid=GB:en', name: 'Google News PIP', format: 'rss', curated: true },
  { url: 'https://news.google.com/rss/search?q=DWP+PIP+disability+benefit+UK&hl=en-GB&gl=GB&ceid=GB:en', name: 'Google News DWP', format: 'rss', curated: true },
  { url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment', name: 'GOV.UK', format: 'atom' },
];

const all = [];
for (const s of SOURCES) {
  try {
    const res = await fetch(s.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const xml = await res.text();
    const rawCount = s.format === 'atom' ? (xml.match(/<entry>/g) || []).length : (xml.match(/<item>/g) || []).length;
    const parseFn = s.format === 'atom' ? parseAtom : (xml) => parseRSS(xml, s.curated);
    const items = parseFn(xml).slice(0, 8).map((i) => ({ ...i, feed: s.name }));
    console.log(`${s.name}: HTTP ${res.status}, raw entries ${rawCount}, after filter ${items.length}`);
    if (rawCount === 0 && xml.length < 300) console.log('  body:', xml.slice(0, 150));
    all.push(...items);
  } catch (e) {
    console.log(`${s.name}: FAIL ${e.message}`);
  }
}

all.sort((a, b) => new Date(b.date) - new Date(a.date));
console.log(`\nTotal filtered candidates: ${all.length}`);
for (const i of all.slice(0, 20)) {
  const d = i.date ? new Date(i.date).toISOString().slice(0, 10) : '?';
  console.log(`${d} [${i.feed}] ${i.title.slice(0, 90)}`);
}
