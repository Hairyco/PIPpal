// api/approve-digest.js
// Called when admin clicks "Approve and send" in test email
// Or called automatically by second cron 1 hour after test

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { token, cancel } = req.query;

  if (!token) return res.status(400).send('Missing token');

  // Check token in Supabase - stored when test was sent
  const { data: digest } = await supabase
    .from('digest_approvals')
    .select('*')
    .eq('token', token)
    .single();

  if (!digest) return res.status(404).send('Invalid or expired approval token');
  if (digest.status === 'sent') return res.status(200).send('Already sent');
  if (digest.status === 'cancelled') return res.status(200).send('Send was cancelled');

  if (cancel === '1') {
    await supabase.from('digest_approvals').update({ status: 'cancelled' }).eq('token', token);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`<!DOCTYPE html><html><body style="font-family:Arial;text-align:center;padding:60px;">
      <h2>✅ Send cancelled</h2>
      <p>The weekly digest will not be sent this week.</p>
      <a href="https://www.pippal.uk">Go to PIPpal</a>
    </body></html>`);
  }

  // Approve — trigger full send
  await supabase.from('digest_approvals').update({ status: 'sent' }).eq('token', token);

  const sendRes = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://www.pippal.uk'}/api/send-digest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testOnly: false, skipApproval: true }),
  });

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html><html><body style="font-family:Arial;text-align:center;padding:60px;">
    <h2>✅ Digest approved and sent</h2>
    <p>The weekly PIP news digest has been sent to all subscribers.</p>
    <a href="https://www.pippal.uk">Go to PIPpal</a>
  </body></html>`);
}
