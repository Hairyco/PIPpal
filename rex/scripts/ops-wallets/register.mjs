#!/usr/bin/env node
/**
 * Register local ops payer pubkeys with Production API.
 * Requires MW_OPS_SECRET in .env.local and MW_OPS_WALLET_* already on Vercel (redeployed).
 *
 *   node scripts/ops-wallets/register.mjs
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
if (!secret || secret === '[Encrypted]' || secret.length < 16) {
  console.error('MW_OPS_SECRET missing in .env.local — run bootstrap-vercel-env.mjs first');
  process.exit(1);
}

const doc = JSON.parse(
  fs.readFileSync(path.join(__dirname, '.secrets', 'ops-wallets.json'), 'utf8'),
);

const headers = {
  'Content-Type': 'application/json',
  'x-mw-ops-secret': secret,
};

for (const w of doc.wallets) {
  const res = await fetch(`${api}/api/mw-ops-wallets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'register',
      label: w.label,
      publicKey: w.publicKey,
      secretEnvKey: w.secretEnvKey,
      priority: w.priority,
      opsSecret: secret,
      notes: 'Registered by register.mjs from local generate',
    }),
  });
  const body = await res.json().catch(() => ({}));
  console.log(
    JSON.stringify({
      label: w.label,
      publicKey: w.publicKey,
      status: res.status,
      ok: body.ok,
      error: body.error,
      health: body.health,
    }),
  );
}

const list = await fetch(`${api}/api/mw-ops-wallets?opsSecret=${encodeURIComponent(secret)}`, {
  headers,
});
const listed = await list.json().catch(() => ({}));
console.log(
  JSON.stringify(
    {
      listStatus: list.status,
      health: listed.health,
      wallets: (listed.wallets || []).map((x) => ({
        label: x.label,
        publicKey: x.publicKey,
        status: x.status,
        priority: x.priority,
      })),
    },
    null,
    2,
  ),
);
