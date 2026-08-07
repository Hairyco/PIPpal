#!/usr/bin/env node
/**
 * Dry-run Helio settle for an order (never live unless --live).
 *   node scripts/ops-wallets/settle.mjs --orderId=UUID
 *   node scripts/ops-wallets/settle.mjs --orderId=UUID --live   # REAL USDC
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
const orderId = process.argv.find((a) => a.startsWith('--orderId='))?.slice(10);
const live = process.argv.includes('--live');
if (!secret || !orderId) {
  console.error('Need MW_OPS_SECRET and --orderId=');
  process.exit(1);
}
if (live) {
  console.warn('WARNING: --live spends real Mainnet USDC');
}

const res = await fetch(`${api}/api/mw-helio-settle`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-mw-ops-secret': secret,
  },
  body: JSON.stringify({
    orderId,
    opsSecret: secret,
    dryRun: !live,
  }),
});
const json = await res.json().catch(() => ({}));
console.log(JSON.stringify({ status: res.status, ...json }, null, 2));
if (!res.ok) process.exit(1);
