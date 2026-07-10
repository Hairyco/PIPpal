# Rex MVP Contracts (Solana / Anchor)

Proof-of-concept bonding curve with **marketing wallet tax routing** and **whitelisted supplier disbursements**.

## Fee model

| Action | Rex (platform) | Marketing wallet | Total |
|--------|----------------|------------------|-------|
| Buy    | 1%             | 5%               | 6%    |
| Sell   | 1%             | 5%               | 6%    |

Tax is applied at swap time (Option A on sells: fees taken from gross SOL before user payout).

## POC flow

1. `initialize` — Rex authority + protocol treasury
2. `launch_project` — mint + curve + marketing vault PDAs
3. `buy` — investor SOL → 1% treasury, 5% marketing, 94% curve → tokens minted
4. `sell` — tokens burned → gross SOL from curve → 6% tax split → user receives net
5. `add_whitelist_provider` — Rex authority whitelists supplier wallet
6. `disburse_marketing` — marketing vault → supplier wallet

## Prerequisites

Install on your machine:

- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solanalabs.com/cli/install) (v1.18+)
- [Anchor](https://www.anchor-lang.com/docs/installation) (v0.30.1)
- Node.js 18+

```bash
# Solana devnet
solana config set --url devnet
solana airdrop 2

# In this folder
cd rex-contracts
npm install
anchor build
anchor test
```

`anchor test` starts a local validator, deploys the program, and runs `tests/poc-marketing-wallet.ts`.

## Deploy to devnet

```bash
anchor build
anchor keys sync          # updates program id in Anchor.toml + lib.rs
anchor deploy --provider.cluster devnet
```

## Program instructions

| Instruction | Who signs | Purpose |
|-------------|-----------|---------|
| `initialize` | Rex authority | Global config |
| `launch_project` | Founder | New project + mint + vaults |
| `buy` | Investor | Buy tokens on curve |
| `sell` | Investor | Sell tokens on curve |
| `add_whitelist_provider` | Rex authority | Whitelist supplier |
| `disburse_marketing` | Rex authority | Pay supplier from marketing vault |

## Accounts (PDAs)

| Seed | Holds |
|------|--------|
| `config` | Global Rex config |
| `project` + mint | Curve state |
| `marketing_vault` + project | Marketing wallet SOL |
| `curve_vault` + project | Bonding curve SOL |
| `whitelist` + provider | Supplier whitelist entry |

## Events (for indexer / UI)

- `ProjectLaunched`
- `TradeExecuted` — includes `platform_fee_lamports`, `marketing_fee_lamports`
- `ProviderWhitelisted`
- `MarketingDisbursed`

## Deferred (post-MVP)

- KYC gates on Tier 2+ spend
- 6-month token age for product-build suppliers
- Roadmap wallet
- Token-2022 transfer hooks
- Exit fee instruction

## Frontend constants

See `rex/src/data/chainConfig.ts` — keep in sync with `programs/rex-mvp/src/state.rs`.
