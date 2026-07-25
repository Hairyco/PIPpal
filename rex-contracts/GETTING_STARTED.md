# Rex MVP Contract — Plain-English Guide

This guide is for founders and investors who are **not developers**. It explains what the contract does, how to prove it works, and what each folder is for.

---

## What problem does this contract solve?

When someone buys or sells a project coin on Rex:

1. **Rex earns 0.35%** — goes to the Rex protocol treasury  
2. **0.20% goes to the creator/trader pool** — Mode A: founder withdraws; Mode B: trader cashback (locked at launch)  
3. **0.40% goes to the project’s marketing wallet** — used to pay for ads, DexScreener, Telegram promos, etc.  
4. The rest powers the **bonding curve** (how the token price moves)

Later, Rex can **pay a whitelisted supplier** (e.g. an ad vendor) directly from the marketing wallet — only if that supplier was pre-approved on-chain.

That is the proof investors care about: **trades fill the marketing wallet, and Rex can pay suppliers from it.**

---

## The wallets in the demo

| Wallet | What it is | What happens |
|--------|------------|--------------|
| **Investor wallet** | A normal Solana wallet (like a bank account) | Sends SOL to buy tokens, receives SOL when selling |
| **Creator vault** | Program vault for the V2 CTO / founder or trader rebates | Collects 0.20%; Mode A founder withdraws |
| **Marketing wallet** | A secure vault controlled by the Rex program | Collects 0.40% of every buy and sell |
| **Supplier wallet** | A vendor you trust (e.g. DexScreener, ad agency) | Must be whitelisted first; then Rex can pay them from the marketing wallet |

There is also a **Rex treasury wallet** that collects the 0.35% platform fee.

---

## What the automated test proves

When a developer runs `anchor test`, the computer automatically:

1. Sets up Rex  
2. Launches a test project  
3. Simulates an investor **buying** tokens → checks marketing (+0.40%), creator (+0.20%), and Rex treasury (+0.35%)  
4. Simulates a **sell** → same tax split  
5. **Founder withdraws** creator fees to their wallet  
6. **Whitelists** a supplier wallet  
7. **Pays** the supplier from the marketing wallet → checks the supplier actually received SOL  

If all steps pass, the core mechanic works.

---

## Steps for a non-technical founder

You do **not** need to run this yourself. Your developer (or us) will:

### Step 1 — Install tools (one-time, ~30 minutes)

On a Mac or Linux machine:

- **Rust** — language the contract is written in  
- **Solana CLI** — talks to the Solana blockchain  
- **Anchor** — framework that builds and tests Solana programs  
- **Node.js** — runs the automated test script  

Windows is possible but Mac/Linux is easier for Solana development.

**Automated CI (recommended):** A GitHub Actions workflow at `.github/workflows/rex-contracts.yml` runs `anchor build` and `anchor test` on every push to `rex-contracts/`. Push that file from GitHub Desktop or a token with the `workflow` scope — Cursor’s default git token cannot create workflow files.

**This machine:** Rust and Solana CLI are installed. Anchor still needs either WSL (recommended on Windows) or Visual Studio Build Tools + Windows SDK for native builds.

### Step 2 — Run the proof test (developer)

```text
cd rex-contracts
npm install
anchor test
```

**Success looks like:** all tests green, ending with “disburses marketing SOL to whitelisted supplier”.

### Step 3 — Demo for investors

A developer (or Rex team) can screen-record the automated test or share CI logs showing:

1. Launch a test project  
2. Make a buy — marketing wallet and Rex treasury receive the correct fee split  
3. Pay a whitelisted supplier — supplier receives SOL from the marketing wallet  

---

## Where is the code? (for investor technical review)

All contract code lives in:

```text
rex-contracts/programs/rex-mvp/src/
```

| File / folder | What to look at |
|---------------|-----------------|
| **`constants.rs`** | Fee rates: 0.35% Rex, 0.20% creator/trader pool, 0.40% marketing |
| **`fees.rs`** | How tax is calculated — **start here** |
| **`curve.rs`** | Token price math |
| **`instructions/buy.rs`** | What happens when someone buys |
| **`instructions/sell.rs`** | What happens when someone sells |
| **`instructions/disburse.rs`** | Paying a supplier from marketing wallet |
| **`state.rs`** | Data stored per project |
| **`events.rs`** | On-chain logs the app can read |

Full auditor-oriented overview: [INVESTOR_GUIDE.md](./INVESTOR_GUIDE.md)

---

## Fees (simple version)

| When | Rex | Creator/trader pool | Marketing | Total tax |
|------|-----|---------------------|-----------|-----------|
| Someone **buys** | 0.35% | 0.20% | 0.40% | 0.95% |
| Someone **sells** | 0.35% | 0.20% | 0.40% | 0.95% |

On a 1 SOL buy: Rex gets 0.0035 SOL, creator/trader pool 0.002 SOL, marketing 0.004 SOL, 0.9905 SOL goes into the curve.

At launch, founders choose Mode A (keep creator fees) or Mode B (split to traders as cashback) — locked on-chain.

### Abandonment trigger (dump 90%+)

Trading fees are **not** turned off when a creator rugs. On each swap, if the creator wallet holds **under 10%** of their initial allocation:

1. Their **0.20% creator cut is permanently revoked** for that wallet  
2. That cut is redirected to the **marketing wallet** (default) or **trader rebate pool**  
3. **Rex (0.35%) and marketing (0.40%) keep collecting** so the chart still funds recovery and platform costs  

This is stricter than Pump.fun, where dumped creators can keep collecting until a manual fee-key change.

---

## What is NOT in the MVP yet

**Next (Raydium-first priority):**

- `migrate_to_raydium` that **seeds the Raydium pool** with remaining curve SOL + tokens, **burns LP**, and pays Raydium’s create fee  
- Post-Raydium fee continuity (Token-2022 / AMM hooks) so marketing tax survives graduation  
- Rex migration protocol fee: **2 SOL** from curve → Rex treasury (CTOgo migration revenue)  
- Migrate create fee: **~0.20 SOL** from curve (**0.15 SOL** Raydium CPMM create + rent buffer; cap **0.25 SOL**) — **required** or Raydium pool creation fails  

**Later:**

- KYC checks on-chain  
- Tier 2 / Tier 3 spend limits ($5k / $25k)  
- 6-month rule before product-build suppliers  
- Exit / acquisition fee  
- Roadmap wallet (separate from marketing)  
- Private CTOgo AMM — not planned until volume justifies it  

These are in the product roadmap and will be added in later contract versions.

---

## Questions investors often ask

**Is the marketing wallet custodial?**  
It is a program-controlled vault (PDA). Only the Rex program can move funds out, and only to whitelisted suppliers (for MVP).

**Can the founder drain the marketing wallet?**  
Not in MVP — disbursement requires Rex authority signature + whitelist.

**Can the founder withdraw creator fees?**  
In Mode A, yes — the 0.20% pool accumulates in the creator vault and the founder withdraws via `withdraw_creator_fees`. In Mode B (trader cashback), founder withdraw is disabled. If the founder dumps 90%+ of their tokens, the abandonment trigger revokes their cut (redirected to marketing/traders); platform and marketing fees continue.

**Can fees change?**  
Currently fixed in `constants.rs`. Any change requires deploying a new program version (visible on-chain).

**Where do coins graduate?**  
**Raydium** — CTOgo is Raydium-first for visibility (Jupiter, charts, bots). There is no private CTOgo DEX yet. At graduate, **remaining curve SOL and tokens become the Raydium pool**, and **LP is burned** so liquidity cannot be pulled (same core idea as Pump.fun). Trade tax continues after migration so the marketing wallet keeps filling.

**Is there a migration fee?**  
**Yes — two parts.** CTOgo charges a **Rex migration protocol fee of 2 SOL**, and **~0.20 SOL** is passed through to Raydium to open the pool (about 2.2 SOL total). Everything else from the curve stays in the pool as locked liquidity.

**Has it been audited?**  
Not yet — this is MVP / proof of concept. Budget for audit before mainnet.

---

## Who to ask for help

- **Run tests / deploy:** your Solana developer  
- **Product / fees / roadmap:** Rex team  
- **Code review:** share `INVESTOR_GUIDE.md` and `fees.rs` with your auditor
