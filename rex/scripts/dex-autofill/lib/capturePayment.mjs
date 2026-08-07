/**
 * On Dex / Helio payment UI: capture charge URL + Solana deposit via network sniff.
 * Never completes a funded payment.
 */

import { parseHelioChargeUrl } from '../../../lib/mw/helio.js';
import { installHelioDepositSniffer, waitForHelioDeposit } from './helioIntercept.mjs';

async function tryClick(page, locator, { timeout = 5000 } = {}) {
  try {
    await locator.first().click({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function findHelioUrlInPage(page) {
  const found = await page.evaluate(() => {
    const urls = new Set();
    const re = /https?:\/\/(?:moonpay\.)?hel\.io\/charge\/[a-f0-9-]{36}[^\s"'<>]*/gi;
    const html = document.documentElement.innerHTML;
    for (const m of html.matchAll(re)) urls.add(m[0]);
    for (const a of document.querySelectorAll('a[href*="hel.io/charge"]')) urls.add(a.href);
    return [...urls];
  });
  return found[0] || null;
}

async function findDepositAddressDom(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText || '';
    const re = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g;
    const lines = text.split(/\n/).map((l) => l.trim());
    for (const line of lines) {
      if (/deposit|address|transfer|send|recipient/i.test(line)) {
        const am = line.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
        if (am) return am[1];
      }
    }
    const m = text.match(re);
    return m?.[0] || null;
  });
}

/**
 * @param {import('playwright').Page} page
 * @param {{ amountUsd?: number, alreadyOnPayment?: boolean }} defaults
 */
export async function capturePaymentPage(page, defaults = {}) {
  const notes = [];
  const sniffer = installHelioDepositSniffer(page);

  await tryClick(page, page.getByText(/^Solana$/i));
  await tryClick(page, page.getByRole('option', { name: /Solana/i }));
  notes.push('network: Solana attempted');

  await tryClick(page, page.getByText(/^USDC$/i));
  await tryClick(page, page.getByRole('option', { name: /USDC/i }));
  notes.push('asset: USDC attempted');

  const qr =
    (await tryClick(page, page.getByRole('button', { name: /pay with qr|qr/i }))) ||
    (await tryClick(page, page.getByText(/Pay with QR/i)));
  notes.push(qr ? 'Pay with QR: clicked' : 'Pay with QR: not found');

  await page.waitForTimeout(1500);

  let chargeUrl = await findHelioUrlInPage(page);
  if (!chargeUrl && /hel\.io\/charge/i.test(page.url())) {
    chargeUrl = page.url();
  }
  if (!chargeUrl) {
    await page.waitForTimeout(2000);
    chargeUrl = await findHelioUrlInPage(page);
  }

  let parsed = null;
  if (chargeUrl) {
    parsed = parseHelioChargeUrl(chargeUrl);
    notes.push(parsed.ok ? `charge: ${parsed.chargeToken}` : `charge parse fail: ${parsed.reason}`);
  } else {
    notes.push('charge: not found in DOM');
  }

  // If we have a charge URL but no deposit yet, open Helio charge and sniff harder
  let depositAddress = sniffer.best()?.address || (await findDepositAddressDom(page));
  let depositAmount = sniffer.best()?.amount ?? defaults.amountUsd ?? null;

  if (!depositAddress && parsed?.ok) {
    notes.push('opening Helio charge page for network intercept…');
    const waited = await waitForHelioDeposit(page, {
      chargeUrl: parsed.deeplink,
      timeoutMs: 40000,
      sniffer,
    });
    notes.push(...waited.notes);
    if (waited.depositAddress) {
      depositAddress = waited.depositAddress;
      if (waited.depositAmount != null) depositAmount = waited.depositAmount;
    }
  } else if (!depositAddress) {
    const waited = await waitForHelioDeposit(page, { timeoutMs: 25000, sniffer });
    notes.push(...waited.notes);
    if (waited.depositAddress) {
      depositAddress = waited.depositAddress;
      if (waited.depositAmount != null) depositAmount = waited.depositAmount;
    }
  }

  if (depositAddress) notes.push(`depositAddress: ${depositAddress}`);
  else notes.push('depositAddress: NOT FOUND — Helio may hide it until wallet session; retry capture-charge');

  return {
    notes,
    chargeUrl: parsed?.ok ? parsed.deeplink : chargeUrl,
    chargeToken: parsed?.ok ? parsed.chargeToken : null,
    depositAddress,
    depositAmount,
    paymentUrl: page.url(),
    sniffHits: sniffer.hits.slice(0, 15),
    paid: false,
  };
}
