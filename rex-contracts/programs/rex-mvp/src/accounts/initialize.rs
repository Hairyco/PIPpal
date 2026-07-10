#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: protocol treasury receives 1% trade fees
    pub protocol_treasury: UncheckedAccount<'info>,

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
