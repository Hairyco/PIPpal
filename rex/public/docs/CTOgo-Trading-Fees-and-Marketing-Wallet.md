# CTOgo trading, fees & marketing wallet

Plain-English product rules (as defined in the app today).  
Use this to understand **where money comes from**, **where traders can trade**, and **what breaks if they leave CTOgo**.

**Status note:** Numbers and rules below are the *product model* in CTOgo. The live fee engine / on-chain program is still largely demo or MVP — treat this as “what we sell and intend,” and flag open inconsistencies at the end.

**Pump.fun reference:** Pump is the model we copy for bonding curve → graduate to an AMM → locked liquidity. We differ on marketing wallet, raid fees, List vs Launch, and Raydium-first graduation (we are not building our own PumpSwap yet).

---

## Part 1 — Trading: buy, sell, curve, migrate, wrap

### 1.1 Two ways a coin exists on CTOgo

| Path | What it is | Marketing wallet | Fee schedule |
|------|------------|------------------|--------------|
| **Launch a CTO** | Coin is created on CTOgo (native mint / bonding curve) | Included automatically | **Launch · 1.30%** |
| **List a CTO** | Coin already exists elsewhere (e.g. pump.fun) — we claim the page and optionally add growth tools | Optional (**$1** to attach) | **List · 1.25%** |

Listing or indexing a coin ≠ taxing every trade on every app. Fees only apply when the trade is **routed through CTOgo** (see Part 2).

---

### 1.2 Buy and sell (simple)

1. Trader opens the coin on **CTOgo** and buys or sells.
2. CTOgo takes a **small % of that trade** (the fee engine).
3. That % is split into pots: raid / marketing / creator (Launch only) / CTOgo.
4. The rest of the trade fills against the **bonding curve** (pre-graduate) or the **Raydium pool** (after graduate), depending on stage.

**Buy and sell both pay the same total %** on CTOgo-routed swaps (List 1.25% or Launch 1.30%).

---

### 1.3 Bonding curve (pre-graduate) — like early Pump.fun

**What it is**  
A price formula: early buys are cheaper; later buys cost more as the curve fills. Selling works the other way.

**Where it lives**  
On CTOgo’s program (native Launch coins), not on pump.fun’s curve.

**What we take while on the curve**  
Every CTOgo buy/sell still runs the Launch (or List) fee split before/alongside the curve fill.

**What we keep / retain**
- Fee split on CTOgo-routed volume
- Marketing wallet fills from the marketing cut
- Raid attribution if the trader came via a raid link
- Curve SOL + remaining tokens held for graduation liquidity

---

### 1.4 Migration / graduation — like Pump → AMM

**Target:** Raydium (not a private CTOgo DEX). Reason: stay visible on Jupiter, DexScreener, bots.

**What happens at graduate (required steps)**
1. Take **2 SOL** CTOgo migration fee → CTOgo treasury  
2. Pay **~0.20 SOL** to open the Raydium pool (Raydium’s cost, pass-through)  
3. Put **almost all remaining curve SOL + remaining tokens** into the Raydium pool  
4. **Burn / lock LP** so nobody can pull liquidity  
5. Close the bonding curve — further liquidity lives on Raydium  

**Total leaving the curve at migrate:** about **2.2 SOL** (2 + ~0.20). The rest becomes locked pool liquidity.

**Fees after migrate**  
Product rule: **fees do not turn off.** Platform / marketing / creator (Launch) / raid cuts should still apply on **CTOgo-routed** volume after Raydium.  
Mechanism planned: Token-2022 transfer fee and/or hooks so CTOgo swaps still tax.  
Risk to retain awareness of: if traders swap the graduated mint on Jupiter/Raydium **without** going through CTOgo, we may **leak fees** unless wrap / transfer-fee / router integration is live.

---

### 1.5 Contract wrapping (external / List coins)

**Idea (product / demo)**  
External coins (pump.fun etc.) may get a **CTOgo wrap mint** so that trading the wrap on CTOgo can route fees even when the “real” coin lives elsewhere.

**What wrapping is meant to do**
- Give CTOgo a mint we control for fee routing  
- Let discovery stay multi-venue while fee capture stays on CTOgo trades  

**What wrapping does *not* do (today)**
- It does **not** tax native pump.fun / PumpSwap / Raydium / Jupiter volume by magic  
- Wrap addresses in the app are still **demo** until live program wiring  

**What we should retain**
- Clear rule: **fee = CTOgo-routed trade** (wrap or native), never “all Solana volume”  
- If wrap ships: traders who want marketing fills + CTOgo fees must trade the **CTOgo path**, not only the pump mint on Trojan  

---

### 1.6 Fees we charge (swap tax)

#### Launch a CTO — **1.30%** total

| Slice | % | Goes to |
|-------|---|---------|
| Raid | 0.50% | Raider wallet (if valid link) or CTOgo if unclaimed |
| Marketing | 0.30% | Coin marketing wallet |
| Creator | 0.20% | Creator / deployer |
| CTOgo | 0.30% | Platform |

#### List a CTO — **1.25%** total

| Slice | % | Goes to |
|-------|---|---------|
| Raid | 0.50% | Raider or CTOgo if unclaimed |
| Marketing | 0.40% | Marketing wallet (if attached) |
| Creator | — | None (imported coin) |
| CTOgo | 0.35% | Platform (takes the “creator seat”) |

#### Unclaimed / no marketing wallet (external List coin)

The full **1.25% List fee** still applies when an external coin is traded through CTOgo before
anyone claims its page:

- **0.50% raid** → attributed raider when a valid `?ref=` is active; otherwise CTOgo treasury
- **0.40% marketing** → CTOgo treasury until that coin has an attached marketing wallet
- **0.35% platform** → CTOgo treasury
- Claim status never blocks raid earnings — anyone can raid any token

After a marketing wallet is attached, only the 0.40% marketing destination changes from treasury
to that coin's wallet.

#### Unclaimed raid

If there is **no** active raid referrer (no `?ref=`, attribution older than **24 hours**, or someone pastes the CA into a bot with no raid link):

- The **0.50% raid** goes to **CTOgo treasury**, not a raider  
- Effective CTOgo take becomes **~0.80% Launch** or **~0.85% List** (base + unclaimed raid)

#### Other one-off fees

| Fee | Amount | When |
|-----|--------|------|
| Claim / launch pack | $1 | Launch / claim flows (product) |
| Attach marketing wallet (List) | $1 | Optional on List |
| Clone + host site | 0.4 SOL | From marketing wallet |
| Migration (CTOgo) | 2 SOL | At graduate |
| Raydium create | ~0.20 SOL | At graduate (pass-through) |

---

## Part 2 — Marketing wallet (plain English)

### 2.1 What it is

A **dedicated growth piggy bank** for the coin (branded with Polessia).

- Not the founder’s personal wallet they can drain freely  
- Filled mainly by a **cut of trades that go through CTOgo**  
- Used to pay for growth: DexScreener trending, ads, raids spend, roadmap suppliers, etc.  
- Spend can be manual or “auto” after a roadmap is approved  

**Launch:** wallet created with the coin.  
**List:** optional — attach for **$1**, or list without it (then CTOgo can still take platform fee on CTOgo trades, but no marketing pot fills).

---

### 2.2 The one sentence that matters

> **The marketing wallet fills from CTOgo-routed trades. Volume on pump.fun, Jupiter, Trojan, Banana, etc. does not fill it — unless that trade somehow still goes through CTOgo’s fee path (it usually doesn’t).**

Same sentence for **CTOgo’s platform fee**: we earn when the swap is routed through us.

---

### 2.3 How any coin “adds” the marketing wallet

**A. Pump.fun / external coin (most coins)**  
1. Coin is discovered / indexed on CTOgo  
2. Someone **Lists** (claims the page)  
3. Optionally pays **$1** to attach marketing wallet  
4. Community is told: **trade on CTOgo** (or CTOgo Telegram bot when live) if you want the wallet to fill  
5. They can keep chatting / holding the pump mint everywhere else — but **those trades don’t fund the wallet**

**B. Native Launch on CTOgo**  
1. Launch creates mint + curve + marketing wallet  
2. Early trades on CTOgo fill wallet automatically (0.30% marketing cut)  
3. Later graduate to Raydium; the CTOgo coin-page terminal auto-switches to Jupiter-backed routing,
   and CTOgo-terminal trades keep the 1.30% engine
4. Trades made on other UIs are accepted fee leakage; mint-level transfer tax is optional later,
   not the default product model

**C. Manual top-up (product direction / hybrid)**  
Teams can also **deposit** SOL into the wallet so Polessia can spend even when volume is elsewhere. That is separate from swap tax. (Deposit path is a product choice; auto tax remains CTOgo-routed only.)

---

### 2.4 Where must they trade for fees + marketing to work?

| Where they trade | CTOgo platform fee? | Marketing wallet fill? | Raid 0.50% to raider? |
|------------------|---------------------|------------------------|------------------------|
| **CTOgo website** (Buy/Sell) | Yes | Yes (if MW attached / Launch) | Yes if raid link active |
| **CTOgo Telegram trade bot** (when live, CTOgo-routed) | Yes (intent) | Yes (intent) | Yes if attributed |
| **pump.fun / PumpSwap** native UI | No | No | No |
| **Jupiter / Raydium UI** (bypass CTOgo) | No* | No* | No* |
| **Trojan / Banana / BullX / Axiom / Photon** with CA paste | No* | No* | Raid share → **CTOgo treasury** only if somehow a CTOgo-routed swap still happens **without** a ref; usually **no fee at all** if the bot never hits CTOgo |

\*Unless transfer-fee / wrap / exclusive router is live. Today’s honest rule: **assume no**.

---

## Part 3 — Scenarios (read these)

### Scenario A — Classic pump.fun coin Lists on CTOgo + attaches MW

1. Coin lives on pump.fun.  
2. CTO Lists on CTOgo, pays $1, marketing wallet opens.  
3. 80% of traders keep buying on pump.fun / Trojan.  
4. **Result:** Wallet stays near empty; CTOgo earns almost nothing.  
5. **What works:** Only the minority who buy/sell **on CTOgo** fill MW and pay fees.

**Takeaway:** Listing is distribution + optional growth OS. It is **not** a tax on all pump volume.

---

### Scenario B — Same coin, community pushes “trade on CTOgo”

1. Raid links shared: `ctogo…/coin/TICKER?ref=WALLET`  
2. Traders click link → trade on CTOgo within 24h  
3. **Result:** List 1.25% splits; 0.40% → MW; 0.50% → raider; 0.35% → CTOgo  

---

### Scenario C — Trader uses Trojan / Banana with the contract address

1. Someone copies CA from CTOgo (or pump) into Trojan/Banana.  
2. Bot executes on its own routing (usually Jupiter / pool), **not** CTOgo UI.  
3. **Result:**  
   - No CTOgo platform fee  
   - No marketing fill  
   - No raider payout from that trade  
4. Product rule if a CTOgo-routed swap somehow has **no ref**: unclaimed **0.50% raid → CTOgo** — but that only matters **if** the swap was CTOgo-routed. Pasting CA into Trojan usually **skips CTOgo entirely**.

**Takeaway:** Bots that don’t trade through CTOgo are outside the fee system. Don’t promise otherwise.

---

### Scenario D — Native Launch, then graduate to Raydium

1. Launch on CTOgo; curve fills; MW fills from 0.30%.  
2. Graduate: ~2.2 SOL leave curve; rest → Raydium LP burned.  
3. Traders can now find the coin on Jupiter/DexScreener.  
4. **If they still buy via CTOgo:** fees + MW continue (product rule).  
5. **If they only buy via Jupiter:** fee leakage risk until transfer-fee/wrap/hooks are real.

**Retain:** Raydium for visibility; CTOgo UI/bot for fee capture; don’t claim Jupiter volume is taxed until engineering says so.

---

### Scenario E — List without marketing wallet

1. Page claimed; no $1 MW.  
2. CTOgo trades still take List platform (+ raid) cuts.  
3. **No marketing pot** for that coin until attached.  

---

### Scenario F — Raid link expired or missing

1. Trade on CTOgo but no valid `?ref=` / older than 24h.  
2. Marketing + platform (+ creator on Launch) still apply.  
3. **0.50% raid → CTOgo treasury** (unclaimed).  

---

### Scenario G — “Can we skim all pump.fun volume?”

**No.** Not without pump.fun partnership or controlling the mint/AMM path.  
99% pump origin is fine for **discovery**; fee capture needs **CTOgo-routed** flow (or deposits).

---

## Part 4 — What to retain (product principles)

1. **Fee = CTOgo-routed volume** — say it everywhere.  
2. **Two engines** — List 1.25% / Launch 1.30% — don’t blur them.  
3. **Marketing wallet ≠ founder wallet** — growth pot, spend rules.  
4. **Raid is separate from marketing spend** — 0.50% to wallets; unclaimed → CTOgo.  
5. **Graduate like Pump** — seed Raydium, burn LP, keep fee intent after migrate.  
6. **No private DEX yet** — Raydium-first; revisit only when CTOgo already owns the funnel.  
7. **Bots that bypass us don’t pay us** — Trojan/Banana/Jupiter are not free fee oracles.  
8. **Wrap is optional future tech** — never sell wrap as “taxes pump.fun” unless live.  
9. **Optional deposits** — only way Polessia works for teams who won’t move volume.  
10. **Wash trades don’t profit** — total fee > 0.50% raid, so self-referral loses money.

---

## Part 5 — Inconsistencies / open questions (to clean up)

Use this checklist in product/engineering reviews:

| Topic | Conflict |
|-------|----------|
| **Wrap vs FAQ** | Code comments say wrap could route fees from other venues; FAQ says other venues do **not** fill MW. Resolve: wrap only helps if users trade the wrap **on CTOgo** — not if they trade pump mint on Trojan. |
| **UI fees vs on-chain MVP** | UI sells 1.25% / 1.30% + raid. Contract MVP often cited as **0.95%** without raid. Align before mainnet. |
| **Post-Raydium fees** | Product says fees continue; enforcement (Token-2022 / hooks) not fully live — leakage possible. |
| **Unclaimed raid + bots** | Copy implies pasting CA into Trojan sends raid to treasury — only true for **CTOgo-routed** swaps. Clarify bot language. |
| **Demo vs live MW** | App still uses demo ledger / demo addresses in places. |
| **Polessia standalone** | Polessia can be the spend UX; fee funnel remains CTOgo unless deposit-funded. |
| **Legacy fee tiers** | Old Launch/Growth/Scale docs (0.95% / 0.70% / 0.40%) still exist — mark legacy vs dual engines. |

---

## Part 6 — One-page cheat sheet

```
Pump.fun coin
    │
    ├─ Trade on pump / Trojan / Jupiter ──► CTOgo earns $0, MW gets $0
    │
    └─ List on CTOgo (+ optional $1 MW)
            │
            └─ Trade on CTOgo (site or our bot)
                    │
                    ├─ 0.50% raid → raider (or CTOgo if no link)
                    ├─ 0.40% marketing → MW   [List]
                    └─ 0.35% → CTOgo          [List]

Native Launch on CTOgo
    │
    ├─ On curve: Launch 1.30% split (0.30% → MW)
    └─ Graduate → Raydium LP burned
            │
            └─ Still need CTOgo-routed trades for ongoing fees
```

---

## Document source (for maintainers)

Primary product constants live in:

- [`rex/src/data/chainConfig.ts`](../src/data/chainConfig.ts) — fee engines, raid, migration, graduation  
- [`rex/src/data/claimPricing.ts`](../src/data/claimPricing.ts) — $1 MW attach  
- [`rex/src/data/faq.ts`](../src/data/faq.ts) — user-facing wording  
- [`rex/src/data/ctoProjects.ts`](../src/data/ctoProjects.ts) — wrap mint comment (demo)

Update this doc when those files change.
