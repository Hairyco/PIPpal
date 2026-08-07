/**
 * Shared paths + env for Dex marketplace autofill (local ops only).
 * Never spends money — stops at payment capture / dry-run handoff.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.dirname(__dirname);
export const AUTH_DIR = path.join(ROOT, '.auth');
export const OUT_DIR = path.join(ROOT, '.out');
export const STORAGE_STATE = path.join(AUTH_DIR, 'dex-storage.json');
/** Real Chrome/Edge profile dir — Google often blocks Playwright’s bundled Chromium. */
export const USER_DATA_DIR = path.join(AUTH_DIR, 'chrome-profile');

export const DEX_ORDER_URL = 'https://marketplace.dexscreener.com/product/ad/order';
export const DEX_SIGN_IN_URL =
  'https://marketplace.dexscreener.com/sign-in?callbackUrl=https%3A%2F%2Fmarketplace.dexscreener.com%2Fproduct%2Fad%2Forder';

export function ensureDirs() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
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

/**
 * Launch real Chrome (preferred) or Edge so Google OAuth works.
 * Falls back to bundled Chromium only if neither is installed.
 */
export async function launchDexBrowser(playwright, { headless = false } = {}) {
  const { chromium } = playwright;
  const channels = ['chrome', 'msedge', null];
  let lastErr;

  for (const channel of channels) {
    try {
      const opts = {
        headless,
        viewport: { width: 1280, height: 900 },
        ignoreDefaultArgs: ['--enable-automation'],
        args: ['--disable-blink-features=AutomationControlled'],
      };
      if (channel) opts.channel = channel;

      const context = await chromium.launchPersistentContext(USER_DATA_DIR, opts);
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      return {
        context,
        channel: channel || 'chromium',
        async close() {
          await context.close();
        },
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('Could not launch Chrome, Edge, or Chromium');
}

export function sessionReady() {
  return fs.existsSync(STORAGE_STATE) || fs.existsSync(path.join(USER_DATA_DIR, 'Default'));
}
