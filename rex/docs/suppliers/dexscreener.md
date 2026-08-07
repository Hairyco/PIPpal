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
  → Ops/session feeds Dex order form (Google handoff)
  → Network Solana + Pay with USDC + Pay with QR
  → Capture Helio charge deeplink → payment_instruction
  → Keeper: vault SOL disburse (invoice+20%) → JIT USDC → Helio deposit
  → Confirm via Dex GET /orders/v1/{chain}/{token} and/or Helio status
  → fulfilment fulfilled
```

Public Dex APIs are **read-only** (no purchase API). We do not invent a static Dex treasury wallet.

## Contingency

| Failure | Action |
|---------|--------|
| Hard creatives missing (title/pitch/image) | Block Approve |
| Socials empty | Allow + soft warning |
| No Helio charge / QR | `awaiting_payment_instruction`; do not settle |
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

| Stage | What | Status |
|-------|------|--------|
| A | Devnet vault → disburse | Plumbing |
| B | Helio **dev** (`moonpay.dev.hel.io`) deposit settle | Settle mechanics |
| C | Live Dex form + QR capture (no pay / abort) | UI still matches |
| D | Founder-approved live Dex pay (cheapest package) | **Required** before “Dex auto-pay done” |

## Code pointers

- Ad pack schema: `rex/src/data/dexscreenerAdPack.ts`
- Fulfilment adapter: `rex/lib/mw/adapters.js`
- Helio helpers: `rex/lib/mw/helio.js`
- Jupiter JIT: `rex/lib/mw/jupiterSwap.js`
- Keeper: `rex/api/mw-keeper-tick.js`
