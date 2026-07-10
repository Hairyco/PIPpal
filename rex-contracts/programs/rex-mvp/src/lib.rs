use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};

mod errors;
mod state;

use errors::RexError;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod rex_mvp {
    use super::*;

    /// One-time setup: Rex authority + protocol treasury wallet.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.protocol_treasury = ctx.accounts.protocol_treasury.key();
        config.bump = ctx.bumps.config;
        Ok(())
    }

    /// Launch a project: mint + bonding curve + marketing wallet PDA.
    pub fn launch_project(ctx: Context<LaunchProject>, trading_enabled: bool) -> Result<()> {
        let clock = Clock::get()?;
        let project = &mut ctx.accounts.project;
        project.founder = ctx.accounts.founder.key();
        project.mint = ctx.accounts.mint.key();
        project.launched_at = clock.unix_timestamp;
        project.trading_enabled = trading_enabled;
        project.virtual_sol_reserves = INITIAL_VIRTUAL_SOL;
        project.virtual_token_reserves = INITIAL_VIRTUAL_TOKENS;
        project.real_sol_reserves = 0;
        project.bump = ctx.bumps.project;
        project.marketing_bump = ctx.bumps.marketing_vault;
        project.curve_bump = ctx.bumps.curve_vault;

        emit!(ProjectLaunched {
            project: project.key(),
            founder: project.founder,
            mint: project.mint,
            trading_enabled,
        });

        Ok(())
    }

    /// Buy tokens with SOL. 6% tax: 1% protocol + 5% marketing (Option A on net-to-curve).
    pub fn buy(ctx: Context<Buy>, sol_amount: u64, min_tokens_out: u64) -> Result<()> {
        require!(sol_amount > 0, RexError::ZeroAmount);
        require!(ctx.accounts.project.trading_enabled, RexError::TradingDisabled);

        let (platform_fee, marketing_fee, sol_to_curve) = apply_trade_fees(sol_amount)?;

        let project = &mut ctx.accounts.project;
        let tokens_out = quote_buy_tokens(project, sol_to_curve)?;
        require!(tokens_out >= min_tokens_out, RexError::SlippageExceeded);

        // Transfer SOL splits from buyer
        transfer_lamports(
            &ctx.accounts.buyer.to_account_info(),
            &ctx.accounts.protocol_treasury.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            platform_fee,
        )?;
        transfer_lamports(
            &ctx.accounts.buyer.to_account_info(),
            &ctx.accounts.marketing_vault.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            marketing_fee,
        )?;
        transfer_lamports(
            &ctx.accounts.buyer.to_account_info(),
            &ctx.accounts.curve_vault.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            sol_to_curve,
        )?;

        // Mint tokens to buyer
        let project_key = project.key();
        let seeds = &[b"mint_auth", project_key.as_ref(), &[ctx.bumps.mint_authority]];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                signer,
            ),
            tokens_out,
        )?;

        // Update curve state
        project.virtual_sol_reserves = project
            .virtual_sol_reserves
            .checked_add(sol_to_curve)
            .ok_or(RexError::MathOverflow)?;
        project.virtual_token_reserves = project
            .virtual_token_reserves
            .checked_sub(tokens_out)
            .ok_or(RexError::MathOverflow)?;
        project.real_sol_reserves = project
            .real_sol_reserves
            .checked_add(sol_to_curve)
            .ok_or(RexError::MathOverflow)?;

        emit!(TradeExecuted {
            project: project.key(),
            trader: ctx.accounts.buyer.key(),
            is_buy: true,
            gross_lamports: sol_amount,
            platform_fee_lamports: platform_fee,
            marketing_fee_lamports: marketing_fee,
            tokens: tokens_out,
        });

        Ok(())
    }

    /// Sell tokens for SOL. Gross SOL from curve, then 6% tax (Option A) before user payout.
    pub fn sell(ctx: Context<Sell>, token_amount: u64, min_sol_out: u64) -> Result<()> {
        require!(token_amount > 0, RexError::ZeroAmount);
        require!(ctx.accounts.project.trading_enabled, RexError::TradingDisabled);

        let project = &mut ctx.accounts.project;
        let gross_sol = quote_sell_sol(project, token_amount)?;
        let (platform_fee, marketing_fee, user_sol) = apply_trade_fees(gross_sol)?;
        require!(user_sol >= min_sol_out, RexError::SlippageExceeded);

        require!(
            ctx.accounts.curve_vault.lamports() >= gross_sol,
            RexError::InsufficientCurveLiquidity
        );

        // Burn tokens from seller
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            token_amount,
        )?;

        let project_key = project.key();
        let curve_seeds = &[
            b"curve_vault",
            project_key.as_ref(),
            &[project.curve_bump],
        ];
        let curve_signer = &[&curve_seeds[..]];

        transfer_lamports_signed(
            &ctx.accounts.curve_vault.to_account_info(),
            &ctx.accounts.protocol_treasury.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            curve_signer,
            platform_fee,
        )?;
        transfer_lamports_signed(
            &ctx.accounts.curve_vault.to_account_info(),
            &ctx.accounts.marketing_vault.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            curve_signer,
            marketing_fee,
        )?;
        transfer_lamports_signed(
            &ctx.accounts.curve_vault.to_account_info(),
            &ctx.accounts.seller.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            curve_signer,
            user_sol,
        )?;

        project.virtual_sol_reserves = project
            .virtual_sol_reserves
            .checked_sub(gross_sol)
            .ok_or(RexError::MathOverflow)?;
        project.virtual_token_reserves = project
            .virtual_token_reserves
            .checked_add(token_amount)
            .ok_or(RexError::MathOverflow)?;
        project.real_sol_reserves = project
            .real_sol_reserves
            .checked_sub(gross_sol)
            .ok_or(RexError::MathOverflow)?;

        emit!(TradeExecuted {
            project: project.key(),
            trader: ctx.accounts.seller.key(),
            is_buy: false,
            gross_lamports: gross_sol,
            platform_fee_lamports: platform_fee,
            marketing_fee_lamports: marketing_fee,
            tokens: token_amount,
        });

        Ok(())
    }

    /// Rex authority whitelists a supplier wallet for marketing disbursements.
    pub fn add_whitelist_provider(ctx: Context<AddWhitelistProvider>) -> Result<()> {
        let entry = &mut ctx.accounts.whitelist_entry;
        entry.provider = ctx.accounts.provider.key();
        entry.active = true;
        entry.bump = ctx.bumps.whitelist_entry;

        emit!(ProviderWhitelisted {
            provider: entry.provider,
        });

        Ok(())
    }

    /// Pay a whitelisted supplier from the project marketing wallet.
    pub fn disburse_marketing(ctx: Context<DisburseMarketing>, amount: u64) -> Result<()> {
        require!(amount > 0, RexError::ZeroAmount);
        require!(ctx.accounts.whitelist_entry.active, RexError::ProviderNotWhitelisted);

        let marketing_info = ctx.accounts.marketing_vault.to_account_info();
        require!(
            marketing_info.lamports() >= amount,
            RexError::InsufficientMarketingBalance
        );

        let project_key = ctx.accounts.project.key();
        let seeds = &[
            b"marketing_vault",
            project_key.as_ref(),
            &[ctx.accounts.project.marketing_bump],
        ];
        let signer = &[&seeds[..]];

        transfer_lamports_signed(
            &marketing_info,
            &ctx.accounts.supplier.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            signer,
            amount,
        )?;

        emit!(MarketingDisbursed {
            project: ctx.accounts.project.key(),
            supplier: ctx.accounts.supplier.key(),
            lamports: amount,
        });

        Ok(())
    }
}

fn transfer_lamports<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            system_program.clone(),
            system_program::Transfer {
                from: from.clone(),
                to: to.clone(),
            },
        ),
        amount,
    )
}

fn transfer_lamports_signed<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    signer_seeds: &[&[&[u8]]],
    amount: u64,
) -> Result<()> {
    system_program::transfer(
        CpiContext::new_with_signer(
            system_program.clone(),
            system_program::Transfer {
                from: from.clone(),
                to: to.clone(),
            },
            signer_seeds,
        ),
        amount,
    )
}

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

#[derive(Accounts)]
pub struct LaunchProject<'info> {
    #[account(mut)]
    pub founder: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
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
    #[account(
        seeds = [b"mint_auth", project.key().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    /// CHECK: holds marketing wallet SOL (PDA vault)
    #[account(
        init,
        payer = founder,
        space = 8,
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump
    )]
    pub marketing_vault: UncheckedAccount<'info>,

    /// CHECK: holds bonding curve SOL reserves (PDA vault)
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

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"project", mint.key().as_ref()],
        bump = project.bump,
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = buyer_token_account.mint == mint.key(),
        constraint = buyer_token_account.owner == buyer.key(),
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA marketing vault
    #[account(
        mut,
        seeds = [b"marketing_vault", project.key().as_ref()],
        bump = project.marketing_bump,
    )]
    pub marketing_vault: UncheckedAccount<'info>,

    /// CHECK: protocol treasury from config
    #[account(
        mut,
        constraint = protocol_treasury.key() == config.protocol_treasury @ RexError::Unauthorized,
    )]
    pub protocol_treasury: UncheckedAccount<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RexConfig>,

    /// CHECK: curve SOL vault
    #[account(
        mut,
        seeds = [b"curve_vault", project.key().as_ref()],
        bump = project.curve_bump,
    )]
    pub curve_vault: UncheckedAccount<'info>,

    /// CHECK: mint authority PDA
    #[account(
        seeds = [b"mint_auth", project.key().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"project", mint.key().as_ref()],
        bump = project.bump,
    )]
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

    /// CHECK: protocol treasury
    #[account(
        mut,
        constraint = protocol_treasury.key() == config.protocol_treasury @ RexError::Unauthorized,
    )]
    pub protocol_treasury: UncheckedAccount<'info>,

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

#[derive(Accounts)]
pub struct AddWhitelistProvider<'info> {
    #[account(
        constraint = authority.key() == config.authority @ RexError::Unauthorized
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
pub struct DisburseMarketing<'info> {
    #[account(
        constraint = authority.key() == config.authority @ RexError::Unauthorized
    )]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, RexConfig>,

    #[account(
        seeds = [b"project", project.mint.as_ref()],
        bump = project.bump,
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

    /// CHECK: whitelisted supplier wallet receives SOL
    #[account(mut)]
    pub supplier: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[event]
pub struct ProjectLaunched {
    pub project: Pubkey,
    pub founder: Pubkey,
    pub mint: Pubkey,
    pub trading_enabled: bool,
}

#[event]
pub struct TradeExecuted {
    pub project: Pubkey,
    pub trader: Pubkey,
    pub is_buy: bool,
    pub gross_lamports: u64,
    pub platform_fee_lamports: u64,
    pub marketing_fee_lamports: u64,
    pub tokens: u64,
}

#[event]
pub struct ProviderWhitelisted {
    pub provider: Pubkey,
}

#[event]
pub struct MarketingDisbursed {
    pub project: Pubkey,
    pub supplier: Pubkey,
    pub lamports: u64,
}
