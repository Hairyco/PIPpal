use anchor_lang::prelude::*;

use crate::LaunchProject;
use crate::constants::{
    ENGINE_LAUNCH, ENGINE_LIST, FEE_MODE_CREATOR, FEE_MODE_TRADER_CASHBACK, INITIAL_VIRTUAL_SOL,
    INITIAL_VIRTUAL_TOKENS,
};
use crate::errors::RexError;
use crate::events::ProjectLaunched;

pub fn handler(
    ctx: Context<LaunchProject>,
    trading_enabled: bool,
    fee_mode: u8,
    engine: u8,
) -> Result<()> {
    require!(
        fee_mode == FEE_MODE_CREATOR || fee_mode == FEE_MODE_TRADER_CASHBACK,
        RexError::InvalidFeeMode
    );
    require!(
        engine == ENGINE_LAUNCH || engine == ENGINE_LIST,
        RexError::InvalidEngine
    );

    let clock = Clock::get()?;
    // Launch attaches MW from day 0; List routes marketing tax to treasury until attach.
    let marketing_attached = engine == ENGINE_LAUNCH;

    let project = &mut ctx.accounts.project;
    project.founder = ctx.accounts.founder.key();
    project.mint = ctx.accounts.mint.key();
    project.launched_at = clock.unix_timestamp;
    project.trading_enabled = trading_enabled;
    project.fee_mode = fee_mode;
    project.engine = engine;
    project.marketing_attached = marketing_attached;
    project.spend_paused = false;
    project.last_marketing_activity_at = clock.unix_timestamp;
    project.virtual_sol_reserves = INITIAL_VIRTUAL_SOL;
    project.virtual_token_reserves = INITIAL_VIRTUAL_TOKENS;
    project.real_sol_reserves = 0;
    project.bump = ctx.bumps.project;
    project.marketing_bump = ctx.bumps.marketing_vault;
    project.creator_bump = ctx.bumps.creator_vault;
    project.curve_bump = ctx.bumps.curve_vault;

    emit!(ProjectLaunched {
        project: project.key(),
        founder: project.founder,
        mint: project.mint,
        trading_enabled,
        fee_mode,
        engine,
        marketing_attached,
    });

    Ok(())
}
