use anchor_lang::prelude::*;

use crate::{
    AttachMarketingWallet, SetKeeper, SetProtocolPaused, SetSpendPaused, SweepInactiveMarketing,
};
use crate::constants::MARKETING_INACTIVITY_SECS;
use crate::errors::RexError;
use crate::events::{
    KeeperUpdated, MarketingAttached, MarketingSwept, ProtocolPaused, SpendPaused,
};
use crate::transfer::transfer_lamports_from_owned_pda;

pub fn attach_marketing_wallet(ctx: Context<AttachMarketingWallet>) -> Result<()> {
    require!(
        !ctx.accounts.project.marketing_attached,
        RexError::MarketingAlreadyAttached
    );
    let clock = Clock::get()?;
    let project = &mut ctx.accounts.project;
    project.marketing_attached = true;
    project.last_marketing_activity_at = clock.unix_timestamp;

    emit!(MarketingAttached {
        project: project.key(),
        founder: ctx.accounts.founder.key(),
    });
    Ok(())
}

pub fn set_protocol_paused(ctx: Context<SetProtocolPaused>, paused: bool) -> Result<()> {
    ctx.accounts.config.paused = paused;
    emit!(ProtocolPaused {
        paused,
        authority: ctx.accounts.authority.key(),
    });
    Ok(())
}

pub fn set_spend_paused(ctx: Context<SetSpendPaused>, spend_paused: bool) -> Result<()> {
    ctx.accounts.project.spend_paused = spend_paused;
    emit!(SpendPaused {
        project: ctx.accounts.project.key(),
        spend_paused,
        actor: ctx.accounts.actor.key(),
    });
    Ok(())
}

pub fn set_keeper(ctx: Context<SetKeeper>) -> Result<()> {
    ctx.accounts.config.keeper = ctx.accounts.keeper.key();
    emit!(KeeperUpdated {
        keeper: ctx.accounts.keeper.key(),
        authority: ctx.accounts.authority.key(),
    });
    Ok(())
}

pub fn sweep_inactive_marketing(ctx: Context<SweepInactiveMarketing>) -> Result<()> {
    require!(!ctx.accounts.config.paused, RexError::ProtocolPaused);
    require!(!ctx.accounts.project.spend_paused, RexError::SpendPaused);
    require!(
        ctx.accounts.project.marketing_attached,
        RexError::InvalidMarketingDestination
    );

    let now = Clock::get()?.unix_timestamp;
    let last = ctx.accounts.project.last_marketing_activity_at;
    require!(
        now.saturating_sub(last) >= MARKETING_INACTIVITY_SECS,
        RexError::SweepNotDue
    );

    let vault = ctx.accounts.marketing_vault.to_account_info();
    let rent = Rent::get()?;
    let min_rent = rent.minimum_balance(vault.data_len());
    let available = vault.lamports().saturating_sub(min_rent);
    require!(available > 0, RexError::ZeroAmount);

    transfer_lamports_from_owned_pda(
        &vault,
        &ctx.accounts.protocol_treasury.to_account_info(),
        available,
    )?;

    ctx.accounts.project.last_marketing_activity_at = now;

    emit!(MarketingSwept {
        project: ctx.accounts.project.key(),
        lamports: available,
        actor: ctx.accounts.authority.key(),
    });
    Ok(())
}
