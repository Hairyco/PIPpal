//! Instruction handlers — business logic for each CTOgo action.

pub mod admin;
pub mod buy;
pub mod disburse;
pub mod initialize;
pub mod launch;
pub mod sell;
pub mod whitelist;
pub mod withdraw_creator;

pub use admin::{
    attach_marketing_wallet, set_keeper, set_protocol_paused, set_spend_paused,
    sweep_inactive_marketing,
};
pub use buy::handler as buy;
pub use disburse::handler as disburse_marketing;
pub use initialize::handler as initialize;
pub use launch::handler as launch_project;
pub use sell::handler as sell;
pub use whitelist::{add_handler as add_whitelist_provider, set_active_handler as set_whitelist_active};
pub use withdraw_creator::handler as withdraw_creator_fees;
