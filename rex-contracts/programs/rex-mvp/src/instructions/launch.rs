use anchor_lang::prelude::*;

use crate::accounts::LaunchProject;
use crate::constants::{INITIAL_VIRTUAL_SOL, INITIAL_VIRTUAL_TOKENS};
use crate::events::ProjectLaunched;

pub fn handler(ctx: Context<LaunchProject>, trading_enabled: bool) -> Result<()> {
    let clock = Clock::get()?;
    let project = &mut ctx.accounts.project;
    project.founder = ctx.accounts.founder.key();
    project.mint = ctx.accounts.mint.key();
    project.launched_at = clock.unix_timestamp;
    project.trading_enabled = trading_enabled;
    project.virtual_sol_reserves = INITIAL_VIRTUAL_SOL;
    project.virtual_token_reserves = INITIAL_VIRTUAL_TOKENS;
    project.real_sol_reserves = 0;
    project.bump = ctx.bumps.project;
    project.marketing_bump = ctx.bumps.marketing_vault;
    project.curve_bump = ctx.bumps.curve_vault;

    emit!(ProjectLaunched {
        project: project.key(),
        founder: project.founder,
        mint: project.mint,
        trading_enabled,
    });

    Ok(())
}
