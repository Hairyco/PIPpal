// api/send-blog.js — Send a single blog post to all subscribers

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getSubscribers() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=email,name`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );
  const profiles = await res.json();
  return (profiles || []).filter(p => p.email_notifications !== false && p.email);
}

function buildBlogEmailHtml(post, unsubscribeUrl) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr><td style="background:#0f766e;border-radius:16px 16px 0 0;padding:24px 28px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">PIPpal</h1>
          <p style="margin:6px 0 0 0;font-size:13px;color:#99f6e4;">New guide from the PIPpal blog</p>
        </td></tr>
        <tr><td style="background:#fff7ed;padding:20px 28px 8px 28px;">
          ${post.category ? `<p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:0.05em;">${post.category}</p>` : ''}
          <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:800;color:#1c1917;line-height:1.3;">${post.title}</h2>
          ${post.excerpt ? `<p style="margin:0 0 16px 0;font-size:14px;color:#57534e;line-height:1.7;">${post.excerpt}</p>` : ''}
          <a href="https://www.pippal.uk" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;">Read the full guide →</a>
        </td></tr>
        <tr><td style="background:#fff;padding:20px 28px 28px 28px;text-align:center;">
          <p style="margin:0 0 12px 0;font-size:14px;color:#44403c;">PIPpal helps thousands of claimants complete their PIP form with a <strong>94% success rate</strong> in just 15–30 minutes.</p>
          <a href="https://www.pippal.uk" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:700;">Start my PIP claim — £12.99</a>
        </td></tr>
        <tr><td style="background:#f5f5f4;border-radius:0 0 16px 16px;padding:16px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#a8a29e;line-height:1.6;">
            You're receiving this because you signed up for PIP updates from PIPpal.<br/>
            <a href="${unsubscribeUrl}" style="color:#0f766e;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { post, testOnly } = req.body || {};
  if (!post?.title) return res.status(400).json({ error: 'Post required' });

  try {
    const allSubscribers = await getSubscribers();
    const recipients = testOnly
      ? allSubscribers.filter(s => s.email === 'daley_cutler@hotmail.co.uk' || s.email === 'hairyco2@gmail.com')
      : allSubscribers;

    let sent = 0, failed = 0;
    for (const sub of recipients) {
      try {
        const unsubUrl = `https://www.pippal.uk/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
        const res2 = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: 'PIPpal <news@pippal.uk>',
            to: sub.email,
            subject: `New PIPpal Guide: ${post.title}`,
            html: buildBlogEmailHtml(post, unsubUrl),
          }),
        });
        if (res2.ok) sent++; else failed++;
      } catch { failed++; }
    }

    // Log the send
    if (!testOnly && sent > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/email_sends`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ type: 'blog', subject: `New PIPpal Guide: ${post.title}`, recipient_count: sent }),
      });
    }
    res.status(200).json({ sent, failed, testOnly });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
