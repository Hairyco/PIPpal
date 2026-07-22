#[derive(Accounts)]
pub struct WithdrawCreatorFees<'info> {
    #[account(
        mut,
        constraint = founder.key() == project.founder @ RexError::Unauthorized,
    )]
    pub founder: Signer<'info>,

    #[account(seeds = [b"project", project.mint.as_ref()], bump = project.bump)]
    pub project: Account<'info, Project>,

    /// CHECK: creator fee vault PDA
    #[account(
        mut,
        seeds = [b"creator_vault", project.key().as_ref()],
        bump = project.creator_bump,
    )]
    pub creator_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
