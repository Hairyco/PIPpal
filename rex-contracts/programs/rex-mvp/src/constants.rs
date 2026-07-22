//! Fee and curve constants — single source of truth for investor review.
//!
//! Launch-phase defaults (under $100k mcap) from final CTO launchpad spec:
//! | Constant            | Value | Meaning                              |
//! |---------------------|-------|--------------------------------------|
//! | PLATFORM_FEE_BPS    | 35    | 0.35% to Rex protocol treasury       |
//! | CREATOR_FEE_BPS     | 20    | 0.20% creator/trader pool            |
//! | MARKETING_FEE_BPS   | 40    | 0.40% to marketing wallet            |
//! | Total trade tax     | 95 bps = 0.95%                       |
//!
//! Higher mcap tiers reduce fees on-chain via oracle/config (frontend mirrors FEE_TIERS).
//! Fee destination mode (creator keep vs trader cashback) is locked at `launch_project`.
//!
//! # Marketing vault inactivity & sweep
//! At $500 USD equivalent, programmatic ad/trending spend fires automatically.
//! Under $500 with $0 volume for 72h → sweep unspent SOL to Rex Protocol CTO Reserve.
//! Native V2 CTO migration restores 100% of swept funds to the new V2 marketing vault.
//! V1 volume restart without V2 leaves swept funds in the reserve; V1 accrues fresh fees.
//!
//! # Post-migration (bonding curve → Raydium)
//! Fees **do not stop** at graduation. Platform + marketing + creator/trader pool cuts must
//! continue on post-migration volume (Token-2022 transfer fee / AMM hook → same PDAs).
//! Migration must not zero taxes, revoke marketing, or hand fee authority to a free EOA.
//!
//! # Abandonment trigger
//! If the creator wallet holds under `CREATOR_MIN_HOLD_BPS` of initial allocation
//! (dumped 90%+), the creator cut is revoked permanently for that wallet and redirected
//! (default: marketing boost). Platform + marketing fees continue — do not halt all tax.

/// 0.35% — Rex protocol fee on buys and sells (basis points). Launch tier.
pub const PLATFORM_FEE_BPS: u64 = 35;

/// 0.20% — creator / trader pool on buys and sells (basis points). Launch tier.
/// Mode A: accumulates in creator vault; founder withdraws.
/// Mode B: same vault acts as trader rebate pool (founder withdraw disabled).
/// After abandonment trigger, this cut is diverted away from the dumped wallet.
pub const CREATOR_FEE_BPS: u64 = 20;

/// 0.40% — project marketing wallet on buys and sells (basis points). Launch tier.
pub const MARKETING_FEE_BPS: u64 = 40;

pub const BPS_DENOMINATOR: u64 = 10_000;

/// Total launch-tier trade fee (platform + creator pool + marketing).
pub const TRADE_FEE_BPS: u64 = PLATFORM_FEE_BPS + CREATOR_FEE_BPS + MARKETING_FEE_BPS;

/// Mode A — creator keeps the pool cut.
pub const FEE_MODE_CREATOR: u8 = 0;

/// Mode B — pool cut is trader cashback (founder withdraw disabled).
/// Does **not** block bonding-curve → Raydium migration or V1→V2 CTO relaunch.
pub const FEE_MODE_TRADER_CASHBACK: u8 = 1;

/// USD equivalent threshold for automatic marketing spend (ads / trending).
pub const MARKETING_AUTO_SPEND_USD: u64 = 500;

/// Hours of consecutive $0 volume before an under-threshold vault is swept
/// into the Rex Protocol CTO Reserve.
pub const MARKETING_INACTIVITY_HOURS: u64 = 72;

/// Product invariant: after Raydium graduation, trade tax must still apply.
/// Migration instructions must keep platform + marketing (+ pool) routing live.
pub const POST_MIGRATION_FEES_REQUIRED: bool = true;

/// Creator must retain at least this share of initial allocation (basis points of 10_000).
/// Below 10% remaining (= dumped 90%+) → abandonment trigger fires.
pub const CREATOR_MIN_HOLD_BPS: u64 = 1_000;

/// Where revoked creator fees go after abandonment: 0 = marketing vault, 1 = trader pool.
pub const CREATOR_FEE_REDIRECT_MARKETING: u8 = 0;
pub const CREATOR_FEE_REDIRECT_TRADERS: u8 = 1;

/// SPL token decimals for project coins.
pub const TOKEN_DECIMALS: u8 = 6;

/// Starting virtual SOL reserves for the bonding curve (30 SOL).
pub const INITIAL_VIRTUAL_SOL: u64 = 30_000_000_000;

/// Starting virtual token reserves (1.073B tokens at 6 decimals).
pub const INITIAL_VIRTUAL_TOKENS: u64 = 1_073_000_000_000_000;
