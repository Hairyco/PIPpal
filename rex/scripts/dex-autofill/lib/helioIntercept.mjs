/**
 * Sniff Helio / MoonPay Commerce network + websocket traffic for a Solana deposit address.
 * Dex QR encodes a charge URL — the deposit destination often only appears in API payloads.
 *
 * Important: never treat `/_next/static` JS as a source (false positives like truncated genesis hashes).
 */

import { PublicKey } from '@solana/web3.js';

const SOLANA_ADDR_RE = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g;

const INTERESTING_KEY =
  /deposit|recipient|wallet|publicKey|public_key|address|destination|pubkey|recipientPK|^pk$/i;

const SKIP_URL =
  /\/_next\/static\/|\.woff2?(?:\?|$)|\/fonts\/|\.css(?:\?|$)|\/assets\/fonts|sourcemap|favicon/i;

const SKIP_ADDR = new Set([
  // Common false positives from Solana JS / Helio bundles
  '11111111111111111111111111111111',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  'SysvarRent111111111111111111111111111111111',
  'SysvarC1ock11111111111111111111111111111111',
  'MetaXbYo1TkyCmhNxeG52FmXUEDw6EnaqwUpHyHNBQT',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint
  'So11111111111111111111111111111111111111112', // wSOL
]);

/** @param {string} addr */
export function isValidSolanaAddress(addr) {
  if (!addr || typeof addr !== 'string') return false;
  if (addr.length < 32 || addr.length > 44) return false;
  if (SKIP_ADDR.has(addr)) return false;
  // Truncated mainnet genesis hash often appears in bundles
  if (addr.startsWith('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')) return false;
  try {
    // eslint-disable-next-line no-new
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {unknown} value
 * @param {string[]} path
 * @param {{ address: string, path: string, amount?: number }[]} out
 */
function walk(value, path, out) {
  if (value == null) return;
  if (typeof value === 'string') {
    const key = path[path.length - 1] || '';
    if (/mintAddress|^mint$/i.test(key)) return;
    if (INTERESTING_KEY.test(key) || /recipientPK|depositAddress/i.test(key)) {
      const m = value.match(SOLANA_ADDR_RE);
      if (m) {
        for (const addr of m) {
          if (isValidSolanaAddress(addr)) {
            out.push({ address: addr, path: path.join('.') });
          }
        }
      }
    } else if (isValidSolanaAddress(value)) {
      out.push({ address: value, path: path.join('.') });
    }
    return;
  }
  if (typeof value === 'number') return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, [...path, String(i)], out));
    return;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      walk(v, [...path, k], out);
      if (/amount|requestAmount|usdcAmount/i.test(k) && (typeof v === 'string' || typeof v === 'number')) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) {
          const last = out[out.length - 1];
          if (last && !last.amount) {
            last.amount = n >= 1_000_000 ? n / 1_000_000 : n;
          }
        }
      }
    }
  }
}

function parseBody(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function scoreHit(h) {
  let s = 0;
  if (/recipientPK/i.test(h.path)) s += 20;
  if (/depositAddress|deposit\.|depositWallets/i.test(h.path)) s += 15;
  if (/recipient|PAYMENT_RECIPIENT/i.test(h.path)) s += 10;
  if (/wallet\.publicKey|wallets\.\d+\.publicKey/i.test(h.path)) s += 8;
  if (/prepareRequestBody/i.test(h.path)) s += 5;
  if (h.amount) s += 2;
  if (h.source === 'fetch_hook' || h.source === 'xhr_hook') s += 3;
  if (h.source === 'api_json') s += 4;
  if (h.source === 'dom' || /dom_/i.test(h.path)) s += 4;
  if (h.url && /api\.hel\.io|\/v1\/charge|paylink|quote/i.test(h.url)) s += 6;
  if (h.url && SKIP_URL.test(h.url)) s -= 50;
  return s;
}

/**
 * Inject early so Helio SPA fetch/XHR bodies are captured even when Playwright response.text() fails.
 * @param {import('playwright').Page | import('playwright').BrowserContext} target
 */
export async function installHelioFetchHook(target) {
  await target.addInitScript(() => {
    if (window.__helioSniffInstalled) return;
    window.__helioSniffInstalled = true;
    window.__helioSniff = [];

    const push = (url, body, source) => {
      try {
        if (!url || !body) return;
        if (String(body).length > 2_000_000) return;
        window.__helioSniff.push({
          url: String(url).slice(0, 400),
          body: String(body).slice(0, 500_000),
          source,
          at: Date.now(),
        });
        if (window.__helioSniff.length > 80) window.__helioSniff.shift();
      } catch {
        /* ignore */
      }
    };

    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const res = await origFetch(...args);
      try {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || res.url;
        const clone = res.clone();
        const text = await clone.text();
        push(url, text, 'fetch_hook');
      } catch {
        /* ignore */
      }
      return res;
    };

    const XO = XMLHttpRequest.prototype.open;
    const XS = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this.__helioUrl = url;
      return XO.call(this, method, url, ...rest);
    };
    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener('load', () => {
        try {
          push(this.__helioUrl || '', this.responseText, 'xhr_hook');
        } catch {
          /* ignore */
        }
      });
      return XS.apply(this, args);
    };
  });
}

/**
 * Attach listeners to a Playwright page. Returns a bag that fills as traffic arrives.
 * @param {import('playwright').Page} page
 */
export function installHelioDepositSniffer(page) {
  /** @type {{ address: string, path: string, amount?: number, url?: string, source?: string }[]} */
  const hits = [];
  const urls = [];
  /** @type {{ url: string, preview: string }[]} */
  const jsonSamples = [];

  const consider = (url, bodyText, source = 'response') => {
    if (!url || !bodyText) return;
    const u = String(url);
    if (SKIP_URL.test(u)) return;
    urls.push(u.slice(0, 200));

    const json = parseBody(bodyText);
    if (json) {
      jsonSamples.push({ url: u.slice(0, 200), preview: String(bodyText).slice(0, 180) });
      const found = [];
      walk(json, [], found);
      for (const f of found) {
        hits.push({ ...f, url: u, source: source === 'response' ? 'api_json' : source });
      }
      return;
    }

    // Only scan non-JSON text for solana: pay URIs (never whole JS bundles — those are SKIP_URL)
    const solanaPay = String(bodyText).match(/solana:([1-9A-HJ-NP-Za-km-z]{32,44})/i);
    if (solanaPay && isValidSolanaAddress(solanaPay[1])) {
      hits.push({ address: solanaPay[1], path: 'solana_pay_uri', url: u, source });
    }
  };

  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (SKIP_URL.test(url)) return;
      if (!/hel\.io|moonpay|api\.|charge|paylink|deposit|wallet|payment|quote|prepare/i.test(url)) {
        return;
      }
      const ct = (res.headers()['content-type'] || '').toLowerCase();
      // Prefer JSON; allow text; skip javascript bundles explicitly
      if (/javascript|ecmascript|css|font|image|woff/.test(ct)) return;
      if (!/json|text|plain|octet/.test(ct) && !/api\.hel\.io|\/v1\//i.test(url)) return;
      const text = await res.text().catch(() => '');
      consider(url, text, 'response');
    } catch {
      /* ignore */
    }
  });

  page.on('websocket', (ws) => {
    ws.on('framereceived', (frame) => {
      try {
        const payload = frame.payload;
        if (typeof payload === 'string') consider(ws.url(), payload, 'websocket');
      } catch {
        /* ignore */
      }
    });
  });

  return {
    hits,
    urls,
    jsonSamples,
    async drainPageHook() {
      try {
        const bag = await page.evaluate(() => {
          const arr = window.__helioSniff || [];
          window.__helioSniff = [];
          return arr;
        });
        for (const item of bag) {
          if (SKIP_URL.test(item.url || '')) continue;
          consider(item.url, item.body, item.source || 'fetch_hook');
        }
      } catch {
        /* page may navigate */
      }
    },
    best() {
      if (!hits.length) return null;
      const ranked = [...hits].sort((a, b) => scoreHit(b) - scoreHit(a));
      const top = ranked[0];
      return scoreHit(top) > 0 ? top : null;
    },
  };
}

async function scrapeDepositFromDom(page) {
  return page.evaluate(() => {
    const re = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g;
    const text = document.body?.innerText || '';
    const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (/deposit|address|transfer|send to|recipient|wallet/i.test(line)) {
        const am = line.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
        if (am) return { address: am[1], path: 'dom_line' };
      }
    }
    // Copy buttons / data attributes
    for (const el of document.querySelectorAll('[data-address], [data-wallet], [data-pubkey]')) {
      const v =
        el.getAttribute('data-address') ||
        el.getAttribute('data-wallet') ||
        el.getAttribute('data-pubkey');
      if (v && v.length >= 32) return { address: v, path: 'dom_data_attr' };
    }
    const m = text.match(re);
    return m?.[0] ? { address: m[0], path: 'dom_first_base58' } : null;
  });
}

/**
 * Open Helio charge URL (or stay on page), wait for sniffer hits.
 * @param {import('playwright').Page} page
 * @param {{ chargeUrl?: string, timeoutMs?: number, sniffer?: ReturnType<typeof installHelioDepositSniffer> }} opts
 */
export async function waitForHelioDeposit(page, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 45000;
  await installHelioFetchHook(page.context());
  const sniffer = opts.sniffer || installHelioDepositSniffer(page);
  const notes = [];

  if (opts.chargeUrl) {
    await page.goto(opts.chargeUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    notes.push(`opened charge: ${opts.chargeUrl}`);
  }

  // Try QR path if billing form present
  try {
    const payQr = page.getByRole('button', { name: /pay with qr/i });
    if (await payQr.count()) {
      const name = page.getByLabel(/full name/i);
      if (await name.count()) {
        const v = await name.inputValue().catch(() => '');
        if (!v) await name.fill('CTOgo Ops');
      }
      const email = page.getByLabel(/email/i);
      if (await email.count()) {
        const v = await email.inputValue().catch(() => '');
        if (!v) await email.fill('ops@ctogo.local');
      }
      await payQr.first().click({ timeout: 5000 }).catch(() => {});
      notes.push('Pay with QR clicked (if present)');
    }
  } catch {
    notes.push('QR click skipped');
  }

  // Common Helio UI: show deposit / copy address
  for (const label of [/copy address/i, /show (qr|address)/i, /deposit address/i, /transfer/i]) {
    try {
      const btn = page.getByRole('button', { name: label });
      if (await btn.count()) {
        await btn.first().click({ timeout: 2000 }).catch(() => {});
        notes.push(`clicked UI: ${label}`);
      }
    } catch {
      /* ignore */
    }
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sniffer.drainPageHook();
    let best = sniffer.best();
    if (!best?.address) {
      const dom = await scrapeDepositFromDom(page).catch(() => null);
      if (dom?.address && isValidSolanaAddress(dom.address)) {
        sniffer.hits.push({ ...dom, source: 'dom' });
        best = sniffer.best();
      }
    }
    if (best?.address && isValidSolanaAddress(best.address) && scoreHit(best) > 0) {
      notes.push(`deposit from network: ${best.path} @ ${best.url || best.source || '?'}`);
      return {
        ok: true,
        depositAddress: best.address,
        depositAmount: best.amount ?? null,
        notes,
        hits: sniffer.hits.slice(0, 20),
        sniffedUrls: sniffer.urls.slice(-20),
        jsonSamples: sniffer.jsonSamples.slice(-10),
      };
    }
    await page.waitForTimeout(1000);
  }

  notes.push('timeout: no deposit address in Helio network traffic');
  notes.push(`json samples seen: ${sniffer.jsonSamples.length}`);
  return {
    ok: false,
    depositAddress: null,
    depositAmount: null,
    notes,
    hits: sniffer.hits.slice(0, 20),
    sniffedUrls: sniffer.urls.slice(-20),
    jsonSamples: sniffer.jsonSamples.slice(-10),
  };
}
