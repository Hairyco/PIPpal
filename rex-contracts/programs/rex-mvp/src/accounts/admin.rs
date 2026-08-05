#[derive(Accounts)]
pub struct AttachMarketingWallet<'info> {
    #[account(mut, constraint = founder.key() == project.founder @ RexError::Unauthorized)]
    pub founder: Signer<'info>,

    #[account(
        mut,
        seeds = [b"project", project.mint.as_ref()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,

    /// CHECK: marketing vault PDA must already exist from launch
    #[account(
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump = project.marketing_bump,
    )]
    pub marketing_vault: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct SetProtocolPaused<'info> {
    #[account(constraint = authority.key() == config.authority @ RexError::Unauthorized)]
    pub authority: Signer<'info>,

    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,
}

#[derive(Accounts)]
pub struct SetSpendPaused<'info> {
    /// Founder or protocol authority may pause spend.
    #[account(
        constraint = (
            actor.key() == project.founder || actor.key() == config.authority
        ) @ RexError::Unauthorized
    )]
    pub actor: Signer<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    #[account(
        mut,
        seeds = [b"project", project.mint.as_ref()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,
}

#[derive(Accounts)]
pub struct SetKeeper<'info> {
    #[account(constraint = authority.key() == config.authority @ RexError::Unauthorized)]
    pub authority: Signer<'info>,

    /// CHECK: new keeper pubkey
    pub keeper: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,
}

#[derive(Accounts)]
pub struct SweepInactiveMarketing<'info> {
    #[account(
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

    /// CHECK: marketing vault PDA
    #[account(
        mut,
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump = project.marketing_bump,
    )]
    pub marketing_vault: UncheckedAccount<'info>,

    /// CHECK: protocol treasury
    #[account(
        mut,
        constraint = protocol_treasury.key() == config.protocol_treasury @ RexError::Unauthorized,
    )]
    pub protocol_treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
