#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(mut, seeds = [b"project", mint.key().as_ref()], bump = project.bump)]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = seller_token_account.mint == mint.key(),
        constraint = seller_token_account.owner == seller.key(),
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// CHECK: marketing vault PDA
    #[account(
        mut,
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump = project.marketing_bump,
    )]
    pub marketing_vault: UncheckedAccount<'info>,

    /// CHECK: vault if attached, else protocol treasury — validated in handler
    #[account(mut)]
    pub marketing_destination: UncheckedAccount<'info>,

    /// CHECK: creator fee vault PDA
    #[account(
        mut,
        seeds = [b"creator_vault", project.key().as_ref()],
        bump = project.creator_bump,
    )]
    pub creator_vault: UncheckedAccount<'info>,

    /// CHECK: protocol treasury
    #[account(
        mut,
        constraint = protocol_treasury.key() == config.protocol_treasury @ RexError::Unauthorized,
    )]
    pub protocol_treasury: UncheckedAccount<'info>,

    /// CHECK: raid referrer; pass protocol_treasury when unclaimed
    #[account(mut)]
    pub raider: UncheckedAccount<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    /// CHECK: curve vault PDA
    #[account(
        mut,
        seeds = [b"curve_vault", project.key().as_ref()],
        bump = project.curve_bump,
    )]
    pub curve_vault: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
