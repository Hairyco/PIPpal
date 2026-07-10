# Rex MVP Contract — Plain-English Guide

This guide is for founders and investors who are **not developers**. It explains what the contract does, how to prove it works, and what each folder is for.

---

## What problem does this contract solve?

When someone buys or sells a project coin on Rex:

1. **Rex earns 1%** — goes to the Rex protocol treasury  
2. **5% goes to the project’s marketing wallet** — used to pay for ads, DexScreener, Telegram promos, etc.  
3. The rest powers the **bonding curve** (how the token price moves)

Later, Rex can **pay a whitelisted supplier** (e.g. an ad vendor) directly from the marketing wallet — only if that supplier was pre-approved on-chain.

That is the proof investors care about: **trades fill the marketing wallet, and Rex can pay suppliers from it.**

---

## The three wallets in the demo

| Wallet | What it is | What happens |
|--------|------------|--------------|
| **Investor wallet** | A normal Solana wallet (like a bank account) | Sends SOL to buy tokens, receives SOL when selling |
| **Marketing wallet** | A secure vault controlled by the Rex program | Collects 5% of every buy and sell |
| **Supplier wallet** | A vendor you trust (e.g. DexScreener, ad agency) | Must be whitelisted first; then Rex can pay them from the marketing wallet |

There is also a **Rex treasury wallet** that collects the 1% platform fee.

---

## What the automated test proves

When a developer runs `anchor test`, the computer automatically:

1. Sets up Rex  
2. Launches a test project  
3. Simulates an investor **buying** tokens → checks marketing wallet grew by 5% and Rex treasury by 1%  
4. Simulates a **sell** → same tax split  
5. **Whitelists** a supplier wallet  
6. **Pays** the supplier from the marketing wallet → checks the supplier actually received SOL  

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

### Step 3 — Deploy to devnet (public test network)

Devnet is Solana’s free test blockchain — real structure, fake money.

```text
anchor deploy --provider.cluster devnet
```

You get a **program ID** (the contract’s address on Solana). Investors can view it on [Solana Explorer](https://explorer.solana.com/?cluster=devnet).

### Step 4 — Demo for investors

A developer (or Rex team) will:

1. Launch a test coin on devnet  
2. Make a buy — show marketing wallet balance increasing on explorer  
3. Pay a whitelisted supplier — show supplier wallet received SOL  

You can screen-record this or share explorer links.

### Step 5 — Mainnet (real money)

Only after audit and legal review. Not part of MVP.

---

## Where is the code? (for investor technical review)

All contract code lives in:

```text
rex-contracts/programs/rex-mvp/src/
```

| File / folder | What to look at |
|---------------|-----------------|
| **`constants.rs`** | Fee rates: 1% Rex, 5% marketing |
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

| When | Rex gets | Marketing wallet gets | Total tax |
|------|----------|------------------------|-----------|
| Someone **buys** | 1% | 5% | 6% |
| Someone **sells** | 1% | 5% | 6% |

On a 1 SOL buy: Rex gets 0.01 SOL, marketing gets 0.05 SOL, 0.94 SOL goes into the curve.

---

## What is NOT in the MVP yet

- KYC checks on-chain (coming later)  
- Tier 2 / Tier 3 spend limits ($5k / $25k)  
- 6-month rule before product-build suppliers  
- Exit / acquisition fee  
- Roadmap wallet (separate from marketing)  

These are in the product roadmap and will be added in later contract versions.

---

## Questions investors often ask

**Is the marketing wallet custodial?**  
It is a program-controlled vault (PDA). Only the Rex program can move funds out, and only to whitelisted suppliers (for MVP).

**Can the founder drain the marketing wallet?**  
Not in MVP — disbursement requires Rex authority signature + whitelist.

**Can fees change?**  
Currently fixed in `constants.rs`. Any change requires deploying a new program version (visible on-chain).

**Has it been audited?**  
Not yet — this is MVP / proof of concept. Budget for audit before mainnet.

---

## Who to ask for help

- **Run tests / deploy:** your Solana developer  
- **Product / fees / roadmap:** Rex team  
- **Code review:** share `INVESTOR_GUIDE.md` and `fees.rs` with your auditor
