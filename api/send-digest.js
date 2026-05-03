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

async function getNewsArticles() {
  // Fetch directly from GOV.UK RSS — don't call /api/news internally
  try {
    const res = await fetch(
      'https://www.gov.uk/search/news-and-communications.atom?keywords=PIP+personal+independence+payment',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PIPpal/1.0)', 'Accept': '*/*' }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null && entries.length < 5) {
      const entry = match[1];
      const title = (entry.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
      const summary = ((entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim().slice(0, 300);
      const link = (entry.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
      const published = (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
      if (title) entries.push({ title, body: summary, link, source: 'GOV.UK', date: published ? new Date(published).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '', tags: ['Official'] });
    }
    console.log('GOV.UK articles fetched:', entries.length);
    return entries;
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
              <a href="https://www.pippal.uk" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:12px; font-size:14px; font-weight:700;">Visit PIPpal →</a>
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
    const [subscribers, articles] = await Promise.all([getSubscribers(), getNewsArticles()]);

    console.log('Subscribers found:', subscribers.length);
    console.log('Articles found:', articles.length);

    if (!subscribers || subscribers.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No subscribers' });
    }

    if (articles.length === 0) {
      // Send with placeholder if no articles
      console.log('No articles — sending anyway with placeholder');
    }

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        const unsubscribeUrl = `https://www.pippal.uk/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
        const html = buildEmailHtml(articles, unsubscribeUrl);

        // With onboarding@resend.dev, Resend only allows sending to verified emails
        // Skip non-admin emails until domain is verified
        const isAdminEmail = subscriber.email === 'daley_cutler@hotmail.co.uk';
        if (!isAdminEmail) {
          console.log(`Skipping ${subscriber.email} — domain not verified yet`);
          continue;
        }

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'PIPpal News <onboarding@resend.dev>',
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

    res.status(200).json({ sent, failed, total: subscribers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
