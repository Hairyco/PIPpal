// api/unsubscribe.js — One-click unsubscribe

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  const email = req.query.email;
  if (!email) return res.status(400).send('Missing email');

  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_notifications: false }),
      }
    );

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Unsubscribed</title></head>
<body style="font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafaf9;">
  <div style="text-align:center;max-width:400px;padding:40px;">
    <div style="font-size:48px;margin-bottom:16px;">✅</div>
    <h1 style="font-size:22px;color:#1c1917;margin-bottom:8px;">You've been unsubscribed</h1>
    <p style="color:#57534e;font-size:14px;line-height:1.6;">You won't receive PIP news emails from PIPpal anymore. You can re-enable them anytime in your account settings.</p>
    <a href="https://www.pippal.uk" style="display:inline-block;margin-top:24px;background:#0f766e;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Go to PIPpal</a>
  </div>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('Something went wrong. Please try again.');
  }
}
