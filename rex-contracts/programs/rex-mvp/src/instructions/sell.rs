use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn};

use crate::Sell;
use crate::curve::{apply_sell_to_reserves, quote_sell_sol};
use crate::errors::RexError;
use crate::events::TradeExecuted;
use crate::fees::apply_trade_fees;
use crate::transfer::transfer_lamports_signed;

pub fn handler(ctx: Context<Sell>, token_amount: u64, min_sol_out: u64) -> Result<()> {
    require!(token_amount > 0, RexError::ZeroAmount);
    require!(ctx.accounts.project.trading_enabled, RexError::TradingDisabled);

    let project = &mut ctx.accounts.project;
    let gross_sol = quote_sell_sol(project, token_amount)?;
    let (platform_fee, marketing_fee, user_sol) = apply_trade_fees(gross_sol)?;
    require!(user_sol >= min_sol_out, RexError::SlippageExceeded);

    require!(
        ctx.accounts.curve_vault.lamports() >= gross_sol,
        RexError::InsufficientCurveLiquidity
    );

    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        ),
        token_amount,
    )?;

    let project_key = project.key();
    let curve_seeds = &[b"curve_vault", project_key.as_ref(), &[project.curve_bump]];
    let curve_signer = &[&curve_seeds[..]];

    transfer_lamports_signed(
        &ctx.accounts.curve_vault.to_account_info(),
        &ctx.accounts.protocol_treasury.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        curve_signer,
        platform_fee,
    )?;
    transfer_lamports_signed(
        &ctx.accounts.curve_vault.to_account_info(),
        &ctx.accounts.marketing_vault.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        curve_signer,
        marketing_fee,
    )?;
    transfer_lamports_signed(
        &ctx.accounts.curve_vault.to_account_info(),
        &ctx.accounts.seller.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        curve_signer,
        user_sol,
    )?;

    apply_sell_to_reserves(project, gross_sol, token_amount)?;

    emit!(TradeExecuted {
        project: project.key(),
        trader: ctx.accounts.seller.key(),
        is_buy: false,
        gross_lamports: gross_sol,
        platform_fee_lamports: platform_fee,
        marketing_fee_lamports: marketing_fee,
        tokens: token_amount,
    });

    Ok(())
}
