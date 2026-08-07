/**
 * Detect whether the Dex Google session is still usable.
 * Writes NEED_RELOGIN alert files under .out/ when dead.
 */

import fs from 'node:fs';
import path from 'node:path';
import { OUT_DIR, DEX_ORDER_URL, DEX_SIGN_IN_URL, ensureDirs } from './common.mjs';

export const RELOGIN_ALERT = 'NEED_RELOGIN';

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{ ok: boolean, reason?: string, url?: string }>}
 */
export async function checkDexSession(page) {
  await page.goto(DEX_ORDER_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const url = page.url();
  if (/sign-in|accounts\.google|login/i.test(url)) {
    return { ok: false, reason: 'redirected_to_sign_in', url };
  }
  // Soft check: order form chrome present
  const body = (await page.locator('body').innerText().catch(() => '')) || '';
  if (/sign in with google|continue with google/i.test(body) && !/token address|ad package/i.test(body)) {
    return { ok: false, reason: 'google_login_prompt', url };
  }
  return { ok: true, url };
}

/**
 * Persist a clear alert for ops / founder when re-login is required.
 * @param {{ reason: string, orderId?: string | null }} info
 */
export function writeReloginAlert(info) {
  ensureDirs();
  const payload = {
    alert: RELOGIN_ALERT,
    at: new Date().toISOString(),
    reason: info.reason,
    orderId: info.orderId || null,
    action: 'Run: cd rex && npm run dex:login — then retry the worker / autofill.',
    signInUrl: DEX_SIGN_IN_URL,
  };
  const stamp = Date.now();
  const latest = path.join(OUT_DIR, 'NEED_RELOGIN.json');
  const stamped = path.join(OUT_DIR, `NEED_RELOGIN-${stamp}.json`);
  fs.writeFileSync(latest, JSON.stringify(payload, null, 2));
  fs.writeFileSync(stamped, JSON.stringify(payload, null, 2));
  console.error(`
╔══════════════════════════════════════════════════════════╗
║  NEED RELOGIN — Dex Google session expired               ║
║  1. cd rex                                               ║
║  2. npm run dex:login                                    ║
║  3. Sign in with Google, then press Enter                ║
║  4. Re-run the worker / autofill                         ║
╚══════════════════════════════════════════════════════════╝
Alert saved → ${latest}
`);
  return payload;
}
