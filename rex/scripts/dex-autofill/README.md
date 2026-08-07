# Dex marketplace autofill (local ops)

Fills DexScreener Token Advertising from a CTOgo order sheet, opens the payment page, tries to capture the Helio QR/charge, and **stops**. It never Live settles / never spends Mainnet USDC.

## Setup (once)

```bash
cd rex
npm install -D playwright
npx playwright install chromium
npm run dex:login
```

Login opens **your real Chrome or Edge** (Google blocks Playwright’s fake Chromium). Sign in with Google, wait until you’re in the marketplace, then press **Enter** in the terminal.

Session/profile: `scripts/dex-autofill/.auth/` (gitignored).

If Google still says the browser is not secure: close other Chrome windows, then retry — or sign into https://marketplace.dexscreener.com once in normal Chrome first.

## Run (free proof)

```bash
npm run dex:autofill -- --orderId=YOUR_ORDER_UUID --api=https://rex-liart.vercel.app --opsSecret=YOUR_OPS_SECRET --headed
```

Useful flags:

| Flag | Meaning |
|------|---------|
| `--headed` | Watch the browser |
| `--no-submit` | Fill form only (don’t click Order Now) |
| `--post-capture` | POST charge/deposit back to `/api/mw-dex-feed` |
| `--fill-json=path` | Use a local sheet instead of the API |

Screenshots + JSON land in `scripts/dex-autofill/.out/`.

## Capture Helio deposit address (required for auto-pay)

Helio’s QR is a **charge link**, not a Solana address. Run this against the charge URL:

```bash
cd rex
npm run dex:capture-charge -- --headed --chargeUrl="https://moonpay.hel.io/charge/YOUR-UUID?network=SOL&deeplink=true"
```

Optional — push into CTOgo:

```bash
npm run dex:capture-charge -- --headed --chargeUrl="..." --orderId=CTOGO_ORDER_UUID --opsSecret=... --post-capture
```

The script sniffs Helio network/websocket traffic for a Solana deposit address. It never pays.

If it exits with no address, Helio is hiding the destination until a wallet session — tell the agent; we may need a deeper wallet-attach intercept.

