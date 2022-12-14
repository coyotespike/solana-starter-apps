use solana_program::{
    account_info::{ AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    program::{invoke_signed},
    borsh::try_from_slice_unchecked,
};
use std::convert::TryInto;
use notes::{NoteInstruction};
use state::NoteAccountState;
use borsh::BorshSerialize;
use crate::errors::NoteError;

// declare and export the program's entrypoint
entrypoint!(process_instruction);

// program entrypoint's implementation
// process_instructinon is called by the runtime - consists of three parameters
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let instruction = NoteInstruction::unpack(instruction_data)?;

    match instruction {
        NoteInstruction::CreateNote { title, body, .. } =>
            add_note(
                program_id,
                accounts,
                title,
                body,
            ),
        NoteInstruction::UpdateNote { title, body, ..} =>
            update_note(
                program_id,
                accounts,
                title,
                body,
            ),
        NoteInstruction::DeleteNote { title } =>
            delete_note(
                program_id,
                accounts,
                title,
            ),
    };

    // gracefully exit the program
    Ok(())
}

pub fn add_note(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    body: String,
) -> ProgramResult {

    msg!("Adding a note");
    msg!("Title: {}", title);
    msg!("Body: {}", body);

    // Get Account iterator
     let account_info_iter = &mut accounts.iter();

    // if the accounts are empty, we will get an error: "not enough account keys provided"
    // if we try to access an account that doesn't exist, we will get an error: "MissingRequiredSignature"

    // Get accounts
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !initializer.is_signer {
        msg!("Error: Initializer must sign transaction");
        return Err(NoteError::MissingRequiredSignature);
    }

    // remember the client does this too
    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);

    // check if the pda account is owned by the program
    if pda != *pda_account.key {
        msg!("Error: PDA account does not match");
        // what does the into() do? A: converts the error into a ProgramResult
        return Err(NoteError::InvalidPDA.into());
    }


    // Calculate account size
    let account_len : usize = 1 + 1 + (4 + title.len()) + (4 + body.len());

    // check length of account
    if account_len > 1000 {
        msg!("Error: Account size is too large");
        return Err(NoteError::InvalidDataLength.into());
    }

    // calculate rent
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    // we pass in the create_account instruction, then the accounts we're using, then the seeds
    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id,
        ),
        &[
            initializer.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[&[&initializer.key.as_ref(), title.as_bytes().as_ref(), &[bump_seed]]],
    )?;

    msg!("PDA created");


    // update the account data
    // this converts raw bytes into a Rust struct
    msg!("Unpacking account data");
    let mut account_data = try_from_slice_unchecked::<NoteAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("Borrowed account data");
    account_data.title = title;
    account_data.body = body;
    account_data.is_initialized = true;

    msg!("Packing account data");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("Serialized account data");

    Ok(())
}

pub fn update_note(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    body: String,
) -> ProgramResult {

    msg!("Updating a note");
    msg!("Title: {}", title);
    msg!("Body: {}", body);

    // gracefully exit the program
    // iterate through the accounts
    let account_info_iter = &mut accounts.iter();

    // get the accounts
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

    // check if pda_account.owner is the program_id
    if pda_account.owner != program_id {
        msg!("Error: PDA account does not match");
        return Err(NoteError::IllegalOwner);
    }

    // check if signer is the initializer
    if !initializer.is_signer {
        msg!("Error: Initializer must sign transaction");
        return Err(NoteError::MissingRequiredSignature);
    }

    // unpack the account data
    let mut account_data = try_from_slice_unchecked::<NoteAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("Borrowed account data");

    let (bump_seed, pda) = Pubkey::find_program_address(&[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),], program_id);

    // check if the pda account is owned by the program
    if pda != *pda_account.key {
        msg!("Error: PDA account does not match. check seeds.");
        return Err(NoteError::InvalidPDA.into());
    }

    // check if the account is initialized
    if !account_data.is_initialized {
        msg!("Error: Account is not initialized");
        return Err(NoteError::UninitializedAccount.into());
    }

    // check data length
    let account_len : usize = 1 + 1 + (4 + title.len()) + (4 + body.len());
    if account_len > 1000 {
        msg!("Error: Account size is too large");
        return Err(NoteError::InvalidDataLength.into());
    }


    // update the account data
    account_data.title = title;
    account_data.body = body;

    // serialize the account data
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;

    Ok(())
}

pub fn delete_note(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _title: String,
) -> ProgramResult {

    // gracefully exit the program
    Ok(())
}
