//! Fee and curve constants — CTOgo dual-engine + marketing wallet.

/// Basis points denominator (100% = 10_000).
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Raid / referrer cut on CTOgo-routed trades (0.50%).
pub const RAID_FEE_BPS: u64 = 50;

/// Default / whale-tier Polessia service fee — 5% **on top** of supplier invoice.
/// Sliding scale is applied off-chain and passed as `service_fee_bps` to disburse:
/// under $250 → 1000, $250–$1k → 700, $1k+ → 500.
pub const CTOGO_SERVICE_FEE_BPS: u64 = 500;

/// Engine id locked at project create: Launch path.
pub const ENGINE_LAUNCH: u8 = 0;
/// Engine id locked at project create: List (external / CTO) path.
pub const ENGINE_LIST: u8 = 1;

// --- Launch 1.30%: raid 50 + marketing 30 + creator 20 + platform 30 ---
pub const LAUNCH_RAID_BPS: u64 = RAID_FEE_BPS;
pub const LAUNCH_MARKETING_BPS: u64 = 30;
pub const LAUNCH_CREATOR_BPS: u64 = 20;
pub const LAUNCH_PLATFORM_BPS: u64 = 30;
pub const LAUNCH_TRADE_FEE_BPS: u64 =
    LAUNCH_RAID_BPS + LAUNCH_MARKETING_BPS + LAUNCH_CREATOR_BPS + LAUNCH_PLATFORM_BPS;

// --- List 1.25%: raid 50 + marketing 40 + creator 0 + platform 35 ---
pub const LIST_RAID_BPS: u64 = RAID_FEE_BPS;
pub const LIST_MARKETING_BPS: u64 = 40;
pub const LIST_CREATOR_BPS: u64 = 0;
pub const LIST_PLATFORM_BPS: u64 = 35;
pub const LIST_TRADE_FEE_BPS: u64 =
    LIST_RAID_BPS + LIST_MARKETING_BPS + LIST_CREATOR_BPS + LIST_PLATFORM_BPS;

/// @deprecated Prefer engine-specific constants. Legacy alias = List platform.
pub const PLATFORM_FEE_BPS: u64 = LIST_PLATFORM_BPS;
/// @deprecated Prefer LAUNCH_CREATOR_BPS.
pub const CREATOR_FEE_BPS: u64 = LAUNCH_CREATOR_BPS;
/// @deprecated Prefer LIST_MARKETING_BPS.
pub const MARKETING_FEE_BPS: u64 = LIST_MARKETING_BPS;
/// @deprecated Prefer LIST_TRADE_FEE_BPS / LAUNCH_TRADE_FEE_BPS.
pub const TRADE_FEE_BPS: u64 = LIST_TRADE_FEE_BPS;

/// Mode A — creator keeps the pool cut.
pub const FEE_MODE_CREATOR: u8 = 0;
/// Mode B — pool cut is trader cashback (founder withdraw disabled).
pub const FEE_MODE_TRADER_CASHBACK: u8 = 1;

/// USD equivalent threshold for automatic marketing spend (ads / trending).
pub const MARKETING_AUTO_SPEND_USD: u64 = 500;

/// Days of no CTOgo marketing activity before inactive vault SOL may be swept to treasury.
pub const MARKETING_INACTIVITY_DAYS: u64 = 180;
pub const MARKETING_INACTIVITY_SECS: i64 = (MARKETING_INACTIVITY_DAYS * 24 * 60 * 60) as i64;

/// Warning windows (off-chain + optional on-chain checks).
pub const MARKETING_SWEEP_WARN_DAYS_30: u64 = 30;
pub const MARKETING_SWEEP_WARN_DAYS_7: u64 = 7;

/// Legacy Rex V1 constants — retained for docs/compat; CTOgo uses 180-day sweep.
pub const MARKETING_INACTIVITY_HOURS: u64 = 72;
pub const MARKETING_V2_DEADLINE_DAYS: u64 = 30;

pub const POST_MIGRATION_FEES_REQUIRED: bool = true;
pub const RAYDIUM_CREATE_POOL_FEE_LAMPORTS: u64 = 150_000_000;
pub const RAYDIUM_MIGRATE_RENT_BUFFER_LAMPORTS: u64 = 50_000_000;
pub const MIGRATION_FEE_LAMPORTS: u64 =
    RAYDIUM_CREATE_POOL_FEE_LAMPORTS + RAYDIUM_MIGRATE_RENT_BUFFER_LAMPORTS;
pub const MIGRATION_FEE_LAMPORTS_CAP: u64 = 250_000_000;
pub const REX_MIGRATION_PROTOCOL_FEE_LAMPORTS: u64 = 2_000_000_000;
pub const TOTAL_MIGRATION_COST_LAMPORTS: u64 =
    REX_MIGRATION_PROTOCOL_FEE_LAMPORTS + MIGRATION_FEE_LAMPORTS;
pub const GRADUATION_SEED_POOL_REQUIRED: bool = true;
pub const GRADUATION_BURN_LP_REQUIRED: bool = true;

pub const CREATOR_MIN_HOLD_BPS: u64 = 1_000;
pub const CREATOR_FEE_REDIRECT_MARKETING: u8 = 0;
pub const CREATOR_FEE_REDIRECT_TRADERS: u8 = 1;

pub const TOKEN_DECIMALS: u8 = 6;
pub const INITIAL_VIRTUAL_SOL: u64 = 30_000_000_000;
pub const INITIAL_VIRTUAL_TOKENS: u64 = 1_073_000_000_000_000;
