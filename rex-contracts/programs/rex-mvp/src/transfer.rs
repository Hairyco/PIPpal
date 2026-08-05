//! Small helpers for moving native SOL between accounts.

use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::errors::RexError;

pub fn transfer_lamports<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
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

/// Move lamports from a program-owned PDA vault (not System-owned).
pub fn transfer_lamports_from_owned_pda<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
    let from_bal = from.lamports();
    require!(from_bal >= amount, RexError::InsufficientCurveLiquidity);
    **from.try_borrow_mut_lamports()? = from_bal
        .checked_sub(amount)
        .ok_or(RexError::MathOverflow)?;
    **to.try_borrow_mut_lamports()? = to
        .lamports()
        .checked_add(amount)
        .ok_or(RexError::MathOverflow)?;
    Ok(())
}

pub fn transfer_lamports_signed<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    signer_seeds: &[&[&[u8]]],
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
    // Prefer direct debit for program-owned PDAs; fall back to system CPI for system accounts.
    if *from.owner != system_program::ID {
        return transfer_lamports_from_owned_pda(from, to, amount);
    }
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
