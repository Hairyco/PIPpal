//! Rex MVP — Solana smart contract entry point.
//!
//! # Module map (for investors and auditors)
//!
//! | Module        | Purpose                                      |
//! |---------------|----------------------------------------------|
//! | `constants`   | Fee percentages and curve defaults           |
//! | `fees`        | 1% platform + 5% marketing split             |
//! | `curve`       | Bonding curve pricing math                   |
//! | `state`       | On-chain account layouts                     |
//! | `accounts`    | Per-instruction account validation           |
//! | `instructions`| Business logic handlers                      |
//! | `events`      | On-chain logs for indexers / UI              |
//! | `transfer`    | SOL movement helpers                         |
//! | `errors`      | Human-readable failure reasons               |

use anchor_lang::prelude::*;

pub mod accounts;
pub mod constants;
pub mod curve;
pub mod errors;
pub mod events;
pub mod fees;
pub mod instructions;
pub mod state;
pub mod transfer;

pub use accounts::*;
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

    /// Founder launches a project: token mint + marketing wallet + curve.
    pub fn launch_project(ctx: Context<LaunchProject>, trading_enabled: bool) -> Result<()> {
        instructions::launch_project(ctx, trading_enabled)
    }

    /// Investor buys project tokens with SOL (6% tax: 1% Rex + 5% marketing).
    pub fn buy(ctx: Context<Buy>, sol_amount: u64, min_tokens_out: u64) -> Result<()> {
        instructions::buy(ctx, sol_amount, min_tokens_out)
    }

    /// Investor sells project tokens for SOL (6% tax on gross SOL out).
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
}
