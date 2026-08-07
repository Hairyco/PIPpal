#!/usr/bin/env node
/**
 * One-time: open headed Chromium, you Google-sign into Dex, then save session.
 *
 *   cd rex
 *   npm run dex:login
 *
 * Session file: scripts/dex-autofill/.auth/dex-storage.json (gitignored)
 */

import fs from 'node:fs';
import {
  AUTH_DIR,
  STORAGE_STATE,
  DEX_SIGN_IN_URL,
  ensureDirs,
  requirePlaywright,
} from './lib/common.mjs';

const { chromium } = await requirePlaywright();
ensureDirs();

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(DEX_SIGN_IN_URL, { waitUntil: 'domcontentloaded' });

console.log(`
╔══════════════════════════════════════════════════════════╗
║  Dex session login                                       ║
║  1. In the browser window: Sign in with Google           ║
║  2. Finish until you see the Dex marketplace / order form║
║  3. Come back here and press Enter                       ║
╚══════════════════════════════════════════════════════════╝
`);

await new Promise((resolve) => {
  process.stdin.resume();
  process.stdin.once('data', resolve);
});

await context.storageState({ path: STORAGE_STATE });
console.log(`Saved session → ${STORAGE_STATE}`);
await browser.close();

if (!fs.existsSync(STORAGE_STATE)) {
  console.error('Session file missing — try again.');
  process.exit(1);
}

console.log('Next: npm run dex:autofill -- --orderId=<id> --api=https://rex-liart.vercel.app --opsSecret=...');
process.exit(0);
