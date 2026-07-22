//! Fee and curve constants — single source of truth for investor review.
//!
//! Model A (0.90% total) from CTO launchpad economics spec:
//! | Constant            | Value | Meaning                              |
//! |---------------------|-------|--------------------------------------|
//! | PLATFORM_FEE_BPS    | 35    | 0.35% to Rex protocol treasury       |
//! | CREATOR_FEE_BPS     | 15    | 0.15% to V2 CTO / creator vault      |
//! | MARKETING_FEE_BPS   | 40    | 0.40% to marketing wallet            |
//! | Total trade tax     | 90 bps = 0.90%                       |

/// 0.35% — Rex protocol fee on buys and sells (basis points).
pub const PLATFORM_FEE_BPS: u64 = 35;

/// 0.15% — creator / V2 CTO vault on buys and sells (basis points).
/// Accumulates in the creator vault; founder withdraws to their wallet.
pub const CREATOR_FEE_BPS: u64 = 15;

/// 0.40% — project marketing wallet on buys and sells (basis points).
/// Hits $500 marketing target near ~$125k volume.
pub const MARKETING_FEE_BPS: u64 = 40;

pub const BPS_DENOMINATOR: u64 = 10_000;

/// Total trade fee (platform + creator + marketing).
pub const TRADE_FEE_BPS: u64 = PLATFORM_FEE_BPS + CREATOR_FEE_BPS + MARKETING_FEE_BPS;

/// SPL token decimals for project coins.
pub const TOKEN_DECIMALS: u8 = 6;

/// Starting virtual SOL reserves for the bonding curve (30 SOL).
pub const INITIAL_VIRTUAL_SOL: u64 = 30_000_000_000;

/// Starting virtual token reserves (1.073B tokens at 6 decimals).
pub const INITIAL_VIRTUAL_TOKENS: u64 = 1_073_000_000_000_000;
