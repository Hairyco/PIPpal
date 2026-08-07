# Dex marketplace autofill + worker (local ops)

Unattended path: saved Google session → fill Dex form → Helio capture → **dry-run settle**.  
**No Live settle / no Mainnet spend** unless you pass `--live-settle` (hold until final PoC).

## Setup (once)

```bash
cd rex
npm install
npx playwright install chromium
npm run dex:login
```

Login opens **your real Chrome or Edge**. Sign in with Google, wait until Dex loads, press **Enter**.

Session: `scripts/dex-autofill/.auth/` (gitignored).

## Unattended dry-run (one order)

```bash
npm run dex:autofill -- --orderId=YOUR_ORDER_UUID --api=https://rex-liart.vercel.app --opsSecret=YOUR_OPS_SECRET --headed
```

Defaults: posts capture + dry-run settle. Money spent: **$0**.

If Google session is dead, the script writes `scripts/dex-autofill/.out/NEED_RELOGIN.json` and prints a clear alert — run `npm run dex:login` again.

## Worker (poll pending orders)

```bash
# One tick
npm run dex:worker -- --once --opsSecret=… --api=https://rex-liart.vercel.app

# Keep polling
npm run dex:worker -- --opsSecret=… --intervalSec=120
```

- Orders **without** deposit → full autofill pipeline  
- Orders **with** charge/deposit → dry-run settle only (no browser)  
- Stops if `NEED_RELOGIN.json` is fresh

## Capture Helio deposit only

```bash
npm run dex:capture-charge -- --headed --chargeUrl="https://moonpay.hel.io/charge/YOUR-UUID?network=SOL&deeplink=true"
```

## Ops wallets (register now, fund later)

```bash
npm run ops:wallets:generate
```

Writes secrets under `scripts/ops-wallets/.secrets/` (gitignored). Add env vars in Vercel, redeploy, then `POST /api/mw-ops-wallets` register. Do **not** fund for live pay until the final PoC.

## Flags

| Flag | Meaning |
|------|---------|
| `--headed` | Watch the browser |
| `--no-submit` | Fill form only |
| `--no-post-capture` | Skip posting capture to CTOgo |
| `--no-dry-run` | Skip dry-run settle |
| `--live-settle` | **Real money** — do not use until final PoC |
| `--fill-json=path` | Local sheet instead of API |
