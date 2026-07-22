# Rex MVP Contracts (Solana / Anchor)

Proof-of-concept bonding curve with **marketing wallet tax routing** and **whitelisted supplier disbursements**.

**Not technical?** Read [GETTING_STARTED.md](./GETTING_STARTED.md) first.  
**Investor / auditor?** Read [INVESTOR_GUIDE.md](./INVESTOR_GUIDE.md).

## Fee model

| Action | Rex (platform) | Marketing wallet | Total |
|--------|----------------|------------------|-------|
| Buy    | 1%             | 0.5%             | 1.5%  |
| Sell   | 1%             | 0.5%             | 1.5%  |

## Code layout (modular for review)

```text
programs/rex-mvp/src/
  lib.rs              ← entry point + instruction routing
  constants.rs        ← fee % and curve defaults ★ investors start here
  fees.rs             ← 1% + 0.5% tax split + tests
  curve.rs            ← bonding curve math + tests
  state.rs            ← account struct definitions
  events.rs           ← on-chain event logs
  errors.rs           ← error codes
  transfer.rs         ← SOL transfer helpers
  accounts/           ← per-instruction account validation
  instructions/       ← business logic (buy, sell, disburse, …)
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
| `buy` | Investor | Buy tokens (1.5% tax) |
| `sell` | Investor | Sell tokens (1.5% tax) |
| `add_whitelist_provider` | Rex authority | Whitelist supplier |
| `disburse_marketing` | Rex authority | Pay supplier from marketing wallet |

## Frontend constants

`rex/src/data/chainConfig.ts` — keep in sync with `constants.rs`.
