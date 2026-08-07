#!/usr/bin/env node
/**
 * Seed a queued Dex Token Ad order (ops secret) for autofill dry-run.
 *   node scripts/ops-wallets/seed-dex-order.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rexRoot = path.resolve(__dirname, '../..');

function loadEnvFile(p) {
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    let v = line.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[line.slice(0, i)] = v;
  }
  return out;
}

const env = { ...loadEnvFile(path.join(rexRoot, '.env.local')), ...process.env };
const secret = String(env.MW_OPS_SECRET || '').trim();
const api = env.CTOGO_API || 'https://rex-liart.vercel.app';
if (!secret || secret.length < 16) {
  console.error('MW_OPS_SECRET missing');
  process.exit(1);
}

const mint = process.env.DEX_MINT || process.argv.find((a) => a.startsWith('--mint='))?.slice(7);
const body = {
  action: 'seed_dex_order',
  opsSecret: secret,
  offerKey: 'dex-token-ad-20k',
  ticker: 'CTOGO',
};
if (mint) {
  body.mint = mint;
  body.dexMint = mint;
}

const res = await fetch(`${api}/api/mw-dex-feed`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-mw-ops-secret': secret,
  },
  body: JSON.stringify(body),
});
const json = await res.json().catch(() => ({}));
console.log(JSON.stringify({ status: res.status, ...json }, null, 2));
if (!res.ok || !json.orderId) process.exit(1);
