#[derive(Accounts)]
#[instruction(invoice_id: [u8; 32])]
pub struct DisburseMarketing<'info> {
    /// Authority or keeper may disburse (also pays rent for receipt PDA).
    #[account(
        mut,
        constraint = (
            authority.key() == config.authority || authority.key() == config.keeper
        ) @ RexError::Unauthorized
    )]
    pub authority: Signer<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    #[account(
        mut,
        seeds = [b"project", project.mint.as_ref()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        seeds = [b"whitelist", supplier.key().as_ref()],
        bump = whitelist_entry.bump,
        constraint = whitelist_entry.provider == supplier.key() @ RexError::ProviderNotWhitelisted,
        constraint = whitelist_entry.active @ RexError::ProviderNotWhitelisted,
    )]
    pub whitelist_entry: Account<'info, WhitelistedProvider>,

    /// CHECK: marketing vault PDA
    #[account(
        mut,
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump = project.marketing_bump,
    )]
    pub marketing_vault: UncheckedAccount<'info>,

    /// CHECK: whitelisted supplier receives 100% of invoice
    #[account(mut)]
    pub supplier: UncheckedAccount<'info>,

    /// CHECK: receives 10% CTOgo service fee
    #[account(
        mut,
        constraint = protocol_treasury.key() == config.protocol_treasury @ RexError::Unauthorized,
    )]
    pub protocol_treasury: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = DisbursementReceipt::LEN,
        seeds = [b"disburse", project.key().as_ref(), invoice_id.as_ref()],
        bump
    )]
    pub receipt: Account<'info, DisbursementReceipt>,

    pub system_program: Program<'info, System>,
}
