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

- KYC flag gating Tier 2+ disburse  
- Token age ≥ 6 months for product-build suppliers  
- Roadmap wallet (separate PDA)  
- Exit fee instruction  
- Token-2022 transfer hooks (tax on wallet-to-wallet transfers)  
- Service fee on disbursements  

## Frontend alignment

`rex/src/data/chainConfig.ts` mirrors `constants.rs` fee bps.

## Audit checklist

- [ ] Verify `apply_trade_fees` cannot overflow (`checked_*` used)  
- [ ] Verify curve quotes match reserve updates  
- [ ] Verify sell cannot drain more SOL than `curve_vault` holds  
- [ ] Verify only whitelisted suppliers receive disburse  
- [ ] Verify only project founder can withdraw creator fees  
- [ ] Verify `protocol_treasury` constrained to config value on buy/sell  
- [ ] Review authority centralization (expected for MVP)  
