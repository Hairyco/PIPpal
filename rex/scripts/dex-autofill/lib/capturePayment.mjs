/**
 * On Dex payment page: prefer Solana + USDC + Pay with QR, then scrape Helio charge URL.
 * Never clicks a final "pay" that spends funds from a connected wallet beyond opening QR.
 */

import { parseHelioChargeUrl } from '../../../lib/mw/helio.js';

async function tryClick(page, locator, { timeout = 5000 } = {}) {
  try {
    await locator.first().click({ timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Scan page HTML + attributes for a Helio charge URL.
 */
async function findHelioUrlInPage(page) {
  const found = await page.evaluate(() => {
    const urls = new Set();
    const re = /https?:\/\/(?:moonpay\.)?hel\.io\/charge\/[a-f0-9-]{36}[^\s"'<>]*/gi;
    const html = document.documentElement.innerHTML;
    for (const m of html.matchAll(re)) urls.add(m[0]);
    for (const a of document.querySelectorAll('a[href*="hel.io/charge"]')) {
      urls.add(a.href);
    }
    for (const el of document.querySelectorAll('[src], [data-url], [href]')) {
      for (const attr of ['src', 'href', 'data-url', 'data-href']) {
        const v = el.getAttribute(attr);
        if (v && /hel\.io\/charge/i.test(v)) urls.add(v);
      }
    }
    return [...urls];
  });
  return found[0] || null;
}

/**
 * Best-effort Solana base58 address near "deposit" / QR copy UI.
 */
async function findDepositAddress(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText || '';
    const re = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g;
    const candidates = [];
    let m;
    while ((m = re.exec(text))) {
      const s = m[1];
      // Skip obvious non-addresses
      if (/^https?/i.test(s)) continue;
      if (s.length < 32) continue;
      candidates.push(s);
    }
    // Prefer lines mentioning deposit / address / transfer
    const lines = text.split(/\n/).map((l) => l.trim());
    for (const line of lines) {
      if (/deposit|address|transfer|send/i.test(line)) {
        const am = line.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
        if (am) return am[1];
      }
    }
    return candidates[0] || null;
  });
}

/**
 * @param {import('playwright').Page} page
 * @param {{ amountUsd?: number }} defaults
 */
export async function capturePaymentPage(page, defaults = {}) {
  const notes = [];

  // Network Solana
  await tryClick(page, page.getByText(/^Solana$/i));
  await tryClick(page, page.getByRole('option', { name: /Solana/i }));
  notes.push('network: Solana attempted');

  // Pay with USDC
  await tryClick(page, page.getByText(/^USDC$/i));
  await tryClick(page, page.getByRole('option', { name: /USDC/i }));
  notes.push('asset: USDC attempted');

  // Open QR (do not Pay with Card, do not confirm wallet spend)
  const qr =
    (await tryClick(page, page.getByRole('button', { name: /pay with qr|qr/i }))) ||
    (await tryClick(page, page.getByText(/Pay with QR/i)));
  notes.push(qr ? 'Pay with QR: clicked' : 'Pay with QR: not found');

  await page.waitForTimeout(2000);

  let chargeUrl = await findHelioUrlInPage(page);
  if (!chargeUrl) {
    // Some UIs put deeplink in clipboard buttons — try data attributes again after wait
    await page.waitForTimeout(2000);
    chargeUrl = await findHelioUrlInPage(page);
  }

  let parsed = null;
  if (chargeUrl) {
    parsed = parseHelioChargeUrl(chargeUrl);
    notes.push(parsed.ok ? `charge: ${parsed.chargeToken}` : `charge parse fail: ${parsed.reason}`);
  } else {
    notes.push('charge: not found in DOM — paste manually from QR UI');
  }

  const depositAddress = await findDepositAddress(page);
  if (depositAddress) notes.push(`depositAddress: ${depositAddress}`);
  else notes.push('depositAddress: not auto-found — paste from Dex/Helio UI');

  return {
    notes,
    chargeUrl: parsed?.ok ? parsed.deeplink : chargeUrl,
    chargeToken: parsed?.ok ? parsed.chargeToken : null,
    depositAddress,
    depositAmount: defaults.amountUsd ?? null,
    paymentUrl: page.url(),
    /** Script never broadcasts pay */
    paid: false,
  };
}
