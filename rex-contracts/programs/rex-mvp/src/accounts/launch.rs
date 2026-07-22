#[derive(Accounts)]
pub struct LaunchProject<'info> {
    #[account(mut)]
    pub founder: Signer<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    #[account(
        init,
        payer = founder,
        space = Project::LEN,
        seeds = [b"project", mint.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = founder,
        mint::decimals = TOKEN_DECIMALS,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    /// CHECK: PDA mint authority
    #[account(seeds = [b"mint_auth", project.key().as_ref()], bump)]
    pub mint_authority: UncheckedAccount<'info>,

    /// CHECK: marketing wallet — holds SOL from 0.40% trade tax
    #[account(
        init,
        payer = founder,
        space = 8,
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump
    )]
    pub marketing_vault: UncheckedAccount<'info>,

    /// CHECK: creator fee vault — holds SOL from 0.15% trade tax; founder withdraws
    #[account(
        init,
        payer = founder,
        space = 8,
        seeds = [b"creator_vault", project.key().as_ref()],
        bump
    )]
    pub creator_vault: UncheckedAccount<'info>,

    /// CHECK: bonding curve SOL vault
    #[account(
        init,
        payer = founder,
        space = 8,
        seeds = [b"curve_vault", project.key().as_ref()],
        bump
    )]
    pub curve_vault: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
