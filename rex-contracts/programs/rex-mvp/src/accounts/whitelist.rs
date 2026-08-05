#[derive(Accounts)]
pub struct AddWhitelistProvider<'info> {
    #[account(
        constraint = authority.key() == config.authority @ RexError::Unauthorized,
        mut,
    )]
    pub authority: Signer<'info>,

    /// CHECK: supplier wallet to whitelist
    pub provider: UncheckedAccount<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    #[account(
        init,
        payer = authority,
        space = WhitelistedProvider::LEN,
        seeds = [b"whitelist", provider.key().as_ref()],
        bump
    )]
    pub whitelist_entry: Account<'info, WhitelistedProvider>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetWhitelistActive<'info> {
    #[account(constraint = authority.key() == config.authority @ RexError::Unauthorized)]
    pub authority: Signer<'info>,

    /// CHECK: supplier wallet
    pub provider: UncheckedAccount<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    #[account(
        mut,
        seeds = [b"whitelist", provider.key().as_ref()],
        bump = whitelist_entry.bump,
        constraint = whitelist_entry.provider == provider.key() @ RexError::ProviderNotWhitelisted,
    )]
    pub whitelist_entry: Account<'info, WhitelistedProvider>,
}
