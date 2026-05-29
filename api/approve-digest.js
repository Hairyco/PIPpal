// api/approve-digest.js
// Handles article approval/removal and final send

import {
  DIGEST_OWNER_EMAILS,
  filterDigestSubscribers,
  mergeDigestRecipients,
} from '../lib/digest-subscribers.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function getDigest(token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/digest_pending?token=eq.${token}&select=*`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );
  const data = await res.json();
  return data?.[0] || null;
}

async function updateDigest(token, updates) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/digest_pending?token=eq.${token}`,
    {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }
  );
}

async function getSubscribers() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=email,name,email_notifications`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );
  const profiles = await res.json();
  return filterDigestSubscribers(profiles);
}

function buildFinalEmailHtml(articles, unsubscribeUrl) {
  const articlesHtml = articles.map(article => `
    <tr>
      <td style="padding: 0 0 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:12px; border:1px solid #e7e5e4; overflow:hidden;">
          <tr><td style="height:3px; background:#0f766e;"></td></tr>
          <tr>
            <td style="padding:16px;">
              <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; color:#0f766e; text-transform:uppercase; letter-spacing:0.05em;">${article.tags?.[0] || 'News'}</p>
              <h3 style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#1c1917; line-height:1.4;">${article.title}</h3>
              <p style="margin:0 0 8px 0; font-size:13px; color:#57534e; line-height:1.6;">${article.body || article.summary || ''}</p>
              <p style="margin:0; font-size:11px; color:#a8a29e;">${article.date} · ${article.source}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr><td style="background:#0f766e;border-radius:16px 16px 0 0;padding:24px 28px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">PIPpal</h1>
          <p style="margin:6px 0 0 0;font-size:13px;color:#99f6e4;">Your weekly PIP news digest</p>
        </td></tr>
        <tr><td style="background:#fff;padding:20px 28px 8px 28px;">
          <p style="margin:0;font-size:14px;color:#44403c;line-height:1.6;">Here are this week's most important PIP updates — written in plain English so you know exactly what matters for your claim.</p>
        </td></tr>
        <tr><td style="background:#fff;padding:12px 28px 20px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${articlesHtml}</table>
        </td></tr>
        <tr><td style="background:#fff;padding:0 28px 28px 28px;text-align:center;">
          <a href="https://www.pippal.uk" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;">Read more PIP news →</a>
        </td></tr>
        <tr><td style="background:#f5f5f4;border-radius:0 0 16px 16px;padding:16px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#a8a29e;line-height:1.6;">
            You're receiving this because you signed up for PIP news updates.<br/>
            <a href="${unsubscribeUrl}" style="color:#0f766e;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendToAll(articles) {
  const subscribers = await getSubscribers();
  const recipients = mergeDigestRecipients(subscribers, DIGEST_OWNER_EMAILS);
  let sent = 0, failed = 0;
  for (const sub of recipients) {
    try {
      const unsubUrl = `https://www.pippal.uk/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      const html = buildFinalEmailHtml(articles, unsubUrl);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'PIPpal News <news@pippal.uk>',
          to: sub.email,
          subject: `Your weekly PIP update — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`,
          html,
        }),
      });
      if (res.ok) sent++; else failed++;
    } catch { failed++; }
  }
  return { sent, failed };
}

export default async function handler(req, res) {
  const { token, remove, approve, cancel } = req.query;
  if (!token) return res.status(400).send('Missing token');

  const digest = await getDigest(token);
  if (!digest) return res.status(404).send('Invalid or expired token');
  if (digest.status === 'sent') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(page('Already sent', 'This digest has already been sent to subscribers.'));
  }
  if (digest.status === 'cancelled') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(page('Cancelled', 'This digest was cancelled.'));
  }

  let articles = digest.articles || [];

  // Remove an article
  if (remove !== undefined) {
    const idx = parseInt(remove);
    if (!isNaN(idx)) {
      articles = articles.filter((_, i) => i !== idx);
      await updateDigest(token, { articles });
    }
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(buildApprovalPage(token, articles, 'Article removed.'));
  }

  // Cancel
  if (cancel === '1') {
    await updateDigest(token, { status: 'cancelled' });
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(page('Cancelled ✅', 'The digest will not be sent this week.'));
  }

  // Approve and send
  if (approve === '1') {
    if (articles.length === 0) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(buildApprovalPage(token, articles, '⚠️ No articles left — add some before approving.'));
    }
    await updateDigest(token, { status: 'sent' });
    const { sent, failed } = await sendToAll(articles);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(page('Sent ✅', `Digest sent to ${sent} subscribers. ${failed > 0 ? `${failed} failed.` : ''}`));
  }

  // Default — show approval page
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(buildApprovalPage(token, articles));
}

function page(title, message) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;text-align:center;padding:60px;background:#fafaf9;">
    <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <h2 style="color:#0f766e;margin-bottom:12px;">${title}</h2>
      <p style="color:#57534e;font-size:14px;">${message}</p>
      <a href="https://www.pippal.uk" style="display:inline-block;margin-top:24px;background:#0f766e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Go to PIPpal</a>
    </div>
  </body></html>`;
}

function buildApprovalPage(token, articles, message = '') {
  const articleRows = articles.map((a, i) => `
    <div style="border:1px solid #e7e5e4;border-radius:12px;padding:16px;margin-bottom:12px;text-align:left;position:relative;">
      <span style="font-size:10px;font-weight:700;color:#0f766e;text-transform:uppercase;">${a.tags?.[0] || 'News'} · ${a.source}</span>
      <h3 style="margin:6px 0 8px;font-size:14px;font-weight:700;color:#1c1917;line-height:1.4;">${a.title}</h3>
      <p style="margin:0 0 10px;font-size:12px;color:#57534e;line-height:1.6;">${a.body || a.summary || ''}</p>
      <a href="/api/approve-digest?token=${token}&remove=${i}" style="display:inline-block;background:#fee2e2;color:#dc2626;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">❌ Remove this article</a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Approve PIP Digest</title></head>
<body style="font-family:Arial,sans-serif;background:#fafaf9;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#0f766e;border-radius:16px 16px 0 0;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:20px;">📧 Weekly Digest Preview</h1>
      <p style="color:#99f6e4;margin:6px 0 0;font-size:13px;">Review articles before sending to subscribers</p>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e7e5e4;border-top:none;">
      ${message ? `<div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#713f12;">${message}</div>` : ''}
      <p style="font-size:13px;color:#57534e;margin:0 0 16px;">${articles.length} article${articles.length !== 1 ? 's' : ''} ready to send. Remove any that are not relevant, then approve.</p>
      ${articleRows}
      ${articles.length === 0 ? '<p style="text-align:center;color:#a8a29e;font-size:14px;padding:20px;">No articles remaining.</p>' : ''}
    </div>
    <div style="background:#f5f5f4;border-radius:0 0 16px 16px;padding:20px;border:1px solid #e7e5e4;border-top:none;display:flex;gap:12px;justify-content:center;">
      <a href="/api/approve-digest?token=${token}&approve=1" style="background:#0f766e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">✅ Approve &amp; Send to all</a>
      <a href="/api/approve-digest?token=${token}&cancel=1" style="background:#f5f5f4;color:#57534e;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;border:1px solid #e7e5e4;">❌ Cancel</a>
    </div>
  </div>
</body></html>`;
}
