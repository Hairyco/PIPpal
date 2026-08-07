# DexScreener supplier playbook

**Slug:** `dexscreener-socials` / `dexscreener-trending`  
**Adapter:** `dexscreener`  
**Last probed:** 2026-08-07 (live marketplace, Kalim D session)  
**Probe order:** `#1786094036096` · payment path `/order/032oOrW3EL99IT0sEEXZ/payment`

## Payment rail

| Field | Value |
|-------|--------|
| payment_rail | `hosted_checkout_crypto` |
| automation_tier | Settle = A (auto deposit once charge known); order/session = B-thin (Google + form feed) |
| Network | **Solana** (also ETH/Polygon on pay page — CTOgo uses Solana) |
| Pay with | **USDC** default (USDT, SOL, others exist — v1 standard = USDC) |
| Processor | **Helio** (MoonPay Commerce) — `DS_MARKETPLACE_HELIO_NETWORK=mainnet` |
| QR payload | `https://moonpay.hel.io/charge/{chargeToken}?network=SOL&deeplink=true` (deposit-style, not a raw wallet in the QR) |
| Card | **Out of scope** (`Pay with Card` ignored) |

### Asset reality

- Marketing vault accumulates **SOL** from trade fees.
- Live Dex Token Ad packages are priced in **USD / USDC** on Mainnet Helio.
- **Devnet test SOL cannot pay Dex.** Use Devnet only for vault/keeper plumbing.
- **Just-in-time:** vault SOL → (ops hot) → Jupiter SOL→USDC for invoice amount → pay Helio deposit.
- **Contingency asset:** Helio **Pay with = SOL** (still Mainnet) if USDC path fails.

## Auth + order flow (live)

1. Google sign-in only — `https://marketplace.dexscreener.com/sign-in`
2. Product → Token Advertising → Order form `/product/ad/order`
3. Submit **Order Now** → `/order/{id}/payment`
4. Set **Network = Solana**, **Pay with = USDC**
5. Helio billing fields (name, email, country, address)
6. **Pay with QR** → Helio charge deeplink (or **Pay with Wallet** contingency)

## Creatives (dynamic — from live Token Ad form)

| Field | Required on Dex? | Spec | CTOgo behavior |
|-------|------------------|------|----------------|
| Chain | Required | Solana for CTOgo | Required |
| Token address | Required | Mint | Required (from project) |
| Ad package | Required | 20k $299 … 800k $6,999 | From offer |
| Title | Required | max **50** chars | Required on Approve / ad pack |
| Pitch | Required | max **120** chars | Required for Token Ad |
| Square image | Required | **1:1**, png/jpg/webp, min 100px wide, max **4.5MB** | Required |
| Website / X / Telegram / Discord | **Optional** | Adders on form | Optional; warn if empty (reject risk) |
| Policy checkboxes | Required | Verifiable data; Dex may reject/modify | ACK at Approve |

**Pivot:** Socials are **not** mandatory. Do not block Approve when socials are empty. If Dex later makes a field required, update this table and [`rex/src/data/dexscreenerAdPack.ts`](../../src/data/dexscreenerAdPack.ts) together.

Related UI: Get Started **DexScreener ad pack** + Roadmap Approve gate.

## Primary auto path

```text
Founder Approve (creatives hard gates)
  → CTOgo queues campaign order + creatives JSON
  → Ops opens /ops/dex-feed → fill sheet → Google handoff → Dex form
  → Network Solana + Pay with USDC + Pay with QR
  → Capture Helio charge + deposit on /ops/dex-feed (or POST /api/mw-dex-feed)
  → Keeper: vault SOL disburse (invoice+10%) → JIT USDC → Helio deposit
  → Confirm via Dex GET /orders/v1/{chain}/{token} and/or Helio status
  → fulfilment fulfilled
```

Public Dex APIs are **read-only** (no purchase API). We do not invent a static Dex treasury wallet.

### Ops: form feed + Helio QR capture

1. Open **`/ops/dex-feed`** (ops secret required).
2. **Load pending Dex orders** → pick one → copy fields from the fill sheet into Dex (Google signed in).
3. Submit Dex **Order Now** → payment page → **Pay with QR**.
4. Paste **charge URL** + **deposit address** + amount → **Save capture**.
5. Optional: **Mark form fed** after submit if you have not captured yet.
6. Then `POST /api/mw-helio-settle` (`dryRun: true` first).

API: `GET/POST /api/mw-dex-feed` · sheet builder: `rex/lib/mw/dexFeed.js`

## Contingency ops wallet pool (3+)

Dex/Helio may flag a **payer wallet**, **Google session**, or **IP/egress** without killing crypto checkout entirely.

| Layer | What rotates | How |
|-------|----------------|-----|
| Helio payer | Solana hot wallets (pool ≥3) | `mw_ops_wallets` — auto failover on block; funds to next active wallet |
| Dex session | Google accounts | Human / saved session (separate from SOL keys) |
| Capture browser | IP / proxy | If marketplace/Helio shows IP friction, rotate egress for form+QR only |

**Block reasons tracked:** `wallet_flag` · `helio_reject` · `dex_session` · `ip_session` · `unknown`

**API:** `GET/POST /api/mw-ops-wallets` (ops secret). Register public keys only; secrets in Vercel `MW_OPS_WALLET_1_SECRET`, etc.

**Rule:** When active payers < 3 → audit `ops_wallet_pool_low` — create and register new wallets.

## Contingency

| Failure | Action |
|---------|--------|
| Hard creatives missing (title/pitch/image) | Block Approve |
| Socials empty | Allow + soft warning |
| No Helio charge / QR | `awaiting_payment_instruction`; do not settle |
| Helio / payer wallet blocked | Mark wallet blocked; **failover to next ops wallet**; auto-fund settle amount |
| Ops pool < 3 active | Alert; create & register new wallets |
| IP / session friction on marketplace | Rotate Google session and/or browser egress; keep paying from wallet pool |
| Helio resolve / deposit destination unknown | Pay with Wallet contingency; ops; prefer fix resolve |
| USDC path unhealthy | Retry with Pay with = SOL (Mainnet) |
| Charge expired / underpay | New charge; top-up per Helio rules; never pay stale id |
| On-chain / swap fail | Retry → `payment_failed` |
| Paid but Dex rejects / not live | `paid_unconfirmed` / fulfilment failed; escalate |
| Google session dead | Re-login; no card |
| Only card works | Provider inactive for auto |
| Dex UI changes fields | Re-probe; update this playbook + form schema |

## Confirmation signal

- Helio charge paid (deposit complete)
- Dex `GET https://api.dexscreener.com/orders/v1/solana/{mint}` shows relevant paid order when applicable
- Ops proof if API lag

## Confirmation test plan

| Stage | What | Cost | Status |
|-------|------|------|--------|
| A | Devnet vault → disburse | Free | Plumbing |
| B | Helio settle dry-run (resolve deposit, no broadcast) | Free | Required for “automation works” |
| C | Live Dex: Google → fill form → payment page → capture QR/deposit → **abort** (no Live settle) | Free | Required for “automation works” |
| D | Optional: real Dex package purchase when you want a live ad | ~$299+ | **Not** required to call auto-path proven |
| E | Optional: tiny self-created Helio charge settle (~$1) if you have Helio merchant keys | ~$1 | Extra pay-rail proof without buying Dex |

**Locked pivot:** End-to-end automation proof = **Stages B + C**. Do **not** require a $299 Dex buy to say “the path works.” A live Dex buy is only when you intentionally want that ad.

### What “automation” means today vs wallet “Pay now”

| Piece | Today | Goal |
|-------|--------|------|
| Google sign-in | Human (session handoff) | Same — no OAuth robot every order |
| Dex order form | Ops fill sheet **or** local Playwright autofill | `npm run dex:autofill` |
| Payment page | Capture Helio charge + deposit | Same |
| Pay | CTOgo/ops wallet **sends USDC to Helio deposit** (or dry-run) | Same money as Helio “Pay with Wallet” — different button |
| Helio “connect wallet → Pay” | Contingency | Also spends real Mainnet USDC on a live Dex invoice |

### Local browser autofill (free)

```bash
cd rex
npm install -D playwright && npx playwright install chromium
npm run dex:login          # Google once; save session
npm run dex:autofill -- --orderId=UUID --api=https://rex-liart.vercel.app --opsSecret=… --headed --post-capture
```

Stops at payment capture. **$0 spent.** Then Dry-run settle on `/ops/dex-feed`. Details: `rex/scripts/dex-autofill/README.md`.

Important: Helio QR encodes a **charge URL**, not a Solana deposit address. Auto-pay resolves the address via public `GET https://api.hel.io/v1/charge/{token}` (or `npm run dex:capture-charge`). Charge URL alone is not enough to settle until that resolve succeeds.

### Stage C runbook (free automation proof)

1. Approve / queue a Dex order with creatives on CTOgo.
2. Google into Dex → fill from `/ops/dex-feed` (or autofill when built).
3. Order Now → Solana → USDC → Pay with QR (do **not** complete payment on Dex).
4. Paste charge URL + deposit address + amount → **Save capture**.
5. **Dry-run settle** only — must show same address/amount.
6. Close Dex payment / let charge expire. **Do not** Live settle unless you want to buy the ad.
7. Pass = capture stored + dry-run OK → mark Stages B+C done.

### Stage D (optional paid ad)

Only when you deliberately want the cheapest (or any) Dex package live. Same as C, then **Live settle**.

## Code pointers

- Ad pack schema: `rex/src/data/dexscreenerAdPack.ts`
- Fill sheet: `rex/lib/mw/dexFeed.js` · ops UI `/ops/dex-feed` · `GET/POST /api/mw-dex-feed`
- Browser autofill (local): `rex/scripts/dex-autofill/` · `npm run dex:login` / `npm run dex:autofill`
- Fulfilment adapter: `rex/lib/mw/adapters.js`
- Helio helpers: `rex/lib/mw/helio.js` · settle: `rex/lib/mw/helioSettle.js` · `POST /api/mw-helio-settle`
- Jupiter JIT: `rex/lib/mw/jupiterSwap.js`
- Ops wallet pool: `rex/lib/mw/opsWallets.js` · `POST /api/mw-ops-wallets`
- Keeper: `rex/api/mw-keeper-tick.js`

### Helio settle (ops)

1. Prefer **`/ops/dex-feed`** capture (charge URL + deposit address + amount).
2. Or `POST /api/mw-payment-instruction` / `POST /api/mw-dex-feed` `action=capture`.
3. `POST /api/mw-helio-settle` with `orderId`, `opsSecret` (optional `dryRun: true` first).
4. Until the 3 contingency wallets are registered, settle uses `KEEPER_SECRET_KEY` as payer fallback (must hold USDC + SOL for fees on Mainnet).
