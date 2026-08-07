use anchor_lang::prelude::*;

#[error_code]
pub enum RexError {
    #[msg("Trading is disabled for this project (prelaunch)")]
    TradingDisabled,
    #[msg("Slippage exceeded — received less than minimum")]
    SlippageExceeded,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Provider is not on the CTOgo whitelist or is inactive")]
    ProviderNotWhitelisted,
    #[msg("Curve vault has insufficient SOL for this sell")]
    InsufficientCurveLiquidity,
    #[msg("Marketing wallet has insufficient SOL for invoice + service fee")]
    InsufficientMarketingBalance,
    #[msg("Creator vault has insufficient SOL")]
    InsufficientCreatorBalance,
    #[msg("Invalid fee mode — use creator keep (0) or trader cashback (1)")]
    InvalidFeeMode,
    #[msg("Invalid engine — use Launch (0) or List (1)")]
    InvalidEngine,
    #[msg("Creator fee withdraw disabled — project uses trader cashback mode")]
    CreatorWithdrawDisabled,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Marketing spend is paused for this project")]
    SpendPaused,
    #[msg("Marketing wallet already attached")]
    MarketingAlreadyAttached,
    #[msg("This invoice was already disbursed")]
    AlreadyDisbursed,
    #[msg("Inactivity sweep not due yet (180 days)")]
    SweepNotDue,
    #[msg("Invalid marketing destination for this project")]
    InvalidMarketingDestination,
    #[msg("Invalid raid referrer account")]
    InvalidRaider,
}
