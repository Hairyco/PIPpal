//! Trade fee split — investors should review this file first.
//!
//! Every buy and sell applies the same split on gross lamports (Model A · 0.90%):
//!   0.35% → Rex protocol treasury
//!   0.15% → creator / V2 CTO vault (founder withdraws)
//!   0.40% → project marketing wallet
//!  99.10% → net (into curve on buy, to user on sell after curve quote)

use anchor_lang::prelude::*;

use crate::constants::{
    BPS_DENOMINATOR, CREATOR_FEE_BPS, MARKETING_FEE_BPS, PLATFORM_FEE_BPS,
};
use crate::errors::RexError;

/// Returns `(platform_fee, creator_fee, marketing_fee, net_lamports)`.
pub fn apply_trade_fees(gross_lamports: u64) -> Result<(u64, u64, u64, u64)> {
    let platform = gross_lamports
        .checked_mul(PLATFORM_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(RexError::MathOverflow)?;
    let creator = gross_lamports
        .checked_mul(CREATOR_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(RexError::MathOverflow)?;
    let marketing = gross_lamports
        .checked_mul(MARKETING_FEE_BPS)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or(RexError::MathOverflow)?;
    let net = gross_lamports
        .checked_sub(platform)
        .and_then(|v| v.checked_sub(creator))
        .and_then(|v| v.checked_sub(marketing))
        .ok_or(RexError::MathOverflow)?;
    Ok((platform, creator, marketing, net))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn model_a_zero_point_nine_percent_split() {
        let gross = 1_000_000_000u64; // 1 SOL
        let (platform, creator, marketing, net) = apply_trade_fees(gross).unwrap();
        assert_eq!(platform, 3_500_000); // 0.35%
        assert_eq!(creator, 1_500_000); // 0.15%
        assert_eq!(marketing, 4_000_000); // 0.40%
        assert_eq!(net, 991_000_000); // 99.10%
        assert_eq!(platform + creator + marketing + net, gross);
    }

    #[test]
    fn fees_apply_equally_on_buys_and_sells() {
        let gross = 500_000_000u64;
        let a = apply_trade_fees(gross).unwrap();
        let b = apply_trade_fees(gross).unwrap();
        assert_eq!(a, b);
    }
}
