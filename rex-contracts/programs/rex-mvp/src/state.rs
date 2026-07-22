//! On-chain account layouts — what data Rex stores per project.

use anchor_lang::prelude::*;

/// Global Rex protocol settings (one per deployment).
#[account]
pub struct RexConfig {
    pub authority: Pubkey,
    pub protocol_treasury: Pubkey,
    pub bump: u8,
}

impl RexConfig {
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

/// Per-project state: founder, mint, bonding curve reserves, vault bumps.
#[account]
pub struct Project {
    pub founder: Pubkey,
    pub mint: Pubkey,
    pub launched_at: i64,
    pub trading_enabled: bool,
    /// Locked at launch: `FEE_MODE_CREATOR` or `FEE_MODE_TRADER_CASHBACK`.
    pub fee_mode: u8,
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub bump: u8,
    pub marketing_bump: u8,
    pub creator_bump: u8,
    pub curve_bump: u8,
}

impl Project {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1 + 1 + 8 + 8 + 8 + 1 + 1 + 1 + 1;
}

/// A supplier wallet approved by Rex to receive marketing wallet payments.
#[account]
pub struct WhitelistedProvider {
    pub provider: Pubkey,
    pub active: bool,
    pub bump: u8,
}

impl WhitelistedProvider {
    pub const LEN: usize = 8 + 32 + 1 + 1;
}
