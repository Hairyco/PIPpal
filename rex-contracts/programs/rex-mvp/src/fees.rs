//! CTOgo dual fee engines — List 1.25% / Launch 1.30% with raid cut.
//!
//! Launch: raid 0.50% · marketing 0.30% · creator 0.20% · platform 0.30% = 1.30%
//! List:   raid 0.50% · marketing 0.40% · creator 0.00% · platform 0.35% = 1.25%
//!
//! Unclaimed raid (no referrer) folds into the platform/treasury transfer.

use anchor_lang::prelude::*;

use crate::constants::{
    BPS_DENOMINATOR, ENGINE_LAUNCH, ENGINE_LIST, LAUNCH_CREATOR_BPS, LAUNCH_MARKETING_BPS,
    LAUNCH_PLATFORM_BPS, LAUNCH_RAID_BPS, LIST_CREATOR_BPS, LIST_MARKETING_BPS, LIST_PLATFORM_BPS,
    LIST_RAID_BPS,
};
use crate::errors::RexError;

/// Fee legs for one trade: `(raid, marketing, creator, platform, net)`.
/// When `has_referrer` is false, raid is added into `platform` (treasury) and raid returned as 0.
pub fn apply_trade_fees(
    gross_lamports: u64,
    engine: u8,
    has_referrer: bool,
) -> Result<(u64, u64, u64, u64, u64)> {
    let (raid_bps, marketing_bps, creator_bps, platform_bps) = match engine {
        ENGINE_LAUNCH => (
            LAUNCH_RAID_BPS,
            LAUNCH_MARKETING_BPS,
            LAUNCH_CREATOR_BPS,
            LAUNCH_PLATFORM_BPS,
        ),
        ENGINE_LIST => (
            LIST_RAID_BPS,
            LIST_MARKETING_BPS,
            LIST_CREATOR_BPS,
            LIST_PLATFORM_BPS,
        ),
        _ => return err!(RexError::InvalidEngine),
    };

    let raid = bps(gross_lamports, raid_bps)?;
    let marketing = bps(gross_lamports, marketing_bps)?;
    let creator = bps(gross_lamports, creator_bps)?;
    let mut platform = bps(gross_lamports, platform_bps)?;

    let raid_out = if has_referrer {
        raid
    } else {
        platform = platform
            .checked_add(raid)
            .ok_or(RexError::MathOverflow)?;
        0
    };

    let net = gross_lamports
        .checked_sub(raid_out)
        .and_then(|v| v.checked_sub(marketing))
        .and_then(|v| v.checked_sub(creator))
        .and_then(|v| v.checked_sub(platform))
        .ok_or(RexError::MathOverflow)?;

    Ok((raid_out, marketing, creator, platform, net))
}

/// Invoice + Polessia sliding service fee (bps) on top.
/// Returns `(service_fee, total_debit)`.
pub fn invoice_with_service_fee(invoice_lamports: u64, fee_bps: u64) -> Result<(u64, u64)> {
    require!(fee_bps <= BPS_DENOMINATOR, RexError::MathOverflow);
    let service_fee = bps(invoice_lamports, fee_bps)?;
    let total = invoice_lamports
        .checked_add(service_fee)
        .ok_or(RexError::MathOverflow)?;
    Ok((service_fee, total))
}

fn bps(amount: u64, bps: u64) -> Result<u64> {
    amount
        .checked_mul(bps)
        .and_then(|v| v.checked_div(BPS_DENOMINATOR))
        .ok_or_else(|| error!(RexError::MathOverflow))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::{LAUNCH_TRADE_FEE_BPS, LIST_TRADE_FEE_BPS};

    #[test]
    fn launch_one_point_three_with_referrer() {
        let gross = 1_000_000_000u64;
        let (raid, marketing, creator, platform, net) =
            apply_trade_fees(gross, ENGINE_LAUNCH, true).unwrap();
        assert_eq!(raid, 5_000_000);
        assert_eq!(marketing, 3_000_000);
        assert_eq!(creator, 2_000_000);
        assert_eq!(platform, 3_000_000);
        assert_eq!(net, 987_000_000);
        assert_eq!(raid + marketing + creator + platform, LAUNCH_TRADE_FEE_BPS * 100_000);
        assert_eq!(raid + marketing + creator + platform + net, gross);
    }

    #[test]
    fn list_one_point_two_five_with_referrer() {
        let gross = 1_000_000_000u64;
        let (raid, marketing, creator, platform, net) =
            apply_trade_fees(gross, ENGINE_LIST, true).unwrap();
        assert_eq!(raid, 5_000_000);
        assert_eq!(marketing, 4_000_000);
        assert_eq!(creator, 0);
        assert_eq!(platform, 3_500_000);
        assert_eq!(net, 987_500_000);
        assert_eq!(raid + marketing + creator + platform, LIST_TRADE_FEE_BPS * 100_000);
        assert_eq!(raid + marketing + creator + platform + net, gross);
    }

    #[test]
    fn unclaimed_raid_folds_into_platform() {
        let gross = 1_000_000_000u64;
        let (raid, marketing, creator, platform, net) =
            apply_trade_fees(gross, ENGINE_LIST, false).unwrap();
        assert_eq!(raid, 0);
        assert_eq!(marketing, 4_000_000);
        assert_eq!(creator, 0);
        assert_eq!(platform, 8_500_000); // 35 + 50
        assert_eq!(net, 987_500_000);
        assert_eq!(raid + marketing + creator + platform + net, gross);
    }

    #[test]
    #[test]
    fn service_fee_sliding_scale_bps() {
        let invoice = 100_000_000u64; // 0.1 SOL
        let (fee10, total10) = invoice_with_service_fee(invoice, 1_000).unwrap();
        assert_eq!(fee10, 10_000_000);
        assert_eq!(total10, 110_000_000);
        let (fee7, total7) = invoice_with_service_fee(invoice, 700).unwrap();
        assert_eq!(fee7, 7_000_000);
        assert_eq!(total7, 107_000_000);
        let (fee5, total5) = invoice_with_service_fee(invoice, 500).unwrap();
        assert_eq!(fee5, 5_000_000);
        assert_eq!(total5, 105_000_000);
    }
}
