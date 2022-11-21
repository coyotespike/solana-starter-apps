use solana_program::{
    account_info::{ AccountInfo, next_account_info},
    entrypoint, entrypoint::ProgramResult,
    program_error::{ ProgramError },
    msg,
    system_instruction,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
    program::{invoke_signed},
    borsh::try_from_slice_unchecked,
};

use std::convert::TryInto;

pub mod intro_state;
pub mod intro_instruction;
use intro_instruction::IntroInstruction;
use borsh::BorshSerialize;
use intro_state::IntroAccountState;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = IntroInstruction::unpack(instruction_data)?;

    match instruction {
        IntroInstruction::CreateIntro { name, msg } =>
            add_intro(program_id, accounts, name, msg, true),
        IntroInstruction::UpdateIntro { name, msg } =>
            update_intro(program_id, accounts, name, msg),
        IntroInstruction::DeleteIntro { name } =>
            delete_intro(program_id, accounts, name),
    }.map_err(|err| {
        msg!("Error: {:?}", err);
        ProgramError::InvalidInstructionData
    })
}

pub fn add_intro(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    msg: String,
    is_initialized: bool,
) -> ProgramResult {
    msg!("Adding intro");

    // iterator
    let account_info_iter = &mut accounts.iter();
    // get accounts
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // find pda and bump seed
    // will create a separate account for each student
    // Why doesn't name.as_bytes() work?
    // let (_pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), name.as_bytes().as_ref()], program_id);

    let (_pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref()], program_id);

    // calculate account size
    let account_len = 1 + (4 + name.len()) + (4 + msg.len());

    // calculate rent
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
        &[
            initializer.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[&[&initializer.key.as_ref(), &[bump_seed]]],
    )?;

    msg!("Account created");

    // now we can write to the account
    let mut account_data = try_from_slice_unchecked::<IntroAccountState>(&pda_account.data.borrow()).unwrap();
    account_data.name = name;
    account_data.msg = msg;
    account_data.is_initialized = is_initialized;

    // serialize the data
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("Account written to");

    Ok(())
}
pub fn update_intro(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _name: String,
    _msg: String,
) -> ProgramResult {

    msg!("Updating a intro");

    // gracefully exit the program
    Ok(())
}

pub fn delete_intro(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    name: String,
) -> ProgramResult {

    msg!("Deleting a note: {}", name);

    // gracefully exit the program
    Ok(())
}
