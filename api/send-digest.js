// api/send-digest.js — Weekly PIP news digest email
// Called by Vercel cron or manually from Admin Dashboard

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Preview (cron) + always copied on subscriber sends — deduped against profiles */
const DIGEST_OWNER_EMAILS = ['daley_cutler@hotmail.co.uk', 'hairyco2@gmail.com'];

function mergeDigestRecipients(subscribers, ownerEmails) {
  const seen = new Set();
  const out = [];
  for (const p of subscribers || []) {
    const email = (p.email || '').trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ email, name: p.name || '' });
  }
  for (const email of ownerEmails) {
    const e = email.trim();
    const key = e.toLowerCase();
    if (!e || seen.has(key)) continue;
    seen.add(key);
    out.push({ email: e, name: 'PIPpal' });
  }
  return out;
}

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

// Strict PIP-only keywords — must include at least one
const PIP_KEYWORDS_REQUIRED = ['pip', 'personal independence payment', 'pip claim', 'pip assessment', 'pip award', 'pip review', 'pip payment', 'pip rate', 'pip claimant', 'pip benefit', 'pip change', 'pip cut', 'pip reform', 'pip increase', 'pip tribunal', 'pip appeal', 'pip disability'];
// Secondary keywords — only valid alongside a required keyword
const PIP_KEYWORDS_SECONDARY = ['disability benefit', 'disability payment'];

function isPIPRelated(title, summary) {
  const titleLower = title.toLowerCase();
  const bodyLower = (summary || '').toLowerCase();
  const fullText = titleLower + ' ' + bodyLower;
  // Reject obvious non-PIP content by title
  const rejectTerms = ['marathon', 'fun run', 'charity run', 'triathlon', 'athletics event'];
  if (rejectTerms.some(t => titleLower.includes(t))) return false;
  // Accept if any PIP keyword appears in full text
  const hasPrimary = PIP_KEYWORDS_REQUIRED.some(k => fullText.includes(k));
  const hasSecondary = PIP_KEYWORDS_SECONDARY.some(k => fullText.includes(k));
  return hasPrimary || hasSecondary;
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
      signal: AbortSignal.timeout(8000),
    });
    console.log(`Feed ${source.name}: status ${res.status}`);
    if (!res.ok) return [];
    const xml = await res.text();
    const allItems = source.format === 'atom' ? parseDigestAtom(xml) : parseDigestRSS(xml);
    console.log(`Feed ${source.name}: ${allItems.length} PIP articles`);
    return allItems.slice(0, 4).map(item => ({
      ...item,
      source: source.showSource ? source.name : 'PIPpal News',
      link: source.showSource ? item.link : null,
      date: item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    }));
  } catch (err) {
    console.log(`Feed ${source.name} error: ${err.message}`);
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
        messages: [{ role: 'user', content: `Write a 3-sentence news summary for PIP claimants. Start directly with what happened. Then explain what it means for PIP claimants. Then state what they should know or do. No greetings. No sign-off. Plain English. No ** or !!.

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

function buildEmailHtml(articles, unsubscribeUrl, approvalToken = null, blogPosts = []) {
  const top3Blogs = blogPosts.slice(0, 3);

  const blogsHtml = top3Blogs.map(post => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:12px; border:1px solid #e7e5e4; overflow:hidden; margin-bottom:16px;">
      <tr><td style="height:3px; background:#f97316;"></td></tr>
      <tr>
        <td style="padding:16px;">
          ${post.category ? `<p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#f97316; text-transform:uppercase; letter-spacing:0.05em;">${post.category}</p>` : ''}
          <h3 style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#1c1917; line-height:1.4;">${post.title}</h3>
          ${post.excerpt ? `<p style="margin:0 0 10px 0; font-size:13px; color:#57534e; line-height:1.6;">${post.excerpt.slice(0, 150)}...</p>` : ''}
          <a href="https://www.pippal.uk" style="display:inline-block; background:#f97316; color:#ffffff; text-decoration:none; padding:8px 18px; border-radius:8px; font-size:12px; font-weight:700;">Read this guide →</a>
        </td>
      </tr>
    </table>
  `).join('');
  const articlesHtml = articles.slice(0, 3).map(article => {
    const body = article.body || '';
    const sentences = body.split(/(?<=[.!?])\s+/);
    const teaser = sentences.slice(0, 2).join(' ').trim() || body.slice(0, 140);
    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:12px; border:1px solid #e7e5e4; overflow:hidden; margin-bottom:14px;">
      <tr><td style="height:3px; background:#0f766e;"></td></tr>
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#0f766e; text-transform:uppercase; letter-spacing:0.05em;">${article.tags?.[0] || 'News'} · ${article.date}</p>
          <h3 style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#1c1917; line-height:1.4;">${article.title}</h3>
          <p style="margin:0 0 12px 0; font-size:13px; color:#57534e; line-height:1.6;">${teaser}</p>
          <a href="https://www.pippal.uk" style="font-size:12px; font-weight:700; color:#0f766e; text-decoration:none;">Read more on PIPpal →</a>
        </td>
      </tr>
    </table>
  `; }).join('');

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

          <!-- Blog section -->
          ${top3Blogs.length > 0 ? `
          <tr>
            <td style="background:#fff7ed; padding:20px 28px 8px 28px;">
              <h2 style="margin:0 0 4px 0; font-size:16px; font-weight:800; color:#1c1917;">📖 From the PIPpal Blog</h2>
              <p style="margin:0 0 16px 0; font-size:12px; color:#78716c;">Guides and tips to help with your PIP claim</p>
              ${blogsHtml}
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="background:#ffffff; padding:20px 28px 28px 28px; text-align:center;">
              ${approvalToken ? `
              <p style="font-size:13px;color:#78716c;margin:0 0 16px 0;font-weight:600;">⚠️ This is a preview — review and approve before it sends</p>
              <a href="https://www.pippal.uk/api/approve-digest?token=${approvalToken}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;">📋 Review &amp; Approve Digest</a>
              ` : `<a href="https://www.pippal.uk/#news" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:12px; font-size:14px; font-weight:700;">Read more PIP news →</a>`}
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
    // Cron invokes GET with Bearer CRON_SECRET — preview-only (no query string in vercel.json cron paths).
    // Admin dashboard uses POST with explicit testOnly / articles / blogPosts.
    const testOnly =
      req.method === 'POST' ? body.testOnly === true : true;
    const blogPosts = body.blogPosts || [];

    // Accept pre-fetched articles from client (since Vercel blocks outbound RSS fetches)
    const clientArticles = body.articles || null;

    const [subscribers, serverArticles] = await Promise.all([getSubscribers(), clientArticles ? Promise.resolve([]) : getNewsArticles()]);
    const articles = clientArticles || serverArticles;

    console.log('Subscribers found:', subscribers.length);
    console.log('Articles found:', articles.length);
    console.log('Test only:', testOnly);

    if (articles.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No PIP articles found across all sources' });
    }

    const recipients = testOnly
      ? DIGEST_OWNER_EMAILS.map(email => ({ email, name: 'Daley' }))
      : mergeDigestRecipients(subscribers, DIGEST_OWNER_EMAILS);

    if (recipients.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No recipients (check DIGEST_OWNER_EMAILS / subscribers)' });
    }

    let sent = 0;
    let failed = 0;

    // Store articles in Supabase for approval flow
    const approvalToken = testOnly ? Math.random().toString(36).slice(2) + Date.now().toString(36) : null;

    if (testOnly && approvalToken) {
      // Save pending digest to Supabase
      await fetch(
        `${process.env.VITE_SUPABASE_URL}/rest/v1/digest_pending`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ token: approvalToken, articles, status: 'pending' }),
        }
      );
    }

    for (const subscriber of recipients) {
      try {
        const unsubscribeUrl = `https://www.pippal.uk/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
        const html = buildEmailHtml(articles, unsubscribeUrl, testOnly ? approvalToken : null, blogPosts);

        console.log(`Attempting to send to: ${subscriber.email}`);
        const emailPayload = {
          from: 'PIPpal News <news@pippal.uk>',
          to: subscriber.email,
          subject: `Your weekly PIP update — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`,
          html,
        };
        console.log('Resend payload to:', emailPayload.to, 'from:', emailPayload.from);

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(emailPayload),
        });

        const emailData = await emailRes.json();
        console.log(`Resend response for ${subscriber.email}:`, emailRes.status, JSON.stringify(emailData));

        if (emailRes.ok) {
          sent++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    const testEmail = testOnly ? (recipients.find(r => r.email) || {}).email || 'admin' : null;
    // Log the send
    if (!testOnly && sent > 0) {
      await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/email_sends`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ type: 'digest', subject: `Weekly PIP digest — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`, recipient_count: sent }),
      });
    }
    res.status(200).json({ sent, failed, total: recipients.length, testEmail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
