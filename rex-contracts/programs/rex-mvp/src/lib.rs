//! Rex MVP — Solana smart contract entry point.
//!
//! # Module map (for investors and auditors)
//!
//! | Module        | Purpose                                                    |
//! |---------------|------------------------------------------------------------|
//! | `constants`   | Fee percentages and curve defaults                         |
//! | `fees`        | Launch tier 0.35% + 0.20% + 0.40% (0.95%); Mode A/B at deploy |
//! | `curve`       | Bonding curve pricing math                                 |
//! | `state`       | On-chain account layouts                                   |
//! | `accounts`    | Per-instruction account validation                         |
//! | `instructions`| Business logic handlers                                    |
//! | `events`      | On-chain logs for indexers / UI                            |
//! | `transfer`    | SOL movement helpers                                       |
//! | `errors`      | Human-readable failure reasons                             |

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
use state::{Project, RexConfig, WhitelistedProvider};

// Account validation structs must be in the crate root for Anchor's `#[program]` macro.
include!("accounts/initialize.rs");
include!("accounts/launch.rs");
include!("accounts/buy.rs");
include!("accounts/sell.rs");
include!("accounts/whitelist.rs");
include!("accounts/disburse.rs");
include!("accounts/withdraw_creator.rs");

pub use constants::*;
pub use events::*;
pub use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod rex_mvp {
    use super::*;

    /// One-time Rex protocol setup.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    /// Founder launches a project: token mint + marketing/creator vaults + curve.
    /// `fee_mode`: 0 = creator keeps fees (CTO enabled), 1 = trader cashback (CTO disabled).
    pub fn launch_project(
        ctx: Context<LaunchProject>,
        trading_enabled: bool,
        fee_mode: u8,
    ) -> Result<()> {
        instructions::launch_project(ctx, trading_enabled, fee_mode)
    }

    /// Investor buys project tokens with SOL (launch-tier 0.95% tax).
    pub fn buy(ctx: Context<Buy>, sol_amount: u64, min_tokens_out: u64) -> Result<()> {
        instructions::buy(ctx, sol_amount, min_tokens_out)
    }

    /// Investor sells project tokens for SOL (launch-tier 0.95% tax on gross SOL out).
    pub fn sell(ctx: Context<Sell>, token_amount: u64, min_sol_out: u64) -> Result<()> {
        instructions::sell(ctx, token_amount, min_sol_out)
    }

    /// Rex authority adds a supplier wallet to the whitelist.
    pub fn add_whitelist_provider(ctx: Context<AddWhitelistProvider>) -> Result<()> {
        instructions::add_whitelist_provider(ctx)
    }

    /// Rex authority pays a whitelisted supplier from the marketing wallet.
    pub fn disburse_marketing(ctx: Context<DisburseMarketing>, amount: u64) -> Result<()> {
        instructions::disburse_marketing(ctx, amount)
    }

    /// Founder withdraws accumulated creator fees to their wallet.
    pub fn withdraw_creator_fees(ctx: Context<WithdrawCreatorFees>, amount: u64) -> Result<()> {
        instructions::withdraw_creator_fees(ctx, amount)
    }
}
