use solana_program::{
    account_info::{ AccountInfo, next_account_info},
    entrypoint, entrypoint::ProgramResult,
    program_error::ProgramError,
    msg,
    system_instruction,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
    program::{invoke_signed},
    borsh::try_from_slice_unchecked,
};

use std::convert::TryInto;
use borsh::BorshSerialize;

use crate::intro_error::IntroError;
use crate::intro_instruction::IntroInstruction;
use crate::intro_state::{ IntroAccountState, ReplyCounterState, ReplyAccountState };

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
        IntroInstruction::DeleteIntro { name, msg } =>
            delete_intro(program_id, accounts, name, msg),
        IntroInstruction::AddReply { name, msg } =>
            add_reply(program_id, accounts, name, msg),
    }
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

    let passed_in_counter_pda = next_account_info(account_info_iter)?;

    // check if initializer is signer
    // if you don't use .int() you get a compiler error
    // that is what turns the IntroError into a ProgramError
    if !initializer.is_signer {
        return Err(IntroError::MissingRequiredSignature.into());
    }

    // find pda and bump seed
    // will create a separate account for each student
    // Why doesn't name.as_bytes() work?
    // let (_pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), name.as_bytes().as_ref()], program_id);

    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref()], program_id);

    // check if the pda account is owned by the program
    if pda != *pda_account.key {
        return Err(IntroError::InvalidPDA.into());
    }

    // Now we do the same thing for the reply counter
    // its state will be used later

    // find pda and bump seed
    // TODO make client derive this the same way
    let (counter_pda, counter_bump) = Pubkey::find_program_address(&[pda_account.key.as_ref(), "reply".as_ref()], program_id);

    // validate the counter account
    if counter_pda != *passed_in_counter_pda.key {
        return Err(IntroError::InvalidPDA.into());
    }

    // notice we do the above before creating the account

    // calculate account size
    let account_len = IntroAccountState::get_account_size(name.clone(), msg.clone());

        // check length of account
        if account_len > 1000 {
            return Err(IntroError::InvalidDataLength.into());
        }


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

    // after creating the intro account and writing to it, we can create the reply counter account
    msg!("Creating reply counter");
    // 1. Calculate rent
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(ReplyCounterState::SIZE);

    // 2. We have already validated the seeds
    // 3. Create the account
    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            passed_in_counter_pda.key,
            rent_lamports,
            ReplyCounterState::SIZE.try_into().unwrap(),
            program_id,
        ),
        &[
            initializer.clone(),
            passed_in_counter_pda.clone(),
            system_program.clone(),
        ],
        &[&[pda.as_ref(), "reply".as_ref(), &[counter_bump]]],
    )?;

    msg!("Reply counter created");

    // 4. Deserialize the account
    // I guess the create_account instruction is idempotent
    let mut counter_data = try_from_slice_unchecked::<ReplyCounterState>(&passed_in_counter_pda.data.borrow()).unwrap();

    // 5. error checking: make sure the account is not already initialized
    if counter_data.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // 6. Write to the account
    counter_data.discriminator = ReplyCounterState::DISCRIMINATOR.to_string();
    counter_data.count = 0;
    counter_data.is_initialized = true;
    msg!("Reply counter written to: {}", counter_data.count);

    // 7. Serialize the account
    counter_data.serialize(&mut &mut passed_in_counter_pda.data.borrow_mut()[..])?;

    Ok(())
}
pub fn update_intro(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    msg: String,
) -> ProgramResult {

    msg!("Updating a note");
    msg!("Title: {}", name);
    msg!("Body: {}", msg);

    // iterate through the accounts
    let account_info_iter = &mut accounts.iter();

    // get the accounts
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

    // unpack the account data
    let mut account_data = try_from_slice_unchecked::<IntroAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("Borrowed account data");

    // check if the account is initialized
    if !account_data.is_initialized {
        return Err(IntroError::UninitializedAccount.into());
    }

    // check if the account is owned by the program
    if *pda_account.owner != *program_id {
        return Err(IntroError::IllegalOwner.into());
    }

    let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref()], program_id);

    // check if the right pda is being used
    if pda != *pda_account.key {
        return Err(IntroError::InvalidPDA.into());
    }

    // get the length of the account
    let account_len = 1 + (4 + name.len()) + (4 + msg.len());
    // check length of account
    if account_len > 1000 {
        return Err(IntroError::InvalidDataLength.into());
    }

    // update the account data
    account_data.name = name;
    account_data.msg = msg;

    // serialize the account data
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;

    // gracefully exit the program
    Ok(())
}

pub fn delete_intro(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    name: String,
    msg: String,
) -> ProgramResult {

    msg!("Deleting a note: {}, {}", name, msg);

    // gracefully exit the program
    Ok(())
}

pub fn add_reply(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    msg: String,
) -> ProgramResult {

    msg!("Adding a reply to a note: {}", name);
    msg!("Reply: {}", msg);

    // get iterator for the accounts
    let account_info_iter = &mut accounts.iter();

    // get the accounts by iterating
    let reply_guy = next_account_info(account_info_iter)?;
    let intro_pda = next_account_info(account_info_iter)?;
    let reply_counter_pda = next_account_info(account_info_iter)?;
    let passed_in_reply_pda = next_account_info(account_info_iter)?; // yes we pass in our own account, to force checking on the client side as well
    let system_program = next_account_info(account_info_iter)?;

    // fetch the counter account so we can then validate the reply account PDA
    let mut counter_data = try_from_slice_unchecked::<ReplyCounterState>(&reply_counter_pda.data.borrow()).unwrap();
    let first_seed = intro_pda.key.as_ref();
    let second_seed = counter_data.count.to_be_bytes();
    let (pda, bump_seed) = Pubkey::find_program_address(&[first_seed, second_seed.as_ref(),], program_id);

    // check if the passed in reply account is the same as the one we calculated
    if pda != *passed_in_reply_pda.key {
        return Err(IntroError::InvalidPDA.into());
    }

    // next we want to create the account so let's figure out the rent owed
    let account_len = ReplyAccountState::get_account_size(msg.clone());
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    // create the account
    invoke_signed(
        &system_instruction::create_account(
            reply_guy.key,
            passed_in_reply_pda.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id,
        ),
        &[
            reply_guy.clone(),
            passed_in_reply_pda.clone(),
            system_program.clone(),
        ],
        &[&[first_seed, second_seed.as_ref(), &[bump_seed]]],
    )?;

    msg!("Reply account created");

    // okay now we double check the account is not already initialized
    let mut reply_data = try_from_slice_unchecked::<ReplyAccountState>(&passed_in_reply_pda.data.borrow()).unwrap();
    if reply_data.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // with that out of the way, we can now write to the account
    reply_data.discriminator = ReplyAccountState::DISCRIMINATOR.to_string();
    reply_data.name = name;
    reply_data.msg = msg;
    reply_data.is_initialized = true;
    // serialize the account
    reply_data.serialize(&mut &mut passed_in_reply_pda.data.borrow_mut()[..])?;

    // increment the counter
    msg!("Reply counter incremented: {}", counter_data.count);
    counter_data.count += 1;
    // serialize the counter
    counter_data.serialize(&mut &mut reply_counter_pda.data.borrow_mut()[..])?;
    // gracefully exit the program
    Ok(())
}
