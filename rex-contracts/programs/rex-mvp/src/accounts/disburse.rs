use anchor_lang::prelude::*;

use crate::errors::RexError;
use crate::state::{Project, RexConfig, WhitelistedProvider};

#[derive(Accounts)]
pub struct DisburseMarketing<'info> {
    #[account(constraint = authority.key() == config.authority @ RexError::Unauthorized)]
    pub authority: Signer<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    #[account(seeds = [b"project", project.mint.as_ref()], bump = project.bump)]
    pub project: Account<'info, Project>,

    #[account(
        seeds = [b"whitelist", supplier.key().as_ref()],
        bump = whitelist_entry.bump,
        constraint = whitelist_entry.provider == supplier.key() @ RexError::ProviderNotWhitelisted,
        constraint = whitelist_entry.active @ RexError::ProviderNotWhitelisted,
    )]
    pub whitelist_entry: Account<'info, WhitelistedProvider>,

    /// CHECK: marketing vault PDA
    #[account(
        mut,
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump = project.marketing_bump,
    )]
    pub marketing_vault: UncheckedAccount<'info>,

    /// CHECK: whitelisted supplier receives SOL
    #[account(mut)]
    pub supplier: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
