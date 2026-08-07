/**
 * Sniff Helio / MoonPay Commerce network + websocket traffic for a Solana deposit address.
 * Dex QR encodes a charge URL — the deposit destination often only appears in API payloads.
 */

const SOLANA_ADDR_RE = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g;

const INTERESTING_KEY =
  /deposit|recipient|wallet|publicKey|public_key|address|destination|pubkey|pk$/i;

const SKIP_VALUE =
  /hel\.io|moonpay|http|https|solana:|usd|usdc|null|undefined|true|false/i;

/**
 * @param {unknown} value
 * @param {string[]} path
 * @param {{ address: string, path: string, amount?: number }[]} out
 */
function walk(value, path, out) {
  if (value == null) return;
  if (typeof value === 'string') {
    const key = path[path.length - 1] || '';
    if (INTERESTING_KEY.test(key) || /recipientPK|depositAddress/i.test(key)) {
      const m = value.match(SOLANA_ADDR_RE);
      if (m) {
        for (const addr of m) {
          if (!SKIP_VALUE.test(addr) && addr.length >= 32) {
            out.push({ address: addr, path: path.join('.') });
          }
        }
      }
    } else if (value.length >= 32 && value.length <= 44 && SOLANA_ADDR_RE.test(value)) {
      // bare address string in nested arrays
      if (!SKIP_VALUE.test(value)) out.push({ address: value, path: path.join('.') });
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
      // amount hints near address
      if (/amount|requestAmount|usdcAmount/i.test(k) && (typeof v === 'string' || typeof v === 'number')) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) {
          const last = out[out.length - 1];
          if (last && !last.amount) {
            // USDC often in base units (6 decimals) when huge
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

/**
 * Attach listeners to a Playwright page. Returns a bag that fills as traffic arrives.
 * @param {import('playwright').Page} page
 */
export function installHelioDepositSniffer(page) {
  /** @type {{ address: string, path: string, amount?: number, url?: string }[]} */
  const hits = [];
  const urls = [];

  const consider = (url, bodyText) => {
    if (!url) return;
    const u = String(url);
    if (!/hel\.io|moonpay|commerce/i.test(u) && !/charge|paylink|deposit|wallet|payment/i.test(u)) {
      // still parse JSON if it looks like Helio payload
    }
    urls.push(u.slice(0, 200));
    const json = parseBody(bodyText);
    if (!json) {
      // raw text may contain solana pay URI
      const solanaPay = String(bodyText).match(/solana:([1-9A-HJ-NP-Za-km-z]{32,44})/i);
      if (solanaPay) hits.push({ address: solanaPay[1], path: 'solana_pay_uri', url: u });
      return;
    }
    const found = [];
    walk(json, [], found);
    for (const f of found) {
      hits.push({ ...f, url: u });
    }
  };

  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (!/hel\.io|moonpay|api\.|charge|paylink|deposit|wallet|payment|quote/i.test(url)) return;
      const ct = res.headers()['content-type'] || '';
      if (!/json|text|javascript/i.test(ct) && !/hel\.io/i.test(url)) return;
      const text = await res.text().catch(() => '');
      consider(url, text);
    } catch {
      /* ignore */
    }
  });

  page.on('websocket', (ws) => {
    ws.on('framereceived', (frame) => {
      try {
        const payload = frame.payload;
        if (typeof payload === 'string') consider(ws.url(), payload);
      } catch {
        /* ignore */
      }
    });
  });

  return {
    hits,
    urls,
    /** Best deposit candidate so far */
    best() {
      if (!hits.length) return null;
      // Prefer paths that look like deposit/recipient
      const ranked = [...hits].sort((a, b) => {
        const score = (h) => {
          let s = 0;
          if (/deposit|recipient/i.test(h.path)) s += 5;
          if (/wallet|publicKey|PK/i.test(h.path)) s += 3;
          if (h.amount) s += 1;
          return s;
        };
        return score(b) - score(a);
      });
      return ranked[0];
    },
  };
}

/**
 * Open Helio charge URL (or stay on page), wait for sniffer hits.
 * @param {import('playwright').Page} page
 * @param {{ chargeUrl?: string, timeoutMs?: number, sniffer?: ReturnType<typeof installHelioDepositSniffer> }} opts
 */
export async function waitForHelioDeposit(page, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 45000;
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
      // Fill minimal billing if empty (Helio often requires it before QR)
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

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const best = sniffer.best();
    if (best?.address) {
      notes.push(`deposit from network: ${best.path} @ ${best.url || '?'}`);
      return {
        ok: true,
        depositAddress: best.address,
        depositAmount: best.amount ?? null,
        notes,
        hits: sniffer.hits.slice(0, 20),
        sniffedUrls: sniffer.urls.slice(-15),
      };
    }
    await page.waitForTimeout(1000);
  }

  notes.push('timeout: no deposit address in Helio network traffic');
  return {
    ok: false,
    depositAddress: null,
    depositAmount: null,
    notes,
    hits: sniffer.hits.slice(0, 20),
    sniffedUrls: sniffer.urls.slice(-15),
  };
}
