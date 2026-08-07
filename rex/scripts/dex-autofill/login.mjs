#!/usr/bin/env node
/**
 * One-time: open your real Chrome/Edge (not Playwright Chromium — Google blocks that),
 * you Google-sign into Dex, then save session.
 *
 *   cd rex
 *   npm run dex:login
 *
 * Profile: scripts/dex-autofill/.auth/chrome-profile/ (gitignored)
 * Also writes: scripts/dex-autofill/.auth/dex-storage.json
 */

import fs from 'node:fs';
import {
  STORAGE_STATE,
  USER_DATA_DIR,
  DEX_SIGN_IN_URL,
  ensureDirs,
  requirePlaywright,
  launchDexBrowser,
} from './lib/common.mjs';

ensureDirs();
const playwright = await requirePlaywright();

console.log('Closing any previous login window if still open is fine — starting real Chrome/Edge…');

let browser;
try {
  browser = await launchDexBrowser(playwright, { headless: false });
} catch (err) {
  console.error('Failed to open Chrome/Edge:', err.message || err);
  console.error('Install Google Chrome, then retry. (Playwright Chromium is blocked by Google login.)');
  process.exit(1);
}

const page = browser.context.pages()[0] || (await browser.context.newPage());
await page.goto(DEX_SIGN_IN_URL, { waitUntil: 'domcontentloaded' });

console.log(`
╔══════════════════════════════════════════════════════════╗
║  Dex session login (real Chrome/Edge)                    ║
║  Channel: ${String(browser.channel).padEnd(47)}║
║  1. Sign in with Google in THAT window                   ║
║  2. Stay until Dex marketplace / order form loads        ║
║  3. Come back here and press Enter                       ║
║                                                          ║
║  If Google still says "browser not secure":              ║
║  close other Chrome windows using this profile, or       ║
║  sign in once in normal Chrome to marketplace.dexscreener║
║  then retry.                                             ║
╚══════════════════════════════════════════════════════════╝
Profile: ${USER_DATA_DIR}
`);

await new Promise((resolve) => {
  process.stdin.resume();
  process.stdin.once('data', resolve);
});

await browser.context.storageState({ path: STORAGE_STATE });
console.log(`Saved session cookies → ${STORAGE_STATE}`);
await browser.close();

if (!fs.existsSync(STORAGE_STATE)) {
  console.error('Session file missing — try again.');
  process.exit(1);
}

console.log('Next: npm run dex:autofill -- --orderId=<id> --api=https://rex-liart.vercel.app --opsSecret=... --headed');
process.exit(0);
