use solana_program::{
    pubkey::Pubkey,
    system_instruction,
    msg,
    account_info::{AccountInfo},
    program_error::ProgramError,
    sysvar::{rent::Rent, Sysvar},
    program::{invoke_signed},
};


pub fn create_pda<'a>(
    initializer: &'a AccountInfo,
    pda_account: &AccountInfo,
    system_program: &AccountInfo,
    program_id: &Pubkey,
    extraSeed: &String,
) -> Result<Pubkey, ProgramError> {


    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), extraSeed.as_bytes().as_ref(),], program_id);
    if pda != *pda_account.key {
        msg!("Invalid seeds for PDA");
        return Err(ProgramError::InvalidArgument)
    }

    let account_len: usize = 1000;
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id,
        ),
        &[initializer.clone(), pda_account.clone(), system_program.clone()],
        &[&[initializer.key.as_ref(), extraSeed.as_bytes().as_ref(), &[bump_seed]]],
    )?;

    // return the pda
    return Ok(pda);
}

