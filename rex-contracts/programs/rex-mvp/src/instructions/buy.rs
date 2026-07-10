use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo};

use crate::Buy;
use crate::curve::{apply_buy_to_reserves, quote_buy_tokens};
use crate::errors::RexError;
use crate::events::TradeExecuted;
use crate::fees::apply_trade_fees;
use crate::transfer::transfer_lamports;

pub fn handler(ctx: Context<Buy>, sol_amount: u64, min_tokens_out: u64) -> Result<()> {
    require!(sol_amount > 0, RexError::ZeroAmount);
    require!(ctx.accounts.project.trading_enabled, RexError::TradingDisabled);

    let (platform_fee, marketing_fee, sol_to_curve) = apply_trade_fees(sol_amount)?;

    let project = &mut ctx.accounts.project;
    let tokens_out = quote_buy_tokens(project, sol_to_curve)?;
    require!(tokens_out >= min_tokens_out, RexError::SlippageExceeded);

    transfer_lamports(
        &ctx.accounts.buyer.to_account_info(),
        &ctx.accounts.protocol_treasury.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        platform_fee,
    )?;
    transfer_lamports(
        &ctx.accounts.buyer.to_account_info(),
        &ctx.accounts.marketing_vault.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        marketing_fee,
    )?;
    transfer_lamports(
        &ctx.accounts.buyer.to_account_info(),
        &ctx.accounts.curve_vault.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        sol_to_curve,
    )?;

    let project_key = project.key();
    let seeds = &[b"mint_auth", project_key.as_ref(), &[ctx.bumps.mint_authority]];
    let signer = &[&seeds[..]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            signer,
        ),
        tokens_out,
    )?;

    apply_buy_to_reserves(project, sol_to_curve, tokens_out)?;

    emit!(TradeExecuted {
        project: project.key(),
        trader: ctx.accounts.buyer.key(),
        is_buy: true,
        gross_lamports: sol_amount,
        platform_fee_lamports: platform_fee,
        marketing_fee_lamports: marketing_fee,
        tokens: tokens_out,
    });

    Ok(())
}
