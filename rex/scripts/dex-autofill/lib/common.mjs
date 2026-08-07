/**
 * Shared paths + env for Dex marketplace autofill (local ops only).
 * Never spends money — stops at payment capture / dry-run handoff.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = __dirname;
export const AUTH_DIR = path.join(ROOT, '.auth');
export const OUT_DIR = path.join(ROOT, '.out');
export const STORAGE_STATE = path.join(AUTH_DIR, 'dex-storage.json');

export const DEX_ORDER_URL = 'https://marketplace.dexscreener.com/product/ad/order';
export const DEX_SIGN_IN_URL =
  'https://marketplace.dexscreener.com/sign-in?callbackUrl=https%3A%2F%2Fmarketplace.dexscreener.com%2Fproduct%2Fad%2Forder';

export function ensureDirs() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, ...rest] = a.slice(2).split('=');
      out[k] = rest.length ? rest.join('=') : true;
    } else {
      out._.push(a);
    }
  }
  return out;
}

export async function requirePlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error(
      'Playwright not installed. From rex/: npm install -D playwright && npx playwright install chromium',
    );
    process.exit(1);
  }
}
