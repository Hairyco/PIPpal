use anchor_lang::prelude::*;

use crate::Initialize;

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.protocol_treasury = ctx.accounts.protocol_treasury.key();
    config.bump = ctx.bumps.config;
    Ok(())
}
