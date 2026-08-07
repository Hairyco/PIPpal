# Auto-pay finish status (ops)

## Done

| Step | Status |
|------|--------|
| Google Dex session | Saved under `scripts/dex-autofill/.auth/` |
| Ops payer pool | 3 active wallets registered |
| Helio dry-run (Stage B) | **Pass** |
| Autofill → capture → dry-run (Stage C) | **Pass** — e.g. order `7881c338…` vault debit $374.50 ($350 + 7%); $0 spent |
| Live settle gate | Refuses without `FUND_OK=1` + funded wallet |
| Vault / on-chain disburse | **Deferred** (needs program redeploy with `service_fee_bps`) |

## Ops wallets (fund one for live Helio)

Prefer **helio-payer-1**:

`GnTumJoY83sf3prt5S1ccQvtf7PGPCn8X7Nqhncbv7av`

Balances as of last check: **0 SOL / 0 USDC** on all three.

Send Mainnet **USDC** (≥ invoice, e.g. $299–$350) + **~0.05 SOL** for fees.

```bash
cd rex
npm run ops:wallets:fund-check
```

## Commands

```bash
cd rex
npm run ops:wallets:status
npm run ops:seed-dex -- --mint=YOUR_MINT
node scripts/ops-wallets/settle.mjs --orderId=UUID
npm run dex:autofill -- --orderId=UUID --api=https://rex-liart.vercel.app --headed

# live Helio (REAL USDC) — only after funding + explicit OK
set FUND_OK=1
node scripts/ops-wallets/live-settle-gate.mjs --orderId=UUID
```

## Secrets note

`MW_OPS_SECRET` was rotated during bootstrap (Vercel Sensitive values cannot be pulled locally).  
The new value is in `rex/.env.local` (gitignored). Paste that into `/ops/dex-feed`.

## Deferred — vault disburse

1. Redeploy Anchor program (`disburse_marketing` + `service_fee_bps`)
2. Keep `MW_DISBURSE_DRY_RUN=1` until verified
3. Fund marketing vault; whitelist supplier; keeper tick
