use anchor_lang::prelude::*;

/// Emitted when a founder launches a new project on CTOgo.
#[event]
pub struct ProjectLaunched {
    pub project: Pubkey,
    pub founder: Pubkey,
    pub mint: Pubkey,
    pub trading_enabled: bool,
    pub fee_mode: u8,
    pub engine: u8,
    pub marketing_attached: bool,
}

/// Emitted on every buy or sell — indexers use this to update marketing / creator / raid UI.
#[event]
pub struct TradeExecuted {
    pub project: Pubkey,
    pub trader: Pubkey,
    pub is_buy: bool,
    pub engine: u8,
    pub gross_lamports: u64,
    pub raid_fee_lamports: u64,
    pub platform_fee_lamports: u64,
    pub creator_fee_lamports: u64,
    pub marketing_fee_lamports: u64,
    pub marketing_to_vault: bool,
    pub raider: Pubkey,
    pub tokens: u64,
}

/// Emitted when CTOgo authority adds a supplier to the whitelist.
#[event]
pub struct ProviderWhitelisted {
    pub provider: Pubkey,
}

/// Emitted when whitelist active flag changes.
#[event]
pub struct ProviderWhitelistUpdated {
    pub provider: Pubkey,
    pub active: bool,
}

/// Emitted when List path attaches its marketing vault (destination switch).
#[event]
pub struct MarketingAttached {
    pub project: Pubkey,
    pub founder: Pubkey,
}

/// Emitted when marketing wallet SOL is paid (invoice + 20% on top).
#[event]
pub struct MarketingDisbursed {
    pub project: Pubkey,
    pub supplier: Pubkey,
    pub invoice_lamports: u64,
    pub service_fee_lamports: u64,
    pub total_debit_lamports: u64,
    pub actor: Pubkey,
    pub invoice_id: [u8; 32],
}

/// Emitted when the founder withdraws SOL from the creator fee vault.
#[event]
pub struct CreatorFeesWithdrawn {
    pub project: Pubkey,
    pub founder: Pubkey,
    pub lamports: u64,
}

/// Emitted when protocol-wide pause changes.
#[event]
pub struct ProtocolPaused {
    pub paused: bool,
    pub authority: Pubkey,
}

/// Emitted when per-project spend pause changes.
#[event]
pub struct SpendPaused {
    pub project: Pubkey,
    pub spend_paused: bool,
    pub actor: Pubkey,
}

/// Emitted when inactive marketing vault SOL is swept to treasury.
#[event]
pub struct MarketingSwept {
    pub project: Pubkey,
    pub lamports: u64,
    pub actor: Pubkey,
}

/// Emitted when keeper key is rotated.
#[event]
pub struct KeeperUpdated {
    pub keeper: Pubkey,
    pub authority: Pubkey,
}
