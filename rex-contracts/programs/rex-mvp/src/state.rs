use anchor_lang::prelude::*;

/// 1% — Rex protocol fee on buys and sells.
pub const PLATFORM_FEE_BPS: u64 = 100;
/// 5% — marketing wallet on buys and sells.
pub const MARKETING_FEE_BPS: u64 = 500;
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Virtual reserves for constant-product curve (pump.fun style).
pub const INITIAL_VIRTUAL_SOL: u64 = 30_000_000_000; // 30 SOL in lamports
pub const INITIAL_VIRTUAL_TOKENS: u64 = 1_073_000_000_000_000; // 1.073B with 6 decimals
pub const TOKEN_DECIMALS: u8 = 6;

#[account]
pub struct RexConfig {
    pub authority: Pubkey,
    pub protocol_treasury: Pubkey,
    pub bump: u8,
}

impl RexConfig {
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

#[account]
pub struct Project {
    pub founder: Pubkey,
    pub mint: Pubkey,
    pub launched_at: i64,
    pub trading_enabled: bool,
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub bump: u8,
    pub marketing_bump: u8,
    pub curve_bump: u8,
}

impl Project {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1 + 8 + 8 + 8 + 1 + 1 + 1;
}

#[account]
pub struct WhitelistedProvider {
    pub provider: Pubkey,
    pub active: bool,
    pub bump: u8,
}

impl WhitelistedProvider {
    pub const LEN: usize = 8 + 32 + 1 + 1;
}

pub fn apply_trade_fees(gross_lamports: u64) -> Result<(u64, u64, u64)> {
    let platform = gross_lamports
        .checked_mul(PLATFORM_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    let marketing = gross_lamports
        .checked_mul(MARKETING_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    let net = gross_lamports
        .checked_sub(platform)
        .and_then(|v| v.checked_sub(marketing))
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    Ok((platform, marketing, net))
}

/// tokens_out = v_tokens * sol_in / (v_sol + sol_in)
pub fn quote_buy_tokens(project: &Project, sol_in: u64) -> Result<u64> {
    if sol_in == 0 {
        return Ok(0);
    }
    let numerator = (project.virtual_token_reserves as u128)
        .checked_mul(sol_in as u128)
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    let denominator = (project.virtual_sol_reserves as u128)
        .checked_add(sol_in as u128)
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    let tokens = numerator
        .checked_div(denominator)
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    u64::try_from(tokens).map_err(|_| error!(crate::errors::RexError::MathOverflow))
}

/// sol_out = v_sol * token_in / (v_tokens + token_in)
pub fn quote_sell_sol(project: &Project, token_in: u64) -> Result<u64> {
    if token_in == 0 {
        return Ok(0);
    }
    let numerator = (project.virtual_sol_reserves as u128)
        .checked_mul(token_in as u128)
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    let denominator = (project.virtual_token_reserves as u128)
        .checked_add(token_in as u128)
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    let sol = numerator
        .checked_div(denominator)
        .ok_or(error!(crate::errors::RexError::MathOverflow))?;
    u64::try_from(sol).map_err(|_| error!(crate::errors::RexError::MathOverflow))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trade_fees_are_one_and_five_percent() {
        let gross = 1_000_000_000u64; // 1 SOL
        let (platform, marketing, net) = apply_trade_fees(gross).unwrap();
        assert_eq!(platform, 10_000_000); // 1%
        assert_eq!(marketing, 50_000_000); // 5%
        assert_eq!(net, 940_000_000); // 94%
        assert_eq!(platform + marketing + net, gross);
    }

    #[test]
    fn buy_quote_moves_reserves() {
        let project = Project {
            founder: Pubkey::default(),
            mint: Pubkey::default(),
            launched_at: 0,
            trading_enabled: true,
            virtual_sol_reserves: INITIAL_VIRTUAL_SOL,
            virtual_token_reserves: INITIAL_VIRTUAL_TOKENS,
            real_sol_reserves: 0,
            bump: 0,
            marketing_bump: 0,
            curve_bump: 0,
        };
        let (_, _, net) = apply_trade_fees(1_000_000_000).unwrap();
        let tokens = quote_buy_tokens(&project, net).unwrap();
        assert!(tokens > 0);
    }
}
