use anchor_lang::prelude::*;

use crate::{AddWhitelistProvider, SetWhitelistActive};
use crate::events::{ProviderWhitelistUpdated, ProviderWhitelisted};

pub fn add_handler(ctx: Context<AddWhitelistProvider>) -> Result<()> {
    let entry = &mut ctx.accounts.whitelist_entry;
    entry.provider = ctx.accounts.provider.key();
    entry.active = true;
    entry.bump = ctx.bumps.whitelist_entry;

    emit!(ProviderWhitelisted {
        provider: entry.provider,
    });

    Ok(())
}

pub fn set_active_handler(ctx: Context<SetWhitelistActive>, active: bool) -> Result<()> {
    let entry = &mut ctx.accounts.whitelist_entry;
    entry.active = active;

    emit!(ProviderWhitelistUpdated {
        provider: entry.provider,
        active,
    });

    Ok(())
}
