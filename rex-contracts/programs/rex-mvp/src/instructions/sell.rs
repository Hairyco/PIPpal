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
    require!(!ctx.accounts.config.paused, RexError::ProtocolPaused);
    require!(ctx.accounts.project.trading_enabled, RexError::TradingDisabled);

    let has_referrer = ctx.accounts.raider.key() != ctx.accounts.protocol_treasury.key()
        && ctx.accounts.raider.key() != ctx.accounts.seller.key();

    let project = &mut ctx.accounts.project;
    let gross_sol = quote_sell_sol(project, token_amount)?;
    let (raid_fee, marketing_fee, creator_fee, platform_fee, user_sol) =
        apply_trade_fees(gross_sol, project.engine, has_referrer)?;
    require!(user_sol >= min_sol_out, RexError::SlippageExceeded);

    require!(
        ctx.accounts.curve_vault.lamports() >= gross_sol,
        RexError::InsufficientCurveLiquidity
    );

    let marketing_to_vault = project.marketing_attached;
    if marketing_to_vault {
        require_keys_eq!(
            ctx.accounts.marketing_destination.key(),
            ctx.accounts.marketing_vault.key(),
            RexError::InvalidMarketingDestination
        );
    } else {
        require_keys_eq!(
            ctx.accounts.marketing_destination.key(),
            ctx.accounts.protocol_treasury.key(),
            RexError::InvalidMarketingDestination
        );
    }

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
        &ctx.accounts.creator_vault.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        curve_signer,
        creator_fee,
    )?;
    transfer_lamports_signed(
        &ctx.accounts.curve_vault.to_account_info(),
        &ctx.accounts.marketing_destination.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        curve_signer,
        marketing_fee,
    )?;
    if has_referrer && raid_fee > 0 {
        transfer_lamports_signed(
            &ctx.accounts.curve_vault.to_account_info(),
            &ctx.accounts.raider.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            curve_signer,
            raid_fee,
        )?;
    }
    transfer_lamports_signed(
        &ctx.accounts.curve_vault.to_account_info(),
        &ctx.accounts.seller.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        curve_signer,
        user_sol,
    )?;

    apply_sell_to_reserves(project, gross_sol, token_amount)?;

    if marketing_to_vault && marketing_fee > 0 {
        project.last_marketing_activity_at = Clock::get()?.unix_timestamp;
    }

    let raider_key = if has_referrer {
        ctx.accounts.raider.key()
    } else {
        Pubkey::default()
    };

    emit!(TradeExecuted {
        project: project.key(),
        trader: ctx.accounts.seller.key(),
        is_buy: false,
        engine: project.engine,
        gross_lamports: gross_sol,
        raid_fee_lamports: raid_fee,
        platform_fee_lamports: platform_fee,
        creator_fee_lamports: creator_fee,
        marketing_fee_lamports: marketing_fee,
        marketing_to_vault,
        raider: raider_key,
        tokens: token_amount,
    });

    Ok(())
}
