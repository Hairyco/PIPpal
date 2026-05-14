// api/notify-influencer.js
// Called when a user pays via an influencer link — sends congrats email to influencer

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { influencerCode } = req.body || {};
  if (!influencerCode) return res.status(400).json({ error: 'Code required' });

  try {
    // Get influencer details
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/influencer_codes?code=eq.${influencerCode}&select=*`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const codes = await r.json();
    const influencer = codes?.[0];

    if (!influencer || !influencer.email || !influencer.notify_on_signup) {
      return res.status(200).json({ skipped: true, reason: 'No email or notifications off' });
    }

    // Count their total signups
    const s = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?influencer_source=eq.${influencerCode}&has_paid=eq.true&select=id`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const signups = await s.json();
    const count = signups?.length || 1;
    const commission = (6.99 * (influencer.commission_rate || 20) / 100).toFixed(2);
    const totalEarned = (count * parseFloat(commission)).toFixed(2);

    const unsubUrl = `${SUPABASE_URL}/rest/v1/influencer_codes?id=eq.${influencer.id}`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="background:#0f766e;border-radius:16px 16px 0 0;padding:28px;text-align:center;">
          <p style="font-size:40px;margin:0;">🎉</p>
          <h1 style="margin:8px 0 0;font-size:20px;font-weight:800;color:#fff;">You just earned £${commission}!</h1>
          <p style="margin:6px 0 0;font-size:13px;color:#99f6e4;">Someone signed up to PIPpal through your link</p>
        </td></tr>
        <tr><td style="background:#fff;padding:24px 28px;">
          <p style="margin:0 0 16px;font-size:14px;color:#44403c;line-height:1.6;">
            Hi ${influencer.name}, great news — someone just signed up to PIPpal using your referral link and paid for Full Access.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <td style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
                <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#16a34a;">£${commission}</p>
                <p style="margin:0;font-size:12px;color:#15803d;">earned this signup</p>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding-right:6px;">
                <div style="background:#f5f5f4;border-radius:10px;padding:12px;text-align:center;">
                  <p style="margin:0 0 2px;font-size:18px;font-weight:800;color:#1c1917;">${count}</p>
                  <p style="margin:0;font-size:11px;color:#78716c;">total signups</p>
                </div>
              </td>
              <td width="50%" style="padding-left:6px;">
                <div style="background:#f5f5f4;border-radius:10px;padding:12px;text-align:center;">
                  <p style="margin:0 0 2px;font-size:18px;font-weight:800;color:#1c1917;">£${totalEarned}</p>
                  <p style="margin:0;font-size:11px;color:#78716c;">total earned</p>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#fff;padding:0 28px 24px;text-align:center;">
          <a href="https://www.pippal.uk?partner=true&code=${influencerCode}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:700;">View my stats →</a>
        </td></tr>
        <tr><td style="background:#f5f5f4;border-radius:0 0 16px 16px;padding:14px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#a8a29e;">You're receiving this because you're a PIPpal partner.<br/>
          <a href="https://www.pippal.uk?partner=true&code=${influencerCode}" style="color:#0f766e;">Manage notification settings</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'PIPpal <news@pippal.uk>',
        to: influencer.email,
        subject: `🎉 You just earned £${commission} — someone signed up via your link!`,
        html,
      }),
    });

    res.status(200).json({ sent: true, to: influencer.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
