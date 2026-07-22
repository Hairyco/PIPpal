use anchor_lang::prelude::*;

/// Emitted when a founder launches a new project on Rex.
#[event]
pub struct ProjectLaunched {
    pub project: Pubkey,
    pub founder: Pubkey,
    pub mint: Pubkey,
    pub trading_enabled: bool,
    pub fee_mode: u8,
}

/// Emitted on every buy or sell — indexers use this to update marketing / creator UI.
#[event]
pub struct TradeExecuted {
    pub project: Pubkey,
    pub trader: Pubkey,
    pub is_buy: bool,
    pub gross_lamports: u64,
    pub platform_fee_lamports: u64,
    pub creator_fee_lamports: u64,
    pub marketing_fee_lamports: u64,
    pub tokens: u64,
}

/// Emitted when Rex authority adds a supplier to the whitelist.
#[event]
pub struct ProviderWhitelisted {
    pub provider: Pubkey,
}

/// Emitted when marketing wallet SOL is paid to a whitelisted supplier.
#[event]
pub struct MarketingDisbursed {
    pub project: Pubkey,
    pub supplier: Pubkey,
    pub lamports: u64,
}

/// Emitted when the founder withdraws SOL from the creator fee vault.
#[event]
pub struct CreatorFeesWithdrawn {
    pub project: Pubkey,
    pub founder: Pubkey,
    pub lamports: u64,
}
