use anchor_lang::prelude::*;

use crate::accounts::AddWhitelistProvider;
use crate::events::ProviderWhitelisted;

pub fn handler(ctx: Context<AddWhitelistProvider>) -> Result<()> {
    let entry = &mut ctx.accounts.whitelist_entry;
    entry.provider = ctx.accounts.provider.key();
    entry.active = true;
    entry.bump = ctx.bumps.whitelist_entry;

    emit!(ProviderWhitelisted {
        provider: entry.provider,
    });

    Ok(())
}
