# Rex MVP Contracts (Solana / Anchor)

Proof-of-concept bonding curve with **marketing + creator/trader fee routing** and **whitelisted supplier disbursements**.

Launch-tier trade tax is **0.95%** (0.35% Rex + 0.20% creator/trader pool + 0.40% marketing). Creators lock Mode A (keep fees) or Mode B (trader cashback) at deploy.

**Not technical?** Read [GETTING_STARTED.md](./GETTING_STARTED.md) first.  
**Investor / auditor?** Read [INVESTOR_GUIDE.md](./INVESTOR_GUIDE.md).

## Fee model (launch tier · 0.95%)

| Action | Rex (platform) | Creator/trader pool | Marketing wallet | Total |
|--------|----------------|---------------------|------------------|-------|
| Buy    | 0.35%          | 0.20%               | 0.40%            | 0.95% |
| Sell   | 0.35%          | 0.20%               | 0.40%            | 0.95% |

Mode A founders withdraw pool fees with `withdraw_creator_fees`. Mode B disables founder withdraw (trader cashback).

**Abandonment:** if the creator dumps 90%+ (holds under 10%), their cut is revoked and diverted to marketing or traders — platform and marketing fees keep collecting.

## Code layout (modular for review)

```text
programs/rex-mvp/src/
  lib.rs              ← entry point + instruction routing
  constants.rs        ← fee % and curve defaults ★ investors start here
  fees.rs             ← 0.35% + 0.20% + 0.40% tax split + tests
  curve.rs            ← bonding curve math + tests
  state.rs            ← account struct definitions
  events.rs           ← on-chain event logs
  errors.rs           ← error codes
  transfer.rs         ← SOL transfer helpers
  accounts/           ← per-instruction account validation
  instructions/       ← business logic (buy, sell, withdraw, disburse, …)
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
