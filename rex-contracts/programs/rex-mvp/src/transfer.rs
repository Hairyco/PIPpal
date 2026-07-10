//! Small helpers for moving native SOL between accounts.

use anchor_lang::prelude::*;
use anchor_lang::system_program;

pub fn transfer_lamports<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            system_program.clone(),
            system_program::Transfer {
                from: from.clone(),
                to: to.clone(),
            },
        ),
        amount,
    )
}

pub fn transfer_lamports_signed<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    signer_seeds: &[&[&[u8]]],
    amount: u64,
) -> Result<()> {
    system_program::transfer(
        CpiContext::new_with_signer(
            system_program.clone(),
            system_program::Transfer {
                from: from.clone(),
                to: to.clone(),
            },
            signer_seeds,
        ),
        amount,
    )
}
