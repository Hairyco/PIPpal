# Rex MVP — Investor & Auditor Guide

This document maps the contract architecture for technical due diligence.

## Executive summary

Rex MVP is a Solana program (Anchor 0.30.1) that:

1. Launches project tokens on a **bonding curve**
2. Splits **1.5% trade tax** on every buy and sell: **1% protocol** + **0.5% marketing**
3. Holds marketing SOL in a **program-derived address (PDA)**
4. Disburses to **whitelisted supplier wallets** only, via Rex authority

No marketplace. No custodial founder withdrawal in MVP.

## Fee logic (canonical)

Defined in `programs/rex-mvp/src/constants.rs` and implemented in `fees.rs`:

```text
platform_fee  = gross × 100 / 10_000   (1%)
marketing_fee = gross × 50 / 10_000    (0.5%)
net           = gross - platform - marketing   (94%)
```

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
                    │  treasury   marketing_vault         │
                    │             curve_vault           │
                    │                                     │
  disburse ────────►│  whitelist check → supplier pay   │
                    └─────────────────────────────────────┘
```

## Module reference

| Module | File | Lines of interest |
|--------|------|-------------------|
| Constants | `constants.rs` | `PLATFORM_FEE_BPS`, `MARKETING_FEE_BPS` |
| Fee split | `fees.rs` | `apply_trade_fees()` + unit tests |
| Curve math | `curve.rs` | `quote_buy_tokens`, `quote_sell_sol` |
| Account layouts | `state.rs` | `Project`, `RexConfig`, `WhitelistedProvider` |
| Buy logic | `instructions/buy.rs` | Tax transfers + mint |
| Sell logic | `instructions/sell.rs` | Burn + tax from curve vault |
| Supplier pay | `instructions/disburse.rs` | Marketing → supplier |
| Whitelist | `instructions/whitelist.rs` | Authority-gated |
| Events | `events.rs` | `TradeExecuted` for indexers |

## Account (PDA) seeds

| Seed | Account | Asset |
|------|---------|-------|
| `["config"]` | RexConfig | Config data |
| `["project", mint]` | Project | Curve state |
| `["marketing_vault", project]` | Vault | SOL (marketing) |
| `["curve_vault", project]` | Vault | SOL (curve reserves) |
| `["mint_auth", project]` | Authority | Mint authority |
| `["whitelist", provider]` | WhitelistedProvider | Flag |

## Trust assumptions (MVP)

| Control | Holder |
|---------|--------|
| `initialize` / whitelist / disburse | `RexConfig.authority` |
| `launch_project` | Founder (pays rent) |
| `buy` / `sell` | Any user when `trading_enabled` |
| Marketing vault withdrawal | Program only, via `disburse_marketing` |

## Test coverage

`tests/poc-marketing-wallet.ts` asserts:

- Buy splits 1% / 0.5% / 98.5% correctly  
- Sell taxes gross SOL (platform : marketing ≈ 1 : 5)  
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
- [ ] Verify `protocol_treasury` constrained to config value on buy/sell  
- [ ] Review authority centralization (expected for MVP)  
