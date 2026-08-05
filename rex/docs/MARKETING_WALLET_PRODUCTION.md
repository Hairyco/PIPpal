# CTOgo Marketing Wallet — production readiness

## What shipped in this repo (free to build / test locally)

| Layer | Status |
|-------|--------|
| Anchor program dual fees (List 1.25% / Launch 1.30%), raid, attach MW, 20%-on-top disburse + receipt PDA, keeper role, pause, 180-day sweep ix | Code + Rust unit tests in `rex-contracts` |
| Supabase schema + Vercel APIs (approve, providers, status, keeper cron) | `rex/supabase/migrations`, `rex/api/mw-*`, `rex/lib/mw` |
| Founder UI fee breakdown + demo badges | `PostLaunchDashboard`, `postLaunchRoadmap`, `chainConfig` |

## Credentials you must provision (I cannot create these from here)

| Item | Cost | Notes |
|------|------|-------|
| Supabase project | Free tier → paid | Apply migration `20260805_ctogo_marketing_wallet.sql`. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. |
| Solana RPC | Free public unsuitable; Helius/QuickNode paid | `SOLANA_RPC_URL` for keeper |
| Keeper keypair | Free to generate; needs SOL for fees | `KEEPER_SECRET_KEY` (base58) — never commit |
| Cron auth | Free | `CRON_SECRET` — Vercel cron Bearer |
| Ops admin | Free | `MW_OPS_SECRET` for `/api/mw-providers` mutations |
| Program deploy | Devnet free-ish; mainnet SOL | Replace placeholder `Fg6PaFpo…` via `anchor keys` + update `declare_id!` + `chainConfig` |
| DexScreener / influencer APIs | Partner / paid | Optional `DEXSCREENER_API_KEY` — adapters stay manual until credentials |
| Smart-contract audit | Paid external | Required before mainnet funds |

## Rollout order

1. Apply Supabase migration; seed provider wallets; whitelist on-chain.
2. `anchor test` on localnet; deploy program to **devnet**.
3. Set Vercel env on the CTOgo project; confirm `/api/mw-keeper-tick` with `Authorization: Bearer $CRON_SECRET`.
4. Founder Approve uses wallet signature challenge (not localStorage preview).
5. Formal audit → mainnet keys → live provider adapters.

## Fee invariant (locked)

Supplier invoice **$100** → vault debit **$120** ($100 supplier + $20 CTOgo). Never take 20% out of the supplier amount.

## Sweep invariant (locked)

**180 days** inactivity → sweep to CTOgo treasury (warn 30d / 7d). Blocked while spend paused or payment queued. Resets on marketing fill or disbursement.
