# Rex MVP — Investor & Auditor Guide

This document maps the contract architecture for technical due diligence.

## Executive summary

Rex MVP is a Solana program (Anchor 0.30.1) that:

1. Launches project tokens on a **bonding curve**
2. Splits **0.95% launch-tier trade tax** on every buy and sell: **0.35% protocol** + **0.20% creator/trader pool** + **0.40% marketing**
3. Holds marketing SOL in a **program-derived address (PDA)**
4. Holds the creator/trader pool in a **creator vault PDA**; Mode A founders withdraw; Mode B locks founder withdraw for trader rebates
5. Disburses marketing SOL to **whitelisted supplier wallets** only, via Rex authority

## Fee logic (canonical)

Defined in `programs/rex-mvp/src/constants.rs` and implemented in `fees.rs`:

```text
platform_fee  = gross × 35 / 10_000   (0.35%)
creator_fee   = gross × 20 / 10_000   (0.20%)
marketing_fee = gross × 40 / 10_000   (0.40%)
net           = gross - platform - creator - marketing   (99.05%)
```

`fee_mode` is locked at `launch_project` (0 = creator keep, 1 = trader cashback).

### Abandonment trigger

If the creator wallet holds under 10% of initial allocation (`CREATOR_MIN_HOLD_BPS` = 1000), the creator cut is revoked for that wallet and diverted (default: marketing). Platform and marketing fees are never halted by a dump — only the scammer’s passive income stops.

Applied identically on **buy** (on incoming SOL) and **sell** (on gross SOL from curve before user payout).

## Architecture diagram

```text
                    ┌─────────────────────────────────────┐
                    │           rex_mvp program           │
                    │                                     │
  initialize ──────►│  RexConfig (global authority)       │
  launch_project ──►│  Project + Mint + Vault PDAs        │
                    │                                     │
  buy / sell ──────►│  fees.rs → curve.rs → transfer.rs   │
                    │       │         │                   │
                    │       ▼         ▼                   │
                    │  treasury   creator_vault           │
                    │             marketing_vault         │
                    │             curve_vault             │
                    │                                     │
  withdraw_creator ►│  founder ← creator_vault            │
  disburse ────────►│  whitelist check → supplier pay     │
                    └─────────────────────────────────────┘
```

## Module reference

| Module | File | Lines of interest |
|--------|------|-------------------|
| Constants | `constants.rs` | `PLATFORM_FEE_BPS`, `CREATOR_FEE_BPS`, `MARKETING_FEE_BPS` |
| Fee split | `fees.rs` | `apply_trade_fees()` + unit tests |
| Curve math | `curve.rs` | `quote_buy_tokens`, `quote_sell_sol` |
| Account layouts | `state.rs` | `Project`, `RexConfig`, `WhitelistedProvider` |
| Buy logic | `instructions/buy.rs` | Tax transfers + mint |
| Sell logic | `instructions/sell.rs` | Burn + tax from curve vault |
| Creator withdraw | `instructions/withdraw_creator.rs` | Creator vault → founder |
| Supplier pay | `instructions/disburse.rs` | Marketing → supplier |
| Whitelist | `instructions/whitelist.rs` | Authority-gated |
| Events | `events.rs` | `TradeExecuted` for indexers |

## Account (PDA) seeds

| Seed | Account | Asset |
|------|---------|-------|
| `["config"]` | RexConfig | Config data |
| `["project", mint]` | Project | Curve state |
| `["marketing_vault", project]` | Vault | SOL (marketing) |
| `["creator_vault", project]` | Vault | SOL (creator fees) |
| `["curve_vault", project]` | Vault | SOL (curve reserves) |
| `["mint_auth", project]` | Authority | Mint authority |
| `["whitelist", provider]` | WhitelistedProvider | Flag |

## Trust assumptions (MVP)

| Control | Holder |
|---------|--------|
| `initialize` / whitelist / disburse | `RexConfig.authority` |
| `launch_project` | Founder (pays rent) |
| `buy` / `sell` | Any user when `trading_enabled` |
| Creator vault withdrawal | Project founder via `withdraw_creator_fees` |
| Marketing vault withdrawal | Program only, via `disburse_marketing` |

## Test coverage

`tests/poc-marketing-wallet.ts` asserts:

- Buy splits 0.35% / 0.20% / 0.40% / 99.05% correctly  
- Sell taxes gross SOL with the same split  
- Founder can withdraw creator fees  
- Whitelist + disburse credits supplier  
- Non-whitelisted disburse fails  

Rust unit tests in `fees.rs` and `curve.rs`.

## Deferred (documented, not implemented)

**Engineering priority (Raydium-first — ship before any custom AMM):**

- Token-2022 transfer hooks (tax on wallet-to-wallet transfers) — **required for post-Raydium fee continuity**  
- `migrate_to_raydium` instruction that **must**:
  1. Transfer the **Rex migration protocol fee (2 SOL)** from curve SOL to the protocol treasury  
  2. Pay Raydium CPMM create fee (~0.20 SOL) from curve SOL  
  3. **Deposit remaining curve SOL + remaining curve tokens into the Raydium pool**  
  4. **Burn (or permanently lock) 100% of LP** — fail if LP is withdrawable  
  5. Assert post-migration fee accounts still route platform + marketing + pool cuts  
- Rex migration protocol fee: **2 SOL** to Rex treasury (CTOgo revenue) — charged once at graduate  
- Migration create fee: **~0.20 SOL** (**0.15 SOL** Raydium create + rent buffer; cap **0.25 SOL**) — **required** or pool creation fails  
- **Investor migration notification (product — do not ship migrate without this):** when a coin starts graduating to Raydium, notify holders/investors (in-app + optional push/email/Telegram) that the coin is migrating, with clear status (migrating → live on Raydium) and a link to the new pool/chart  

**Later / not prioritized:**

- KYC flag gating Tier 2+ disburse  
- Token age ≥ 6 months for product-build suppliers  
- Roadmap wallet (separate PDA)  
- Exit fee instruction  
- Service fee on disbursements  
- Private CTOgo AMM (“CTOgoSwap”) — only after scale metrics (steady graduates, CTOgo-UI volume dominance, material Raydium fee leakage)

## Post-migration fees (product invariant)

Bonding-curve → **Raydium** graduation **does not end taxation**. CTOgo does **not** graduate to a private AMM for now — Raydium keeps coins visible on Jupiter / DexScreener / routers.

### Graduation liquidity (Pump-style — required)

| Step | Rule |
|------|------|
| Rex migration fee | 2 SOL from curve → Rex protocol treasury |
| Create fee | ~0.20 SOL from curve pays Raydium CPMM open cost |
| Seed pool | **Remaining** curve SOL + remaining curve tokens deposit into Raydium |
| Burn LP | **100%** of LP burned or permanently locked — migrate fails otherwise |
| Close curve | Further trading on Raydium / Jupiter |

Without seed + burn, graduation is broken (no depth / rug risk). This matches how Pump.fun graduation worked for traders.

| Requirement | Rule |
|-------------|------|
| Platform fee | Continues to Rex treasury after graduation |
| Marketing fee | Continues to marketing vault PDA (never 0%) |
| Creator/trader pool | Continues under locked Mode A or Mode B |
| Abandonment | Still revokes dumped creator cut post-migration |
| Migration instruction | Must fail if fee accounts missing, zeroed, or redirected to an EOA |
| Rex migration protocol fee | 2 SOL from curve → Rex treasury, once at graduate |
| Migration create fee | ~0.20 SOL from curve (0.15 Raydium create + buffer); cap 0.25 — required |
| Liquidity seed + LP burn | Remaining curve reserves → Raydium pool; LP burned — required |
| Destination | Raydium (Raydium-first) — not a private CTOgo AMM |

Mechanism (planned): Token-2022 transfer fee and/or AMM hooks route the same bps split into the existing PDAs.

## Marketing vault inactivity & sweep

| Rule | Detail |
|------|--------|
| Auto-spend at $500 | Programmatic ads/trending fire even if volume slows |
| 72h inactivity | Under $500 + $0 volume for 72h → sweep to Rex Protocol CTO Reserve |
| Native V2 restoration | 100% of swept funds credited to the new V2 marketing vault |
| V1 restart without V2 | Swept funds stay in reserve; V1 accrues fresh marketing fees |
| 30-day V2 deadline | No Native V2 within 30 days of a Rex V1 mint → funds to Rex treasury |

Constants: `MARKETING_AUTO_SPEND_USD = 500`, `MARKETING_INACTIVITY_HOURS = 72`, `MARKETING_V2_DEADLINE_DAYS = 30`.

## Security controls (anti-hack)

| Control | Purpose |
|---------|---------|
| Fee schedule + Mode A/B lock at deploy | No silent fee-zero admin rug |
| Migration fee invariant | Graduation cannot disable tax |
| Mint authority revoke/lock | No post-migrate supply inflation |
| LP burn/lock on graduation | Founder cannot pull Raydium liquidity |
| Curve → pool liquidity seed | Remaining curve SOL + tokens must fund the Raydium pool |
| Marketing vault PDA + whitelist disburse | Marketing SOL not a free deployer wallet |
| Creator withdraw gates (Mode A + abandonment) | Mode B never pays founder; dumpers lose cut |
| Checked fee math + treasury constraint | Fees cannot be redirected mid-tx |
| Upgrade authority multisig / renounce | Hardens program-level compromise |

## Frontend alignment

`rex/src/data/chainConfig.ts` mirrors `constants.rs` fee bps, plus `GRADUATION_POLICY`, `GRADUATION_LIQUIDITY_POLICY`, `MIGRATION_FEE_POLICY`, `POST_MIGRATION_FEES`, and `SECURITY_CONTROLS`.

## Audit checklist

- [ ] Verify `apply_trade_fees` cannot overflow (`checked_*` used)  
- [ ] Verify curve quotes match reserve updates  
- [ ] Verify sell cannot drain more SOL than `curve_vault` holds  
- [ ] Verify only whitelisted suppliers receive disburse  
- [ ] Verify only project founder can withdraw creator fees  
- [ ] Verify `protocol_treasury` constrained to config value on buy/sell  
- [ ] Verify migration (when shipped) cannot zero platform or marketing fees  
- [ ] Verify migrate fee funds Raydium create-pool (~0.15 SOL) + rent from curve; fail migrate if underfunded  
- [ ] Verify remaining curve SOL + tokens are deposited into the Raydium pool (liquidity seed)  
- [ ] Verify 100% of graduation LP is burned or permanently locked (not withdrawable by any EOA)  
- [ ] Verify migrate fee ≤ 0.25 SOL cap and create-fee SOL is not diverted as CTOgo treasury skim  
- [ ] Verify Rex migration protocol fee is exactly 2 SOL, goes to the treasury PDA, and cannot be raised without a program upgrade  
- [ ] Verify mint authority revoked/locked at launch and graduation  
- [ ] Verify Raydium LP burned or time-locked on graduation  
- [ ] Review authority centralization (expected for MVP; harden for prod)  
