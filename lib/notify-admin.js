/** Admin alert emails when AI / generation endpoints fail (billing, quota, timeouts, etc.) */

const DEFAULT_ADMIN_EMAILS = ['daley_cutler@hotmail.co.uk', 'hairyco2@gmail.com'];

function adminRecipients() {
  const configured = process.env.VITE_ADMIN_EMAIL?.trim();
  const emails = configured ? [configured, ...DEFAULT_ADMIN_EMAILS] : DEFAULT_ADMIN_EMAILS;
  return [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

function classifyError(errorMessage) {
  const msg = String(errorMessage || '').toLowerCase();
  if (msg.includes('insufficient_quota') || msg.includes('billing') || msg.includes('credit')) {
    return 'Credits / billing';
  }
  if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('rate limit')) {
    return 'Rate limit';
  }
  if (msg.includes('401') || msg.includes('invalid_api_key') || msg.includes('authentication')) {
    return 'API key';
  }
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('504')) {
    return 'Timeout';
  }
  if (msg.includes('not configured') || msg.includes('503')) {
    return 'Not configured';
  }
  return 'Other';
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Fire-and-forget admin email. Never throws — safe to void-call from API handlers.
 * @param {{ feature: string, error: unknown, context?: Record<string, unknown>, httpStatus?: number }} opts
 */
export async function notifyAdminAiFailure({ feature, error, context = {}, httpStatus }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn('notifyAdminAiFailure: RESEND_API_KEY not set — skipping alert');
    return;
  }

  const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  const category = classifyError(errorMessage);
  const recipients = adminRecipients();
  if (!recipients.length) return;

  const urgent = category === 'Credits / billing' || category === 'API key';
  const subject = `[PIPpal] AI failure — ${feature}${urgent ? ' — check billing/API' : ''}`;
  const ctxRows = Object.entries(context)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#78716c;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:4px 0;color:#1c1917;">${escapeHtml(typeof v === 'string' ? v : JSON.stringify(v))}</td></tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#fafaf9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e7e5e4;overflow:hidden;">
    <tr><td style="background:${urgent ? '#b45309' : '#0f766e'};padding:16px 20px;">
      <h1 style="margin:0;font-size:16px;color:#fff;">PIPpal AI failure</h1>
      <p style="margin:6px 0 0;font-size:12px;color:#ecfdf5;">${escapeHtml(category)} · ${escapeHtml(feature)}</p>
    </td></tr>
    <tr><td style="padding:20px;">
      <p style="margin:0 0 12px;font-size:13px;color:#44403c;line-height:1.5;">
        A user hit a generation error. If this is <strong>credits / billing</strong>, top up OpenAI or check <code>OPENAI_API_KEY</code> in Vercel.
      </p>
      <p style="margin:0 0 8px;font-size:11px;font-weight:bold;color:#78716c;text-transform:uppercase;">Error</p>
      <pre style="margin:0 0 16px;padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:11px;color:#991b1b;white-space:pre-wrap;word-break:break-word;">${escapeHtml(errorMessage)}</pre>
      ${ctxRows ? `<table style="font-size:12px;margin-bottom:12px;">${ctxRows}</table>` : ''}
      <p style="margin:0;font-size:11px;color:#a8a29e;">HTTP ${httpStatus ?? '—'} · ${new Date().toISOString()}</p>
    </td></tr>
  </table>
</body></html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'PIPpal Alerts <noreply@pippal.uk>',
        to: recipients,
        subject,
        html,
      }),
    });
  } catch (e) {
    console.error('notifyAdminAiFailure send failed:', e.message);
  }
}
