# Rex / CTOgo MVP Contracts (Solana / Anchor)

Bonding curve with **dual fee engines**, **raid cut**, **marketing wallet routing**, and **whitelisted supplier disbursements** (invoice + **20% CTOgo fee on top**, idempotent receipt PDA).

| Engine | Total | Raid | Marketing | Creator | Platform |
|--------|-------|------|-----------|---------|----------|
| Launch | **1.30%** | 0.50% | 0.30% | 0.20% | 0.30% |
| List   | **1.25%** | 0.50% | 0.40% | 0% | 0.35% |

Unclaimed raid folds into treasury. List marketing tax routes to treasury until `attach_marketing_wallet`. Inactivity sweep: **180 days** → protocol treasury.

**Not technical?** Read [GETTING_STARTED.md](./GETTING_STARTED.md) first.  
**Investor / auditor?** Read [INVESTOR_GUIDE.md](./INVESTOR_GUIDE.md).  
**Ops / production:** [../rex/docs/MARKETING_WALLET_PRODUCTION.md](../rex/docs/MARKETING_WALLET_PRODUCTION.md).

## Fee model (CTOgo)

| Action | Engine tax | Notes |
|--------|------------|-------|
| Buy / Sell | List 1.25% or Launch 1.30% | Optional `raider` account; else treasury |
| Disburse | invoice × 1.2 | Supplier 100% + CTOgo 20% on top |

Mode A founders withdraw pool fees with `withdraw_creator_fees`. Mode B disables founder withdraw (trader cashback).

**Abandonment:** if the creator dumps 90%+ (holds under 10%), their cut is revoked and diverted to marketing or traders — platform and marketing fees keep collecting.

## Code layout (modular for review)

```text
programs/rex-mvp/src/
  lib.rs              ← entry point + instruction routing
  constants.rs        ← dual-engine bps + 180d sweep ★ investors start here
  fees.rs             ← List/Launch split + invoice×1.2 + tests
  curve.rs            ← bonding curve math + tests
  state.rs            ← config/keeper, project flags, receipt PDA
  events.rs           ← on-chain event logs
  errors.rs           ← error codes
  transfer.rs         ← SOL transfer helpers (PDA-safe)
  accounts/           ← per-instruction account validation
  instructions/       ← buy, sell, disburse, whitelist, pause, sweep, …
```

## Quick start (developers)

```bash
cd rex-contracts
npm install
anchor build
anchor test
```

## Deploy to devnet

```bash
solana config set --url devnet
solana airdrop 2
anchor deploy --provider.cluster devnet
```

## Instructions

| Instruction | Signer | Purpose |
|-------------|--------|---------|
| `initialize` | Rex authority | Global config |
| `launch_project` | Founder | New project + mint + vaults |
| `buy` | Investor | Buy tokens (0.95% launch-tier tax) |
| `sell` | Investor | Sell tokens (0.95% launch-tier tax) |
| `withdraw_creator_fees` | Founder | Withdraw creator vault SOL |
| `add_whitelist_provider` | Rex authority | Whitelist supplier |
| `disburse_marketing` | Rex authority | Pay supplier from marketing wallet |

## Frontend constants

`rex/src/data/chainConfig.ts` must stay in sync with `constants.rs`.
