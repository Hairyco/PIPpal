#!/usr/bin/env node
/**
 * Ops status: pending Dex orders + ops wallet pool (no secrets printed).
 *   node scripts/ops-wallets/check-status.mjs
 * Reads MW_OPS_SECRET from .env.vercel.pull or env.
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

const fileEnv = {
  ...loadEnvFile(path.join(rexRoot, '.env.vercel.pull')),
  ...loadEnvFile(path.join(rexRoot, '.env.local')),
};
function usableSecret(v) {
  const s = String(v || '').trim();
  if (!s || s === '[Encrypted]' || s.length < 16) return '';
  return s;
}
const secret =
  usableSecret(process.env.MW_OPS_SECRET) || usableSecret(fileEnv.MW_OPS_SECRET);
const api = process.env.CTOGO_API || 'https://rex-liart.vercel.app';
console.log({
  source: usableSecret(process.env.MW_OPS_SECRET)
    ? 'process.env'
    : usableSecret(fileEnv.MW_OPS_SECRET)
      ? 'env-file'
      : 'none',
  secretLen: secret ? secret.length : 0,
  processEnvLen: String(process.env.MW_OPS_SECRET || '').length,
});
if (!secret) {
  console.error(
    'MW_OPS_SECRET missing or masked ([Encrypted]). Use: npx vercel env run -e production -- node … OR paste into .env.local',
  );
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'x-mw-ops-secret': secret,
};

const feedRes = await fetch(
  `${api}/api/mw-dex-feed?${new URLSearchParams({ pending: '1', opsSecret: secret })}`,
  { headers },
);
const feed = await feedRes.json().catch(() => ({}));
console.log('feedStatus', feedRes.status);
const pending = feed.pending || feed.orders || feed.items || [];
console.log('pendingCount', Array.isArray(pending) ? pending.length : 'n/a');
console.log('feedKeys', Object.keys(feed));
if (Array.isArray(pending)) {
  for (const o of pending.slice(0, 15)) {
    const pi = o.payment_instruction || o.creatives?.paymentInstruction || {};
    console.log(
      JSON.stringify({
        id: o.orderId || o.id,
        status: o.status,
        mint: o.mint || o.creatives?.dexMint || o.project_mint,
        priceUsd: o.priceUsd || o.creatives?.priceUsd || o.invoice_usd,
        hasCharge: Boolean(o.hasCharge || pi.chargeUrl || o.creatives?.chargeUrl),
        hasDeposit: Boolean(o.hasDeposit || pi.depositAddress || o.creatives?.depositAddress),
        packageLabel: o.offer || o.creatives?.packageLabel,
      }),
    );
  }
}

const wr = await fetch(`${api}/api/mw-ops-wallets?opsSecret=${encodeURIComponent(secret)}`, {
  headers,
});
const wbody = await wr.json().catch(() => ({}));
console.log('walletsStatus', wr.status);
console.log(
  JSON.stringify(
    {
      ok: wbody.ok,
      minActive: wbody.minActive,
      health: wbody.health,
      hint: wbody.hint,
      error: wbody.error,
      wallets: (wbody.wallets || []).map((x) => ({
        label: x.label,
        publicKey: x.publicKey,
        status: x.status,
        priority: x.priority,
        secretEnvKey: x.secretEnvKey,
      })),
    },
    null,
    2,
  ),
);
