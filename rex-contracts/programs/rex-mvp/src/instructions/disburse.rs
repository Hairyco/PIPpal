use anchor_lang::prelude::*;

use crate::DisburseMarketing;
use crate::errors::RexError;
use crate::events::MarketingDisbursed;
use crate::transfer::transfer_lamports_signed;

pub fn handler(ctx: Context<DisburseMarketing>, amount: u64) -> Result<()> {
    require!(amount > 0, RexError::ZeroAmount);

    let marketing_info = ctx.accounts.marketing_vault.to_account_info();
    require!(
        marketing_info.lamports() >= amount,
        RexError::InsufficientMarketingBalance
    );

    let project_key = ctx.accounts.project.key();
    let seeds = &[
        b"marketing_vault",
        project_key.as_ref(),
        &[ctx.accounts.project.marketing_bump],
    ];
    let signer = &[&seeds[..]];

    transfer_lamports_signed(
        &marketing_info,
        &ctx.accounts.supplier.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        signer,
        amount,
    )?;

    emit!(MarketingDisbursed {
        project: ctx.accounts.project.key(),
        supplier: ctx.accounts.supplier.key(),
        lamports: amount,
    });

    Ok(())
}
