/** Owner inboxes — weekly preview + approval only (not counted as digest subscribers) */
export const DIGEST_OWNER_EMAILS = ['daley_cutler@hotmail.co.uk', 'hairyco2@gmail.com'];

export function isDigestOwnerEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  return DIGEST_OWNER_EMAILS.some((owner) => owner.toLowerCase() === e);
}

/** Real digest audience — opted-in profiles excluding owner emails */
export function filterDigestSubscribers(profiles) {
  return (profiles || []).filter(
    (p) => p.email_notifications !== false && p.email && !isDigestOwnerEmail(p.email),
  );
}

export function mergeDigestRecipients(subscribers, ownerEmails = DIGEST_OWNER_EMAILS) {
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
