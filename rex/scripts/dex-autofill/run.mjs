#!/usr/bin/env node
/**
 * Dex Token Ad autofill — unattended path (dry-run by default).
 *
 * Loads a saved Google session, fills the order form from a CTOgo sheet,
 * submits to the payment page, captures Helio charge/deposit, POSTs capture,
 * then dry-run settles. Never Live settles unless --live-settle (hold until final PoC).
 *
 * Usage:
 *   cd rex
 *   npm run dex:login
 *   npm run dex:autofill -- --orderId=UUID --api=https://rex-liart.vercel.app --opsSecret=SECRET
 *   npm run dex:autofill -- --orderId=UUID ... --no-submit
 *   npm run dex:autofill -- --orderId=UUID ... --headed
 *   npm run dex:worker -- --opsSecret=… --once
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OUT_DIR,
  DEX_ORDER_URL,
  ensureDirs,
  parseArgs,
  requirePlaywright,
  launchDexBrowser,
  sessionReady,
} from './lib/common.mjs';
import { fillTokenAdForm } from './lib/fillOrderForm.mjs';
import { capturePaymentPage } from './lib/capturePayment.mjs';
import { checkDexSession, writeReloginAlert } from './lib/sessionHealth.mjs';

function loadEnvLocal() {
  const p = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const k = line.slice(0, i);
    let v = line.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvLocal();

const args = parseArgs();
ensureDirs();

if (!sessionReady()) {
  writeReloginAlert({ reason: 'no_saved_profile', orderId: args.orderId || null });
  process.exit(2);
}

const api = String(args.api || process.env.CTOGO_API_BASE || 'https://rex-liart.vercel.app').replace(
  /\/$/,
  '',
);
const opsSecret = args.opsSecret || process.env.MW_OPS_SECRET;
const wantPostCapture = args['post-capture'] !== false && args['no-post-capture'] !== true;
const wantDryRun = args['dry-run'] !== false && args['no-dry-run'] !== true;
const wantLiveSettle = Boolean(args['live-settle']);

if (wantLiveSettle) {
  console.warn('WARNING: --live-settle spends real Mainnet USDC. Plan holds this until the very end.');
}

async function loadSheet() {
  if (args['fill-json']) {
    const raw = fs.readFileSync(path.resolve(String(args['fill-json'])), 'utf8');
    const data = JSON.parse(raw);
    return data.sheet || data;
  }
  const orderId = args.orderId;
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

async function postCapture(orderId, capture) {
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

async function callSettle(orderId, dryRun) {
  const res = await fetch(`${api}/api/mw-helio-settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mw-ops-secret': String(opsSecret),
    },
    body: JSON.stringify({ orderId, opsSecret, dryRun }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || body.reason || res.statusText);
  return body;
}

const sheet = await loadSheet();
if (!sheet?.ready && sheet?.hardMissing?.length) {
  console.warn('Sheet incomplete:', sheet.hardMissing.join(', '));
  console.warn('Continuing anyway — fill may fail on missing fields.');
}

const playwright = await requirePlaywright();
const headed = Boolean(args.headed) || args.headless === 'false' || !args.headless;
const browser = await launchDexBrowser(playwright, { headless: !headed });
const page = browser.context.pages()[0] || (await browser.context.newPage());

const result = {
  startedAt: new Date().toISOString(),
  orderId: sheet.orderId || args.orderId || null,
  fillNotes: [],
  capture: null,
  dryRun: null,
  liveSettle: null,
  paid: false,
  stopReason: 'capture_complete_no_pay',
  channel: browser.channel,
};

try {
  const session = await checkDexSession(page);
  if (!session.ok) {
    result.stopReason = 'session_expired';
    result.session = session;
    writeReloginAlert({ reason: session.reason || 'session_expired', orderId: result.orderId });
    await page.screenshot({ path: path.join(OUT_DIR, 'session-expired.png'), fullPage: true });
    process.exitCode = 2;
  } else {
    // Clear stale re-login alert on healthy session
    const alertPath = path.join(OUT_DIR, 'NEED_RELOGIN.json');
    if (fs.existsSync(alertPath)) {
      try {
        fs.unlinkSync(alertPath);
      } catch {
        /* ignore */
      }
    }

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

      if (wantPostCapture && result.orderId && opsSecret && (capture.chargeUrl || capture.depositAddress)) {
        const posted = await postCapture(result.orderId, capture);
        result.posted = posted;
        console.log('Posted capture to CTOgo:', posted.next || 'ok');
      }

      if (result.orderId && opsSecret && (wantDryRun || wantLiveSettle)) {
        if (wantDryRun) {
          const dry = await callSettle(result.orderId, true);
          result.dryRun = dry;
          result.stopReason = 'dry_run_ok';
          console.log(
            'Dry-run OK →',
            dry.deposit?.depositAddress,
            '·',
            dry.deposit?.depositAmount,
            dry.deposit?.asset || 'USDC',
          );
          if (dry.fees) {
            console.log(
              'Fees → invoice',
              dry.fees.invoiceUsd,
              '+ service',
              dry.fees.serviceFeeUsd,
              '= vault debit',
              dry.fees.totalDebitUsd,
            );
          }
        }
        if (wantLiveSettle) {
          const live = await callSettle(result.orderId, false);
          result.liveSettle = live;
          result.paid = Boolean(live.ok);
          result.stopReason = 'live_settle_attempted';
          console.log('Live settle:', live);
        }
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
  if (!wantLiveSettle) {
    console.log('Money spent: $0 (dry-run only; no Live settle).');
  }
  await browser.close();
}
