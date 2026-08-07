#!/usr/bin/env node
/**
 * Ops worker: poll CTOgo pending Dex orders → autofill → capture → dry-run settle.
 * Never Live settles unless --live-settle is passed (hold until final PoC).
 *
 *   cd rex
 *   npm run dex:worker -- --opsSecret=… --api=https://rex-liart.vercel.app
 *   npm run dex:worker -- --once --orderId=UUID --opsSecret=…   # single order
 *   npm run dex:worker -- --intervalSec=120 --opsSecret=…
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { OUT_DIR, ensureDirs, parseArgs } from './lib/common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs();
ensureDirs();

const api = String(args.api || process.env.CTOGO_API_BASE || 'https://rex-liart.vercel.app').replace(
  /\/$/,
  '',
);
const opsSecret = args.opsSecret || process.env.MW_OPS_SECRET;
if (!opsSecret) {
  console.error('Need --opsSecret=… or MW_OPS_SECRET');
  process.exit(1);
}

const intervalSec = Math.max(30, Number(args.intervalSec || 90));
const once = Boolean(args.once) || Boolean(args.orderId);
const liveSettle = Boolean(args['live-settle']);
if (liveSettle) {
  console.warn('WARNING: --live-settle will spend real Mainnet USDC. Plan holds this until the very end.');
}

async function listPending() {
  const q = new URLSearchParams({ pending: '1', opsSecret: String(opsSecret) });
  const res = await fetch(`${api}/api/mw-dex-feed?${q}`, {
    headers: { 'x-mw-ops-secret': String(opsSecret) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || res.statusText);
  return body.pending || [];
}

function runAutofill(orderId) {
  const script = path.join(__dirname, 'run.mjs');
  const childArgs = [
    script,
    `--orderId=${orderId}`,
    `--api=${api}`,
    `--opsSecret=${opsSecret}`,
    '--post-capture',
    '--dry-run',
    '--headed',
  ];
  if (liveSettle) childArgs.push('--live-settle');
  if (args.headless === true || args.headless === 'true') {
    const i = childArgs.indexOf('--headed');
    if (i >= 0) childArgs.splice(i, 1);
  }

  return new Promise((resolve) => {
    const child = spawn(process.execPath, childArgs, {
      cwd: path.dirname(__dirname),
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', (code) => resolve(code ?? 1));
  });
}

async function dryRunSettle(orderId) {
  const bodyPayload = { orderId, opsSecret, dryRun: !liveSettle };
  if (liveSettle) bodyPayload.dryRun = false;
  const res = await fetch(`${api}/api/mw-helio-settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mw-ops-secret': String(opsSecret),
    },
    body: JSON.stringify(bodyPayload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || body.reason || res.statusText);
  return body;
}

async function tick() {
  const alertPath = path.join(OUT_DIR, 'NEED_RELOGIN.json');
  if (fs.existsSync(alertPath) && !args['ignore-relogin-alert']) {
    const raw = JSON.parse(fs.readFileSync(alertPath, 'utf8'));
    const ageMs = Date.now() - Date.parse(raw.at || 0);
    if (ageMs < 6 * 60 * 60 * 1000) {
      console.warn('NEED_RELOGIN alert present — fix session (npm run dex:login) before worker continues.');
      console.warn('Delete .out/NEED_RELOGIN.json after login, or pass --ignore-relogin-alert once.');
      return { skipped: 'need_relogin' };
    }
  }

  let targets = [];
  if (args.orderId) {
    targets = [{ orderId: String(args.orderId), hasDeposit: false, hasCharge: false }];
  } else {
    const pending = await listPending();
    targets = pending.slice(0, 3);
  }

  if (!targets.length) {
    console.log('No pending Dex orders.');
    return { skipped: 'empty' };
  }

  const results = [];
  for (const t of targets) {
    const orderId = t.orderId;
    console.log(`Processing order ${orderId} (deposit=${Boolean(t.hasDeposit)} charge=${Boolean(t.hasCharge)})…`);

    if (t.hasDeposit || t.hasCharge) {
      // Already past form — dry-run (or live if flagged) without browser
      try {
        const settle = await dryRunSettle(orderId);
        console.log(
          'Settle:',
          settle.dryRun ? 'dry-run' : 'LIVE',
          settle.deposit?.depositAddress,
          settle.deposit?.depositAmount,
          settle.fees || '',
        );
        results.push({ orderId, mode: 'settle_only', settle, exitCode: 0 });
      } catch (err) {
        console.error('Settle failed:', err.message || err);
        results.push({ orderId, mode: 'settle_only', error: err.message || String(err), exitCode: 1 });
      }
      continue;
    }

    const code = await runAutofill(orderId);
    results.push({ orderId, mode: 'autofill', exitCode: code });
    if (code === 2) {
      return { results, stopped: 'need_relogin' };
    }
  }
  return { results };
}

if (once) {
  const result = await tick();
  const out = path.join(OUT_DIR, `worker-${Date.now()}.json`);
  fs.writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), ...result }, null, 2));
  console.log('Worker result →', out);
  const codes = (result.results || []).map((r) => r.exitCode || 0);
  const worst = result.stopped === 'need_relogin' ? 2 : codes.length ? Math.max(...codes) : 0;
  process.exit(worst);
} else {
  console.log(`Dex worker polling every ${intervalSec}s → ${api} (dry-run only unless --live-settle)`);
  for (;;) {
    try {
      await tick();
    } catch (err) {
      console.error('Worker tick error:', err.message || err);
    }
    await new Promise((r) => setTimeout(r, intervalSec * 1000));
  }
}
