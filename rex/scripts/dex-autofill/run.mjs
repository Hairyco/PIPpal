#!/usr/bin/env node
/**
 * Dex Token Ad autofill — free automation proof.
 *
 * Loads a saved Google session, fills the order form from a CTOgo sheet,
 * submits to the payment page, captures Helio QR/charge when possible,
 * and STOPS. Never Live settles / never spends Mainnet USDC.
 *
 * Usage:
 *   cd rex
 *   npm run dex:login
 *   npm run dex:autofill -- --orderId=UUID --api=https://rex-liart.vercel.app --opsSecret=SECRET
 *   npm run dex:autofill -- --fill-json=./scripts/dex-autofill/.out/sheet.json
 *   npm run dex:autofill -- --orderId=UUID ... --no-submit   # fill only
 *   npm run dex:autofill -- --orderId=UUID ... --headed      # watch the browser
 *
 * Optional: POST capture back to CTOgo with --post-capture
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  STORAGE_STATE,
  OUT_DIR,
  DEX_ORDER_URL,
  ensureDirs,
  parseArgs,
  requirePlaywright,
} from './lib/common.mjs';
import { fillTokenAdForm } from './lib/fillOrderForm.mjs';
import { capturePaymentPage } from './lib/capturePayment.mjs';

const args = parseArgs();
ensureDirs();

if (!fs.existsSync(STORAGE_STATE)) {
  console.error('No saved Dex session. Run: npm run dex:login');
  process.exit(1);
}

async function loadSheet() {
  if (args['fill-json']) {
    const raw = fs.readFileSync(path.resolve(String(args['fill-json'])), 'utf8');
    const data = JSON.parse(raw);
    return data.sheet || data;
  }
  const orderId = args.orderId;
  const api = String(args.api || process.env.CTOGO_API_BASE || 'https://rex-liart.vercel.app').replace(
    /\/$/,
    '',
  );
  const opsSecret = args.opsSecret || process.env.MW_OPS_SECRET;
  if (!orderId) {
    console.error('Need --orderId=… or --fill-json=…');
    process.exit(1);
  }
  if (!opsSecret) {
    console.error('Need --opsSecret=… or MW_OPS_SECRET');
    process.exit(1);
  }
  const res = await fetch(`${api}/api/mw-dex-feed?orderId=${encodeURIComponent(orderId)}`, {
    headers: { 'x-mw-ops-secret': String(opsSecret) },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || res.statusText);
  const sheetPath = path.join(OUT_DIR, `sheet-${orderId}.json`);
  fs.writeFileSync(sheetPath, JSON.stringify(body, null, 2));
  console.log(`Sheet saved → ${sheetPath}`);
  return body.sheet;
}

async function postCapture(api, opsSecret, orderId, capture) {
  const res = await fetch(`${api}/api/mw-dex-feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mw-ops-secret': String(opsSecret),
    },
    body: JSON.stringify({
      action: 'capture',
      orderId,
      chargeUrl: capture.chargeUrl || undefined,
      depositAddress: capture.depositAddress || undefined,
      depositAmount: capture.depositAmount || undefined,
      opsSecret,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || res.statusText);
  return body;
}

const sheet = await loadSheet();
if (!sheet?.ready && sheet?.hardMissing?.length) {
  console.warn('Sheet incomplete:', sheet.hardMissing.join(', '));
  console.warn('Continuing anyway — fill may fail on missing fields.');
}

const { chromium } = await requirePlaywright();
const headed = Boolean(args.headed) || args.headless === 'false';
const browser = await chromium.launch({ headless: !headed });
const context = await browser.newContext({ storageState: STORAGE_STATE });
const page = await context.newPage();

const result = {
  startedAt: new Date().toISOString(),
  orderId: sheet.orderId || args.orderId || null,
  fillNotes: [],
  capture: null,
  paid: false,
  stopReason: 'capture_complete_no_pay',
};

try {
  await page.goto(DEX_ORDER_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  if (/sign-in|login/i.test(page.url())) {
    result.stopReason = 'session_expired';
    console.error('Session expired — run npm run dex:login again.');
    await page.screenshot({ path: path.join(OUT_DIR, 'session-expired.png'), fullPage: true });
    process.exitCode = 2;
  } else {
    const submit = !args['no-submit'];
    const fillResult = await fillTokenAdForm(page, sheet, { submit });
    result.fillNotes = fillResult.notes;
    console.log('Fill notes:\n ', fillResult.notes.join('\n  '));

    await page.screenshot({
      path: path.join(OUT_DIR, `after-fill-${Date.now()}.png`),
      fullPage: true,
    });

    if (submit && /\/payment/i.test(page.url())) {
      const capture = await capturePaymentPage(page, {
        amountUsd: sheet.fill?.packagePriceUsd || null,
      });
      result.capture = capture;
      console.log('Capture notes:\n ', capture.notes.join('\n  '));
      console.log('chargeUrl:', capture.chargeUrl || '(paste manually)');
      console.log('depositAddress:', capture.depositAddress || '(paste manually)');

      if (args['post-capture'] && result.orderId && (capture.chargeUrl || capture.depositAddress)) {
        const api = String(args.api || process.env.CTOGO_API_BASE || 'https://rex-liart.vercel.app').replace(
          /\/$/,
          '',
        );
        const opsSecret = args.opsSecret || process.env.MW_OPS_SECRET;
        const posted = await postCapture(api, opsSecret, result.orderId, capture);
        result.posted = posted;
        console.log('Posted capture to CTOgo:', posted.next || 'ok');
      }
    } else if (submit) {
      result.stopReason = 'payment_page_not_reached';
      console.warn('Did not reach /payment — check screenshots in .out/');
    } else {
      result.stopReason = 'no_submit';
    }
  }
} catch (err) {
  result.stopReason = 'error';
  result.error = err.message || String(err);
  console.error(err);
  await page.screenshot({ path: path.join(OUT_DIR, 'error.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  const outPath = path.join(OUT_DIR, `run-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\nResult → ${outPath}`);
  console.log('Money spent: $0 (script never Live settles).');
  console.log('Next free proof: Dry-run settle on /ops/dex-feed');
  await browser.close();
}
