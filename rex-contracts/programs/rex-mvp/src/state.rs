//! On-chain account layouts — CTOgo protocol + project + receipts.

use anchor_lang::prelude::*;

/// Global CTOgo protocol settings (one per deployment).
#[account]
pub struct RexConfig {
    pub authority: Pubkey,
    pub protocol_treasury: Pubkey,
    /// Restricted signer that may disburse / sweep (not whitelist admin).
    pub keeper: Pubkey,
    pub paused: bool,
    pub bump: u8,
}

impl RexConfig {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 1;
}

/// Per-project state: founder, mint, bonding curve reserves, vault bumps, MW flags.
#[account]
pub struct Project {
    pub founder: Pubkey,
    pub mint: Pubkey,
    pub launched_at: i64,
    pub trading_enabled: bool,
    /// Locked at launch: `FEE_MODE_CREATOR` or `FEE_MODE_TRADER_CASHBACK`.
    pub fee_mode: u8,
    /// Locked at launch: `ENGINE_LAUNCH` or `ENGINE_LIST`.
    pub engine: u8,
    /// When false, marketing trade tax routes to protocol treasury (List until attach).
    pub marketing_attached: bool,
    /// Founder/ops pause for marketing spend (blocks disburse + sweep).
    pub spend_paused: bool,
    /// Last Unix time marketing vault received trade tax or a disbursement.
    pub last_marketing_activity_at: i64,
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub bump: u8,
    pub marketing_bump: u8,
    pub creator_bump: u8,
    pub curve_bump: u8,
}

impl Project {
    // discriminator + fields
    pub const LEN: usize = 8
        + 32
        + 32
        + 8
        + 1
        + 1
        + 1
        + 1
        + 1
        + 8
        + 8
        + 8
        + 8
        + 1
        + 1
        + 1
        + 1;
}

/// A supplier wallet approved by CTOgo to receive marketing wallet payments.
#[account]
pub struct WhitelistedProvider {
    pub provider: Pubkey,
    pub active: bool,
    pub bump: u8,
}

impl WhitelistedProvider {
    pub const LEN: usize = 8 + 32 + 1 + 1;
}

/// Idempotency receipt for a marketing disbursement (one per project + invoice_id).
#[account]
pub struct DisbursementReceipt {
    pub project: Pubkey,
    pub invoice_id: [u8; 32],
    pub supplier: Pubkey,
    pub invoice_lamports: u64,
    pub service_fee_lamports: u64,
    pub total_debit_lamports: u64,
    pub actor: Pubkey,
    pub disbursed_at: i64,
    pub bump: u8,
}

impl DisbursementReceipt {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 32 + 8 + 1;
}
