const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function restHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function isWeeklyDigestActivated() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/email_sends?type=eq.digest_activated&select=id&limit=1`,
      { headers: restHeaders() },
    );
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

export async function markWeeklyDigestActivated() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
  await fetch(`${SUPABASE_URL}/rest/v1/email_sends`, {
    method: 'POST',
    headers: restHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify({
      type: 'digest_activated',
      subject: 'Weekly digest activated — first subscriber',
      recipient_count: 0,
    }),
  }).catch(() => {});
}

export async function loadStoredNewsForDigest(limit = 5) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/news_articles?order=created_at.desc&limit=${limit}&is_relevant=neq.false`,
      { headers: restHeaders() },
    );
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((a) => ({
      title: a.title,
      body: a.body,
      link: a.link,
      source: a.source || 'PIPpal News',
      date: a.date,
      tags: Array.isArray(a.tags) ? a.tags : [a.tags || 'News'],
    }));
  } catch {
    return [];
  }
}

export async function profileExistsForEmail(email) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !email) return false;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    { headers: restHeaders() },
  );
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}
