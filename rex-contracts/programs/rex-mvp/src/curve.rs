//! Bonding curve pricing — constant-product formula (virtual reserves).
//!
//! Buy:  tokens_out = virtual_tokens × sol_in / (virtual_sol + sol_in)
//! Sell: sol_out    = virtual_sol × token_in / (virtual_tokens + token_in)

use anchor_lang::prelude::*;

use crate::errors::RexError;
use crate::state::Project;

/// Quote tokens received for a given SOL input (after fees, before state update).
pub fn quote_buy_tokens(project: &Project, sol_in: u64) -> Result<u64> {
    if sol_in == 0 {
        return Ok(0);
    }
    let numerator = (project.virtual_token_reserves as u128)
        .checked_mul(sol_in as u128)
        .ok_or(RexError::MathOverflow)?;
    let denominator = (project.virtual_sol_reserves as u128)
        .checked_add(sol_in as u128)
        .ok_or(RexError::MathOverflow)?;
    let tokens = numerator
        .checked_div(denominator)
        .ok_or(RexError::MathOverflow)?;
    u64::try_from(tokens).map_err(|_| error!(RexError::MathOverflow))
}

/// Quote gross SOL output for a token sell (before fees).
pub fn quote_sell_sol(project: &Project, token_in: u64) -> Result<u64> {
    if token_in == 0 {
        return Ok(0);
    }
    let numerator = (project.virtual_sol_reserves as u128)
        .checked_mul(token_in as u128)
        .ok_or(RexError::MathOverflow)?;
    let denominator = (project.virtual_token_reserves as u128)
        .checked_add(token_in as u128)
        .ok_or(RexError::MathOverflow)?;
    let sol = numerator
        .checked_div(denominator)
        .ok_or(RexError::MathOverflow)?;
    u64::try_from(sol).map_err(|_| error!(RexError::MathOverflow))
}

/// Update virtual + real reserves after a buy.
pub fn apply_buy_to_reserves(project: &mut Project, sol_in: u64, tokens_out: u64) -> Result<()> {
    project.virtual_sol_reserves = project
        .virtual_sol_reserves
        .checked_add(sol_in)
        .ok_or(RexError::MathOverflow)?;
    project.virtual_token_reserves = project
        .virtual_token_reserves
        .checked_sub(tokens_out)
        .ok_or(RexError::MathOverflow)?;
    project.real_sol_reserves = project
        .real_sol_reserves
        .checked_add(sol_in)
        .ok_or(RexError::MathOverflow)?;
    Ok(())
}

/// Update virtual + real reserves after a sell.
pub fn apply_sell_to_reserves(project: &mut Project, gross_sol: u64, token_in: u64) -> Result<()> {
    project.virtual_sol_reserves = project
        .virtual_sol_reserves
        .checked_sub(gross_sol)
        .ok_or(RexError::MathOverflow)?;
    project.virtual_token_reserves = project
        .virtual_token_reserves
        .checked_add(token_in)
        .ok_or(RexError::MathOverflow)?;
    project.real_sol_reserves = project
        .real_sol_reserves
        .checked_sub(gross_sol)
        .ok_or(RexError::MathOverflow)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::{INITIAL_VIRTUAL_SOL, INITIAL_VIRTUAL_TOKENS};
    use anchor_lang::prelude::Pubkey;

    fn sample_project() -> Project {
        Project {
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
        }
    }

    #[test]
    fn buy_returns_positive_tokens() {
        let project = sample_project();
        let tokens = quote_buy_tokens(&project, 940_000_000).unwrap();
        assert!(tokens > 0);
    }

    #[test]
    fn sell_returns_positive_sol() {
        let project = sample_project();
        let sol = quote_sell_sol(&project, 1_000_000_000).unwrap();
        assert!(sol > 0);
    }
}
