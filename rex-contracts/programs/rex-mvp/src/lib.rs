//! CTOgo MVP — Solana smart contract entry point.
//!
//! Dual fee engines: List 1.25% / Launch 1.30% with raid + marketing wallet.
//! Marketing disbursements charge 5% CTOgo service fee on top of supplier invoice.

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

pub mod constants;
pub mod curve;
pub mod errors;
pub mod events;
pub mod fees;
pub mod instructions;
pub mod state;
pub mod transfer;

use constants::TOKEN_DECIMALS;
use errors::RexError;
use state::{DisbursementReceipt, Project, RexConfig, WhitelistedProvider};

include!("accounts/initialize.rs");
include!("accounts/launch.rs");
include!("accounts/buy.rs");
include!("accounts/sell.rs");
include!("accounts/whitelist.rs");
include!("accounts/disburse.rs");
include!("accounts/withdraw_creator.rs");
include!("accounts/admin.rs");

pub use constants::*;
pub use events::*;
pub use state::*;

declare_id!("6jyy1kbGo7W8jDwkMKxKLpNa4TbjnKZWrmjCGdxwSqQ3");

#[program]
pub mod rex_mvp {
    use super::*;

    /// One-time CTOgo protocol setup (authority, treasury, keeper).
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    /// Founder launches a project: token mint + marketing/creator vaults + curve.
    /// `fee_mode`: 0 = creator keeps fees, 1 = trader cashback.
    /// `engine`: 0 = Launch (1.30%), 1 = List (1.25%).
    pub fn launch_project(
        ctx: Context<LaunchProject>,
        trading_enabled: bool,
        fee_mode: u8,
        engine: u8,
    ) -> Result<()> {
        instructions::launch_project(ctx, trading_enabled, fee_mode, engine)
    }

    /// Investor buys project tokens with SOL (engine tax + optional raid).
    pub fn buy(ctx: Context<Buy>, sol_amount: u64, min_tokens_out: u64) -> Result<()> {
        instructions::buy(ctx, sol_amount, min_tokens_out)
    }

    /// Investor sells project tokens for SOL (engine tax on gross SOL out).
    pub fn sell(ctx: Context<Sell>, token_amount: u64, min_sol_out: u64) -> Result<()> {
        instructions::sell(ctx, token_amount, min_sol_out)
    }

    /// Authority adds a supplier wallet to the whitelist.
    pub fn add_whitelist_provider(ctx: Context<AddWhitelistProvider>) -> Result<()> {
        instructions::add_whitelist_provider(ctx)
    }

    /// Authority activates or deactivates a whitelisted supplier.
    pub fn set_whitelist_active(ctx: Context<SetWhitelistActive>, active: bool) -> Result<()> {
        instructions::set_whitelist_active(ctx, active)
    }

    /// Authority or keeper pays invoice + 5% CTOgo fee from marketing vault (idempotent).
    pub fn disburse_marketing(
        ctx: Context<DisburseMarketing>,
        invoice_id: [u8; 32],
        invoice_lamports: u64,
    ) -> Result<()> {
        instructions::disburse_marketing(ctx, invoice_id, invoice_lamports)
    }

    /// List path: flip marketing destination from treasury → vault.
    pub fn attach_marketing_wallet(ctx: Context<AttachMarketingWallet>) -> Result<()> {
        instructions::attach_marketing_wallet(ctx)
    }

    /// Authority pauses/unpauses all trading + disbursements.
    pub fn set_protocol_paused(ctx: Context<SetProtocolPaused>, paused: bool) -> Result<()> {
        instructions::set_protocol_paused(ctx, paused)
    }

    /// Founder or authority pauses marketing spend for one project.
    pub fn set_spend_paused(ctx: Context<SetSpendPaused>, spend_paused: bool) -> Result<()> {
        instructions::set_spend_paused(ctx, spend_paused)
    }

    /// Authority rotates the keeper key.
    pub fn set_keeper(ctx: Context<SetKeeper>) -> Result<()> {
        instructions::set_keeper(ctx)
    }

    /// Sweep inactive marketing vault (≥180 days) to protocol treasury.
    pub fn sweep_inactive_marketing(ctx: Context<SweepInactiveMarketing>) -> Result<()> {
        instructions::sweep_inactive_marketing(ctx)
    }

    /// Founder withdraws accumulated creator fees to their wallet.
    pub fn withdraw_creator_fees(ctx: Context<WithdrawCreatorFees>, amount: u64) -> Result<()> {
        instructions::withdraw_creator_fees(ctx, amount)
    }
}
