use anchor_lang::prelude::*;

use crate::WithdrawCreatorFees;
use crate::errors::RexError;
use crate::events::CreatorFeesWithdrawn;
use crate::transfer::transfer_lamports_signed;

pub fn handler(ctx: Context<WithdrawCreatorFees>, amount: u64) -> Result<()> {
    require!(amount > 0, RexError::ZeroAmount);

    let creator_info = ctx.accounts.creator_vault.to_account_info();
    require!(
        creator_info.lamports() >= amount,
        RexError::InsufficientCreatorBalance
    );

    let project_key = ctx.accounts.project.key();
    let seeds = &[
        b"creator_vault",
        project_key.as_ref(),
        &[ctx.accounts.project.creator_bump],
    ];
    let signer = &[&seeds[..]];

    transfer_lamports_signed(
        &creator_info,
        &ctx.accounts.founder.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        signer,
        amount,
    )?;

    emit!(CreatorFeesWithdrawn {
        project: ctx.accounts.project.key(),
        founder: ctx.accounts.founder.key(),
        lamports: amount,
    });

    Ok(())
}
