//! Fee and curve constants — single source of truth for investor review.
//!
//! | Constant            | Value | Meaning                          |
//! |---------------------|-------|----------------------------------|
//! | PLATFORM_FEE_BPS    | 100   | 1% to Rex on every buy and sell  |
//! | MARKETING_FEE_BPS   | 500   | 5% to marketing wallet           |
//! | Total trade tax     | 600 bps = 6%                       |

/// 1% — Rex protocol fee on buys and sells (basis points).
pub const PLATFORM_FEE_BPS: u64 = 100;

/// 5% — project marketing wallet on buys and sells (basis points).
pub const MARKETING_FEE_BPS: u64 = 500;

pub const BPS_DENOMINATOR: u64 = 10_000;

/// SPL token decimals for project coins.
pub const TOKEN_DECIMALS: u8 = 6;

/// Starting virtual SOL reserves for the bonding curve (30 SOL).
pub const INITIAL_VIRTUAL_SOL: u64 = 30_000_000_000;

/// Starting virtual token reserves (1.073B tokens at 6 decimals).
pub const INITIAL_VIRTUAL_TOKENS: u64 = 1_073_000_000_000_000;
