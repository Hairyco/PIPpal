use anchor_lang::prelude::*;

#[error_code]
pub enum RexError {
    #[msg("Trading is disabled for this project (prelaunch)")]
    TradingDisabled,
    #[msg("Slippage exceeded — received less than minimum")]
    SlippageExceeded,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Provider is not on the Rex whitelist")]
    ProviderNotWhitelisted,
    #[msg("Curve vault has insufficient SOL for this sell")]
    InsufficientCurveLiquidity,
    #[msg("Marketing wallet has insufficient SOL")]
    InsufficientMarketingBalance,
    #[msg("Creator vault has insufficient SOL")]
    InsufficientCreatorBalance,
    #[msg("Invalid fee mode — use creator keep (0) or trader cashback (1)")]
    InvalidFeeMode,
    #[msg("Creator fee withdraw disabled — project uses trader cashback mode")]
    CreatorWithdrawDisabled,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unauthorized — Rex authority only")]
    Unauthorized,
}
