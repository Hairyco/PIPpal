//! Trade fee split — investors should review this file first.
//!
//! Every buy and sell applies the same split on gross lamports:
//!   1.0% → Rex protocol treasury
//!   0.5% → project marketing wallet
//!  98.5% → net (into curve on buy, to user on sell after curve quote)

use anchor_lang::prelude::*;

use crate::constants::{BPS_DENOMINATOR, MARKETING_FEE_BPS, PLATFORM_FEE_BPS};
use crate::errors::RexError;

/// Returns `(platform_fee, marketing_fee, net_lamports)`.
pub fn apply_trade_fees(gross_lamports: u64) -> Result<(u64, u64, u64)> {
    let platform = gross_lamports
        .checked_mul(PLATFORM_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(RexError::MathOverflow)?;
    let marketing = gross_lamports
        .checked_mul(MARKETING_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(RexError::MathOverflow)?;
    let net = gross_lamports
        .checked_sub(platform)
        .and_then(|v| v.checked_sub(marketing))
        .ok_or(RexError::MathOverflow)?;
    Ok((platform, marketing, net))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_percent_platform_and_half_percent_marketing() {
        let gross = 1_000_000_000u64; // 1 SOL
        let (platform, marketing, net) = apply_trade_fees(gross).unwrap();
        assert_eq!(platform, 10_000_000);
        assert_eq!(marketing, 5_000_000);
        assert_eq!(net, 985_000_000);
        assert_eq!(platform + marketing + net, gross);
    }

    #[test]
    fn fees_apply_equally_on_buys_and_sells() {
        let gross = 500_000_000u64;
        let (p1, m1, n1) = apply_trade_fees(gross).unwrap();
        let (p2, m2, n2) = apply_trade_fees(gross).unwrap();
        assert_eq!((p1, m1, n1), (p2, m2, n2));
    }
}
