/**
 * Fill DexScreener Token Advertising order form from a CTOgo fill sheet.
 * Selectors are label/text based — re-probe if Dex UI changes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { OUT_DIR } from './common.mjs';

async function tryClick(page, locator, { timeout = 4000 } = {}) {
  try {
    await locator.first().click({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function fillLabeled(page, labelPattern, value) {
  if (value == null || value === '') return false;
  const byLabel = page.getByLabel(labelPattern);
  if (await byLabel.count()) {
    await byLabel.first().fill(String(value));
    return true;
  }
  const byPlaceholder = page.getByPlaceholder(labelPattern);
  if (await byPlaceholder.count()) {
    await byPlaceholder.first().fill(String(value));
    return true;
  }
  return false;
}

/**
 * Download creative image to a temp file for input[type=file].
 */
async function downloadImage(url, orderId) {
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') || '';
  const ext = ct.includes('png')
    ? 'png'
    : ct.includes('webp')
      ? 'webp'
      : ct.includes('jpeg') || ct.includes('jpg')
        ? 'jpg'
        : 'png';
  const filePath = path.join(OUT_DIR, `creative-${orderId || 'local'}.${ext}`);
  fs.writeFileSync(filePath, buf);
  return filePath;
}

/**
 * @param {import('playwright').Page} page
 * @param {{ fill: object, orderId?: string, packageLabel?: string }} sheet
 * @param {{ submit?: boolean }} opts
 */
export async function fillTokenAdForm(page, sheet, opts = {}) {
  const { submit = true } = opts;
  const fill = sheet.fill || sheet;
  const notes = [];

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);

  // Chain → Solana
  const chainOk =
    (await tryClick(page, page.getByRole('combobox').filter({ hasText: /chain|solana/i }))) ||
    (await tryClick(page, page.getByText(/^Solana$/i))) ||
    (await tryClick(page, page.locator('button, [role="option"]').filter({ hasText: /^Solana$/i })));
  if (!chainOk) {
    // Try opening a Chain dropdown then picking Solana
    await tryClick(page, page.getByText(/^Chain$/i));
    await tryClick(page, page.getByRole('option', { name: /Solana/i }));
    await tryClick(page, page.getByText(/^Solana$/i));
  }
  notes.push('chain: attempted Solana');

  // Token address
  const mint = fill.tokenAddress;
  if (
    !(await fillLabeled(page, /token\s*address/i, mint)) &&
    !(await fillLabeled(page, /contract|mint/i, mint))
  ) {
    const inputs = page.locator('input[type="text"], input:not([type])');
    if (mint && (await inputs.count()) > 0) {
      await inputs.first().fill(mint);
      notes.push('tokenAddress: filled first text input (fallback)');
    } else {
      notes.push('tokenAddress: FAILED');
    }
  } else {
    notes.push('tokenAddress: ok');
  }

  // Package
  const pkg =
    fill.packageLabel ||
    (fill.packagePriceUsd ? String(fill.packagePriceUsd) : null) ||
    sheet.packageLabel;
  if (pkg) {
    const priceMatch = String(pkg).match(/(\d[\d,]*)/);
    const clicked =
      (await tryClick(page, page.getByText(new RegExp(pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')))) ||
      (priceMatch &&
        (await tryClick(
          page,
          page.getByText(new RegExp(`${priceMatch[1].replace(/,/g, ',?')}\\.00|\\$${priceMatch[1]}`, 'i')),
        ))) ||
      (await tryClick(page, page.getByText(/20k\s*views/i)));
    notes.push(clicked ? `package: ${pkg}` : `package: FAILED (${pkg})`);
  }

  // Title / pitch
  if (await fillLabeled(page, /title/i, fill.title)) notes.push('title: ok');
  else notes.push('title: FAILED');

  if (
    (await fillLabeled(page, /pitch|description|interest/i, fill.pitch)) ||
    (await fillLabeled(page, /short description/i, fill.pitch))
  ) {
    notes.push('pitch: ok');
  } else {
    notes.push('pitch: FAILED');
  }

  // Image
  try {
    const imgPath = await downloadImage(fill.squareImageUrl, sheet.orderId);
    if (imgPath) {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(imgPath);
      notes.push(`image: ${imgPath}`);
    } else {
      notes.push('image: skipped (no url)');
    }
  } catch (err) {
    notes.push(`image: FAILED ${err.message}`);
  }

  // Optional links — only if adders exist
  const links = fill.links || {};
  for (const [key, re] of [
    ['website', /website/i],
    ['x', /twitter|\bx\b/i],
    ['telegram', /telegram/i],
    ['discord', /discord/i],
  ]) {
    if (!links[key]) continue;
    await tryClick(page, page.getByText(re).filter({ hasText: /add/i }));
    await fillLabeled(page, re, links[key]);
  }

  // Policy checkboxes
  const boxes = page.locator('input[type="checkbox"]');
  const n = await boxes.count();
  for (let i = 0; i < n; i++) {
    const box = boxes.nth(i);
    if (!(await box.isChecked())) {
      try {
        await box.check({ timeout: 2000 });
      } catch {
        await box.click({ force: true }).catch(() => {});
      }
    }
  }
  notes.push(`checkboxes: toggled ${n}`);

  if (submit) {
    const ordered =
      (await tryClick(page, page.getByRole('button', { name: /order now/i }), { timeout: 8000 })) ||
      (await tryClick(page, page.getByText(/^Order Now$/i), { timeout: 8000 }));
    notes.push(ordered ? 'submit: Order Now clicked' : 'submit: FAILED');
    if (ordered) {
      await page.waitForURL(/\/order\/.+\/payment|\/payment/, { timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(1500);
    }
  } else {
    notes.push('submit: skipped (--no-submit)');
  }

  return { notes, url: page.url() };
}
