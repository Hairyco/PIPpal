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
| Raydium graduation | Bonding curve → Raydium | YES | Not gated by fee mode |

**Note:** On-chain MVP still hardcodes Launch-tier constants; Growth/Scale tier switching needs oracle/config before live cutover.
