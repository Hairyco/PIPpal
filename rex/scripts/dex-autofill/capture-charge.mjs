#!/usr/bin/env node
/**
 * Open a Helio charge URL and sniff network traffic for the Solana deposit address.
 * Does NOT pay.
 *
 *   cd rex
 *   npm run dex:capture-charge -- --chargeUrl="https://moonpay.hel.io/charge/UUID?network=SOL&deeplink=true"
 *   npm run dex:capture-charge -- --chargeUrl=... --orderId=CTOGO_UUID --api=https://rex-liart.vercel.app --opsSecret=... --post-capture
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  OUT_DIR,
  ensureDirs,
  parseArgs,
  requirePlaywright,
  launchDexBrowser,
} from './lib/common.mjs';
import { parseHelioChargeUrl } from '../../lib/mw/helio.js';
import { installHelioDepositSniffer, waitForHelioDeposit } from './lib/helioIntercept.mjs';

const args = parseArgs();
ensureDirs();

const chargeUrl = String(args.chargeUrl || args._[0] || '').trim();
if (!chargeUrl) {
  console.error('Need --chargeUrl=https://moonpay.hel.io/charge/...');
  process.exit(1);
}

const parsed = parseHelioChargeUrl(chargeUrl);
if (!parsed.ok) {
  console.error(parsed.reason);
  process.exit(1);
}

const playwright = await requirePlaywright();
const headed = Boolean(args.headed) || args.headless === 'false' || true;
const browser = await launchDexBrowser(playwright, { headless: !headed });
const page = browser.context.pages()[0] || (await browser.context.newPage());
const sniffer = installHelioDepositSniffer(page);

console.log('Opening Helio charge (no pay). Sniffing for Solana deposit address…');
const result = await waitForHelioDeposit(page, {
  chargeUrl: parsed.deeplink,
  timeoutMs: Number(args.timeoutMs || 60000),
  sniffer,
});

const out = {
  at: new Date().toISOString(),
  chargeUrl: parsed.deeplink,
  chargeToken: parsed.chargeToken,
  ok: result.ok,
  depositAddress: result.depositAddress,
  depositAmount: result.depositAmount ?? Number(args.amount || 299),
  notes: result.notes,
  hits: result.hits,
  sniffedUrls: result.sniffedUrls,
};

const outPath = path.join(OUT_DIR, `helio-capture-${Date.now()}.json`);
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
console.log(`\nSaved → ${outPath}`);

if (args['post-capture'] && args.orderId && result.depositAddress) {
  const api = String(args.api || process.env.CTOGO_API_BASE || 'https://rex-liart.vercel.app').replace(
    /\/$/,
    '',
  );
  const opsSecret = args.opsSecret || process.env.MW_OPS_SECRET;
  const res = await fetch(`${api}/api/mw-dex-feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mw-ops-secret': String(opsSecret),
    },
    body: JSON.stringify({
      action: 'capture',
      orderId: args.orderId,
      chargeUrl: parsed.deeplink,
      depositAddress: result.depositAddress,
      depositAmount: out.depositAmount,
      opsSecret,
    }),
  });
  const body = await res.json().catch(() => ({}));
  console.log('Posted to CTOgo:', res.status, body);
} else if (args['post-capture'] && !result.depositAddress) {
  console.warn('Skipping post-capture — no deposit address found');
}

await browser.close();
process.exit(result.ok ? 0 : 2);
