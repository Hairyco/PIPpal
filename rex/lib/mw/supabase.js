/**
 * Supabase REST helpers for CTOgo marketing wallet (service role).
 * Free to run against your project; requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function mwConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

export function restHeaders(extra = {}) {
  if (!mwConfigured()) {
    throw new Error('Supabase not configured (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra,
  };
}

export async function sbFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...restHeaders(options.headers || {}), ...(options.headers || {}) },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`Supabase ${res.status}: ${msg.slice(0, 400)}`);
  }
  return body;
}

export async function audit(eventType, payload = {}, projectId = null, actorWallet = null) {
  return sbFetch('mw_audit_events', {
    method: 'POST',
    body: JSON.stringify({
      event_type: eventType,
      payload,
      project_id: projectId,
      actor_wallet: actorWallet,
    }),
  });
}
