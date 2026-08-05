use anchor_lang::prelude::*;

use crate::DisburseMarketing;
use crate::errors::RexError;
use crate::events::MarketingDisbursed;
use crate::fees::invoice_with_service_fee;
use crate::transfer::transfer_lamports_from_owned_pda;

pub fn handler(
    ctx: Context<DisburseMarketing>,
    invoice_id: [u8; 32],
    invoice_lamports: u64,
) -> Result<()> {
    require!(invoice_lamports > 0, RexError::ZeroAmount);
    require!(!ctx.accounts.config.paused, RexError::ProtocolPaused);
    require!(!ctx.accounts.project.spend_paused, RexError::SpendPaused);
    require!(
        ctx.accounts.project.marketing_attached,
        RexError::InvalidMarketingDestination
    );

    let (service_fee, total_debit) = invoice_with_service_fee(invoice_lamports)?;

    let marketing_info = ctx.accounts.marketing_vault.to_account_info();
    let rent = Rent::get()?;
    let min_rent = rent.minimum_balance(marketing_info.data_len());
    let available = marketing_info.lamports().saturating_sub(min_rent);
    require!(
        available >= total_debit,
        RexError::InsufficientMarketingBalance
    );

    // Supplier gets 100% of invoice; CTOgo gets 20% on top.
    transfer_lamports_from_owned_pda(
        &marketing_info,
        &ctx.accounts.supplier.to_account_info(),
        invoice_lamports,
    )?;
    transfer_lamports_from_owned_pda(
        &ctx.accounts.marketing_vault.to_account_info(),
        &ctx.accounts.protocol_treasury.to_account_info(),
        service_fee,
    )?;

    let clock = Clock::get()?;
    let receipt = &mut ctx.accounts.receipt;
    receipt.project = ctx.accounts.project.key();
    receipt.invoice_id = invoice_id;
    receipt.supplier = ctx.accounts.supplier.key();
    receipt.invoice_lamports = invoice_lamports;
    receipt.service_fee_lamports = service_fee;
    receipt.total_debit_lamports = total_debit;
    receipt.actor = ctx.accounts.authority.key();
    receipt.disbursed_at = clock.unix_timestamp;
    receipt.bump = ctx.bumps.receipt;

    ctx.accounts.project.last_marketing_activity_at = clock.unix_timestamp;

    emit!(MarketingDisbursed {
        project: ctx.accounts.project.key(),
        supplier: ctx.accounts.supplier.key(),
        invoice_lamports,
        service_fee_lamports: service_fee,
        total_debit_lamports: total_debit,
        actor: ctx.accounts.authority.key(),
        invoice_id,
    });

    Ok(())
}
