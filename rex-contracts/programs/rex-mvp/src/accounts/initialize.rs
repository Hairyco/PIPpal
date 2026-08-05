#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: protocol treasury receives platform + unclaimed raid + service fees
    pub protocol_treasury: UncheckedAccount<'info>,

    /// CHECK: restricted keeper for disbursements / sweeps (defaults to authority if same)
    pub keeper: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = RexConfig::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, RexConfig>,

    pub system_program: Program<'info, System>,
}
