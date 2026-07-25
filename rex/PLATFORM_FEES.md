# Rex platform fees — review doc

Dynamic per-trade tax on Native V2 CTOs.  
**Sources of truth:** `rex/src/data/chainConfig.ts`, `rex-contracts/programs/rex-mvp/src/constants.rs`  
**In-app:** `/fees`

---

## Summary

| | |
|---|---|
| Total trade tax | **0.40% – 0.95%** (scales down with market cap) |
| Destinations | Marketing wallet + Creator/trader pool + Rex platform |
| Mode lock | Mode A or Mode B chosen at deploy (irreversible) |
| Abandonment | Creator dump 90%+ → only their pool cut revoked; Rex + marketing continue |
| Graduation | **Raydium-first** (not a private CTOgo AMM) |
| Migration fee | **~0.20 SOL** required (Raydium CPMM 0.15 + rent buffer) · cap **0.25 SOL** |

---

## Dynamic tiers (per buy/sell)

| Tier | Market cap | Total | Marketing | Creator/trader pool | Rex |
|------|------------|-------|-----------|---------------------|-----|
| **Launch** | Under $100k | **0.95%** | 0.40% (40 bps) | 0.20% (20 bps) | 0.35% (35 bps) |
| **Growth** | $100k – $500k | **0.70%** | 0.25% (25 bps) | 0.15% (15 bps) | 0.30% (30 bps) |
| **Scale** | Over $500k | **0.40%** | 0.15% (15 bps) | 0.05% (5 bps) | 0.20% (20 bps) |

- 1 bps = 0.01%
- Marketing never turns off
- On-chain MVP currently ships **Launch** constants; Growth/Scale need oracle/config for live tier switching

---

## Mode A vs Mode B (locked at deploy)

| | Mode A — Keep creator fees | Mode B — Trader cashback |
|---|---------------------------|--------------------------|
| Pool destination | Creator / deployer wallet (withdraw anytime) | Trader volume vault — rebates |
| Raydium / curve migration | **Available** | **Available** |
| V1→V2 CTO path | **Available** | **Available** |
| Best for | Active teams, narratives, long-term CTO | High-frequency / sniper / PVP volume |

Mode A vs B only chooses who receives the creator/trader pool cut. It does **not** block graduation to Raydium or CTO relaunch.

---

## Abandonment rule

**Trigger:** Creator wallet holds under **10%** of initial allocation (dumped **90%+**).

**Action:** Revoke **only** the creator/trader pool cut for that wallet.  
Rex platform fee and marketing wallet **keep collecting**. Total trade tax stays on.

**Redirect options for the revoked cut:**

1. **Marketing (default)** — e.g. at Launch, marketing rises 0.40% → 0.60%; total stays 0.95%
2. **Traders** — revoked cut goes into the rebate / volume pool

**Contrast:** Unlike Pump.fun (dev can keep collecting until a manual fee-key change), Rex revokes the dump wallet’s cut on-chain automatically.

---

## Worked example — 10 SOL trade at Launch

| Destination | Rate | Amount |
|-------------|------|--------|
| Marketing wallet | 0.40% | 0.0400 SOL |
| Creator / trader pool | 0.20% | 0.0200 SOL |
| Rex treasury | 0.35% | 0.0350 SOL |
| **Net to counterparty** | **99.05%** | **9.9050 SOL** |

---

## Review checklist

- [ ] Launch / Growth / Scale mcap breakpoints final ($100k / $500k)?
- [ ] Rex Scale floor of **0.20%** correct long-term?
- [ ] Default abandonment redirect: **marketing** (vs traders)?
- [ ] Timeline for on-chain Growth/Scale tier switching?

---

## Fee guidelines (product copy)

1. Dynamic tiers: total trade tax scales down with market cap; marketing never turns off.
2. Mode A / Mode B is locked at deploy — keep creator fees or auto-cashback traders.
3. Abandonment: if the creator dumps 90%+ of holdings, only their fee cut is revoked — platform and marketing fees continue.
4. Revoked creator cut redirects to marketing (default) or the trader rebate pool — not to the dumped wallet.
5. After Raydium graduation, the same fee schedule still applies — migration does not turn off tax.
6. Graduation is Raydium-first (not a private CTOgo DEX). Migrate fee is **~0.20 SOL** from curve reserves to pay Raydium CPMM create fee (0.15 SOL) + rent/tx buffer — **required** or coins cannot graduate.
7. Marketing vault: at $500 auto-spend fires; under $500 with $0 volume for 72h sweeps to the Rex CTO Reserve (restored 100% on Native V2 migration). No V2 within 30 days of a Rex V1 mint → funds go to the Rex treasury.

---

## Marketing vault inactivity & sweep

| Rule | Detail |
|------|--------|
| **Automated threshold** | When a vault accumulates **$500**, programmatic spending (ads/trending) fires automatically — even if volume slows. |
| **72-hour inactivity sweep** | Under **$500** with **$0** trading volume for **72 consecutive hours** → unspent funds sweep to the **Rex Protocol CTO Reserve**. |
| **CTO restoration** | Native V2 CTO migration → reserve credits **100%** of swept funds into the fresh V2 marketing vault. |
| **V1 restart (no V2)** | Trading resumes on old V1 without migrating → swept funds stay in the reserve; V1 accrues **fresh** marketing fees from new volume. |
| **30-day V2 deadline** | V1 CTO minted on Rex and **no Native V2** within **30 days** → unspent / reserve funds automatically go to the **Rex protocol treasury**. |

---

## Raydium-first graduation (product decision)

Coins graduate from the CTOgo bonding curve to a **Raydium** pool. CTOgo is **not** building a private PumpSwap-style DEX yet.

| Why Raydium | Why not own AMM yet |
|-------------|---------------------|
| Jupiter / DexScreener / bot visibility | Weak discovery until platform is huge |
| Shared Solana routing depth | High build, audit, and MEV risk |
| Traders expect graduated coins on aggregators | Private pools feel like a dead end for CTOs |

**Engineering priority:** ship `migrate_to_raydium` with LP burn/lock and post-migration fee hooks (Token-2022 / AMM hooks) **before** any custom AMM.

Revisit an owned AMM only when graduating volume is steady, most volume already happens on CTOgo UI, Raydium fee leakage is material vs build cost, and custom pools can still be indexed.

### Migration fee policy (required for Raydium)

Raydium **will not** open a CPMM pool without paying their create-pool fee. CTOgo must reserve this from curve SOL at graduate or migration fails.

| | |
|---|---|
| Raydium CPMM create-pool fee | **0.15 SOL** (protocol) |
| Rent + priority-fee buffer | **~0.05 SOL** |
| **Total reserved at migrate** | **~0.20 SOL** |
| Cap | **0.25 SOL** if Raydium raises fees / congestion |
| Paid from | Bonding-curve SOL reserves |
| Nature | Pass-through Raydium cost — **not** a CTOgo revenue skim |

Sources: [Raydium fee comparison](https://docs.raydium.io/reference/fee-comparison), [Protocol fees](https://docs.raydium.io/ray/protocol-fees).

---

## After Raydium migration

Bonding-curve → Raydium graduation **does not disable fees**. Platform, marketing, and creator/trader pool cuts keep applying on post-migration volume.

**Mechanism (planned):** Token-2022 transfer fee / AMM hooks continue routing to the same PDAs.

| Rule |
|------|
| Marketing floor stays on (never 0%) after graduation |
| Rex platform cut continues into the protocol treasury |
| Mode A / Mode B pool routing is unchanged by migration |
| Abandonment still applies post-migrate |
| No migration instruction may zero, pause, or redirect fees to an attacker wallet |

---

## Security controls (anti-hack)

| Control | Purpose |
|---------|---------|
| Fee schedule + Mode A/B lock at deploy | No silent fee-zero admin rug |
| Migration fee invariant | Graduation cannot disable tax |
| Mint authority revoke/lock | No post-migrate supply inflation |
| LP burn/lock on graduation | Founder cannot pull Raydium liquidity |
| Marketing vault PDA + whitelist disburse | Marketing SOL not a free deployer wallet |
| Creator withdraw gates | Mode B never pays founder; dumpers lose cut |
| Checked fee math + treasury constraint | Fees cannot be redirected mid-tx |
| Upgrade authority multisig / renounce | Hardens program-level compromise |

---

## Final pre-flight verification

| Checkpoint | Target value | Verified in spec? | Code check |
|------------|--------------|-------------------|------------|
| Launch total fee | 0.95% | YES | 40 + 20 + 35 bps |
| Growth total fee | 0.70% | YES | 25 + 15 + 30 bps |
| Scale total fee | 0.40% | YES | 15 + 5 + 20 bps |
| Marketing floor | 0.15% (never turns off) | YES | Scale `marketingBps: 15` |
| Mode choice | Irreversible on-chain | YES | `fee_mode` locked at launch |
| CTO migration | 100% V1 burn → V2 mint (no forms) | YES | Available in Mode A and Mode B |
| Raydium graduation | Bonding curve → Raydium (Raydium-first) | YES | Not gated by fee mode; no private AMM yet |
| Migration fee | ~0.20 SOL required (0.15 Raydium + buffer) · cap 0.25 | YES | Pass-through; without it migrate fails |
| Post-migration tax | Fees continue after Raydium | YES | Platform + marketing + pool stay on |
| Marketing vault sweep | $500 auto-spend · 72h inactivity → CTO Reserve · 30d no V2 → treasury | YES | 100% restore on Native V2 |
| Security controls | Mint lock, LP lock, PDA vaults, fee invariant | YES | See Security controls section |

**Note:** On-chain MVP still hardcodes Launch-tier constants; Growth/Scale tier switching needs oracle/config before live cutover. Next contract work: `migrate_to_raydium` (must fund Raydium create-pool fee from curve) + post-grad fee hooks — not a custom AMM.
