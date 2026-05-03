// api/send-digest.js — Weekly PIP news digest email
// Called by Vercel cron or manually from Admin Dashboard

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getSubscribers() {
  // Get all profiles with email notifications enabled
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,name,email,email_notifications`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
    }
  );
  const profiles = await res.json();
  console.log('All profiles:', JSON.stringify(profiles?.slice(0, 2)));
  // Filter to those with notifications on (true or null treated as opted in)
  return (profiles || []).filter(p => p.email_notifications !== false && p.email);
}

const DIGEST_SOURCES = [
  { url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment', name: 'GOV.UK', showSource: true, format: 'atom' },
  { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', name: 'BBC', showSource: false, format: 'rss' },
  { url: 'https://www.mirror.co.uk/money/benefits/rss.xml', name: 'Mirror', showSource: false, format: 'rss' },
  { url: 'https://www.manchestereveningnews.co.uk/rss.xml', name: 'MEN', showSource: false, format: 'rss' },
  { url: 'https://www.birminghammail.co.uk/rss.xml', name: 'Birmingham Live', showSource: false, format: 'rss' },
  { url: 'https://www.liverpoolecho.co.uk/rss.xml', name: 'Liverpool Echo', showSource: false, format: 'rss' },
];

const PIP_KEYWORDS = ['pip', 'personal independence payment', 'disability benefit', 'dwp', 'pip claim', 'pip assessment', 'pip award', 'pip review', 'disability payment', 'pip rate'];

function isPIPRelated(title, summary) {
  const text = (title + ' ' + (summary || '')).toLowerCase();
  return PIP_KEYWORDS.some(k => text.includes(k));
}

function parseDigestAtom(xml) {
  const items = [];
  const regex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const e = match[1];
    const title = (e.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
    const summary = ((e.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim().slice(0, 400);
    const link = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const date = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    if (title && isPIPRelated(title, summary)) items.push({ title: title.trim(), body: summary, link, date });
  }
  return items;
}

function parseDigestRSS(xml) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const desc = ((item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim().slice(0, 400);
    const link = (item.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const date = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || '';
    if (title && isPIPRelated(title, desc)) items.push({ title: title.trim(), body: desc, link, date });
  }
  return items;
}

async function fetchDigestFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PIPpal/1.0)', 'Accept': '*/*' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = source.format === 'atom' ? parseDigestAtom(xml) : parseDigestRSS(xml);
    return items.slice(0, 4).map(item => ({
      ...item,
      source: source.showSource ? source.name : 'PIPpal News',
      link: source.showSource ? item.link : null,
      date: item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    }));
  } catch {
    return [];
  }
}

async function rewriteForEmail(title, body) {
  if (!body || body.length < 20) return body;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [{ role: 'user', content: `Rewrite in PIPpal's voice for a weekly email to PIP claimants. Warm, plain English. 3 sentences. What happened, what it means for claimants, what they should know. No ** or !!.

Title: ${title}
Summary: ${body}` }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || body;
  } catch {
    return body;
  }
}

async function getNewsArticles() {
  try {
    const results = await Promise.all(DIGEST_SOURCES.map(s => fetchDigestFeed(s)));
    const all = results.flat();
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const top = all.slice(0, 5);
    console.log('PIP articles found across all sources:', top.length);
    // Rewrite each article
    const rewritten = await Promise.all(top.map(async item => {
      const rewrittenBody = await rewriteForEmail(item.title, item.body);
      return { ...item, body: rewrittenBody };
    }));
    return rewritten;
  } catch (err) {
    console.log('News fetch error:', err.message);
    return [];
  }
}

function buildEmailHtml(articles, unsubscribeUrl) {
  const articlesHtml = articles.map(article => `
    <tr>
      <td style="padding: 0 0 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:12px; border:1px solid #e7e5e4; overflow:hidden;">
          <tr>
            <td style="padding:16px;">
              <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#0f766e; text-transform:uppercase; letter-spacing:0.05em;">${article.tags?.[0] || 'News'}</p>
              <h3 style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#1c1917; line-height:1.4;">${article.title}</h3>
              <p style="margin:0 0 8px 0; font-size:13px; color:#57534e; line-height:1.6;">${article.body}</p>
              <p style="margin:0; font-size:11px; color:#a8a29e;">${article.date} · ${article.source}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#fafaf9; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#0f766e; border-radius:16px 16px 0 0; padding:24px 28px; text-align:center;">
              <h1 style="margin:0; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">PIPpal</h1>
              <p style="margin:6px 0 0 0; font-size:13px; color:#99f6e4;">Your weekly PIP news digest</p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="background:#ffffff; padding:20px 28px 8px 28px;">
              <p style="margin:0; font-size:14px; color:#44403c; line-height:1.6;">Here are this week's most important PIP updates — written in plain English so you know exactly what matters for your claim.</p>
            </td>
          </tr>

          <!-- Articles -->
          <tr>
            <td style="background:#ffffff; padding:12px 28px 20px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${articlesHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#ffffff; padding:0 28px 28px 28px; text-align:center;">
              <a href="https://www.pippal.uk/#news" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:12px; font-size:14px; font-weight:700;">Read more PIP news →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f4; border-radius:0 0 16px 16px; padding:16px 28px; text-align:center;">
              <p style="margin:0; font-size:11px; color:#a8a29e; line-height:1.6;">
                You're receiving this because you signed up for PIP news updates.<br/>
                <a href="${unsubscribeUrl}" style="color:#0f766e; text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  // Allow GET from cron or POST from admin
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret or admin call
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = req.method === 'POST' ? (req.body || {}) : {};
    const testOnly = body.testOnly === true;

    const [subscribers, articles] = await Promise.all([getSubscribers(), getNewsArticles()]);

    console.log('Subscribers found:', subscribers.length);
    console.log('Articles found:', articles.length);
    console.log('Test only:', testOnly);

    if (articles.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No PIP articles found across all sources' });
    }

    // Test mode — send only to admin
    const recipients = testOnly
      ? subscribers.filter(s => s.email === 'daley_cutler@hotmail.co.uk' || s.email === 'hairyco2@gmail.com')
      : subscribers;

    if (recipients.length === 0) {
      return res.status(200).json({ sent: 0, message: testOnly ? 'Admin email not found in subscribers' : 'No subscribers' });
    }

    let sent = 0;
    let failed = 0;

    for (const subscriber of recipients) {
      try {
        const unsubscribeUrl = `https://www.pippal.uk/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
        const html = buildEmailHtml(articles, unsubscribeUrl);

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'PIPpal News <news@pippal.uk>',
            to: subscriber.email,
            subject: `Your weekly PIP update — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`,
            html,
          }),
        });

        if (emailRes.ok) {
          sent++;
        } else {
          failed++;
          console.log(`Failed to send to ${subscriber.email}: ${emailRes.status}`);
        }
      } catch {
        failed++;
      }
    }

    res.status(200).json({ sent, failed, total: recipients.length, testEmail: testOnly ? recipients[0]?.email : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
