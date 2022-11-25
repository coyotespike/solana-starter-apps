use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    system_instruction,
    program_error::ProgramError,
    program::{invoke_signed},
    borsh::try_from_slice_unchecked,
    program_pack::{IsInitialized},
    sysvar::{rent::Rent, Sysvar, rent::ID as RENT_PROGRAM_ID},
    native_token::LAMPORTS_PER_SOL,
    system_program::ID as SYSTEM_PROGRAM_ID,
};

use spl_associated_token_account::get_associated_token_address;
use spl_token::{instruction::{ initialize_mint, mint_to }, ID as TOKEN_PROGRAM_ID};

use std::convert::TryInto;
use crate::instruction::MovieInstruction;
use crate::state::{ MovieAccountState, MovieComment, MovieCommentCounter };
use borsh::BorshSerialize;
use crate::error::ReviewError;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
  ) -> ProgramResult {
    let instruction = MovieInstruction::unpack(instruction_data)?;
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
          add_movie_review(program_id, accounts, title, rating, description)
      },
        MovieInstruction::UpdateMovieReview { title, rating, description } => {
          update_movie_review(program_id, accounts, title, rating, description)
      },
        MovieInstruction::AddComment { comment } => {
            add_comment(program_id, accounts, comment)
        },
        MovieInstruction::InitializeMint  => {
            initialize_token_mint(program_id, accounts)
        },
    }
}

// Initiates two accounts, one for the movie review and one for the comment counter
// afaict it does not track the comments yet
// now we will add a token mint for anyone who leaves a review
pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Adding movie review...");
    msg!("Title: {}", title);
    msg!("Rating: {}", rating);
    msg!("Description: {}", description);

    let account_info_iter = &mut accounts.iter();

    let initializer  = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    // this means the client must send this information as well
    let pda_counter = next_account_info(account_info_iter)?;

    let token_mint = next_account_info(account_info_iter)?;
    let mint_auth = next_account_info(account_info_iter)?;
    let user_ata = next_account_info(account_info_iter)?; // user's associated token account
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature)
    }

    if rating > 5 || rating < 1 {
        msg!("Rating cannot be higher than 5");
        return Err(ReviewError::InvalidRating.into())
    }

    let total_len: usize = 1000;
    if MovieAccountState::get_account_size(title.clone(), description.clone()) > total_len {
        msg!("Data length is larger than 1000 bytes");
        return Err(ReviewError::InvalidDataLength.into())
    }

    // validation for the pda account
    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);
    if pda != *pda_account.key {
        msg!("Invalid seeds for PDA");
        return Err(ProgramError::InvalidArgument)
    }

    // validation for the pda counter account
    // Deriving the address and validating that the correct seeds were passed in
    let (counter_pda, _counter_bump_seed) =
        Pubkey::find_program_address(&[pda.as_ref(), "comment".as_ref()], program_id);
    if counter_pda != *pda_counter.key {
        msg!("Invalid seeds for PDA");
        return Err(ProgramError::InvalidArgument);
}
    // four new accounts passed in, four new validations to perform
    // 1. validate that the token mint account is owned by the token program
    // 2. validate that the mint authority is the PDA
    // 3. validate that the user's associated token account is owned by the token program
    if token_program.key != &TOKEN_PROGRAM_ID {
        msg!("Token mint account is not owned by the token program");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }
    if *user_ata.key != get_associated_token_address(initializer.key, token_mint.key) {
        msg!("User's associated token account is not owned by the token program");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }
    let (mint_pda, _mint_bump_seed) =
        Pubkey::find_program_address(&[b"token_mint",], program_id);
    if *token_mint.key != mint_pda {
        msg!("Mint authority is not the PDA");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }
    let (mint_auth_pda, mint_auth_bump) = Pubkey::find_program_address(&[b"token_auth",], program_id);
    if *mint_auth.key != mint_auth_pda {
        msg!("Mint authority is not owned by the token program");
        return Err(ReviewError::IncorrectAccountInfo.into())
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
        &[&[initializer.key.as_ref(), title.as_bytes().as_ref(), &[bump_seed]]],
    )?;


    msg!("PDA created: {}", pda);

    msg!("unpacking state account");
    let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("borrowed account data");

    msg!("checking if movie account is already initialized");
    if account_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }


    account_data.discriminator = MovieAccountState::DISCRIMINATOR.to_string();
    account_data.title = title;
    account_data.rating = rating;
    account_data.description = description;
    account_data.is_initialized = true;

    msg!("serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    msg!("Creating comment counter");
    // 1. calculate rent
    let rent = Rent::get()?;
    let counter_rent_lamports = rent.minimum_balance(MovieCommentCounter::SIZE);

    // 2. validating that the correct seeds were passed in
    let (counter, counter_bump) =
        Pubkey::find_program_address(&[pda.as_ref(), "comment".as_ref()], program_id);
    if counter != *pda_counter.key {
        msg!("Invalid seeds for PDA");
        return Err(ProgramError::InvalidArgument);
    }

    // 3. Creating the comment counter account, CPI
    invoke_signed(
        &system_instruction::create_account(
            initializer.key, // Rent payer
            pda_counter.key, // Address who we're creating the account for
            counter_rent_lamports, // Amount of rent to put into the account
            MovieCommentCounter::SIZE.try_into().unwrap(), // Size of the account
            program_id,
        ),
        &[
            // List of accounts that will be read from/written to
            initializer.clone(),
            pda_counter.clone(),
            system_program.clone(),
        ],
        // Seeds for the PDA
        // PDA account
        // The string "comment"
        &[&[pda.as_ref(), "comment".as_ref(), &[counter_bump]]],
    )?;
    msg!("Comment counter created");

    // 4. Deserialize the newly created counter account
    let mut counter_data =
        try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

    msg!("checking if counter account is already initialized");
    // 5. error check: make sure the counter account is not already initialized
    if counter_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // 6. Initialize the counter account and set is_initialized to true
    counter_data.discriminator = MovieCommentCounter::DISCRIMINATOR.to_string();
    counter_data.counter = 0;
    counter_data.is_initialized = true;
    msg!("comment count: {}", counter_data.counter);
    // 7. Serialize the counter account
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    msg!("Comment counter initialized");

    // now let's mint some tokens to the user's associated token account
    msg!("minting 10 tokens to user");
    invoke_signed(
        &mint_to(
            token_program.key,
            token_mint.key,
            user_ata.key,
            mint_auth.key,
            &[],
            10 * LAMPORTS_PER_SOL,
        )?,
        &[
            token_mint.clone(),
            user_ata.clone(),
            mint_auth.clone(),
        ],
        &[&[b"token_auth", &[mint_auth_bump]]],
    )?;

    Ok(())
}

pub fn update_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Updating movie review...");

    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

    if pda_account.owner != program_id {
      return Err(ProgramError::IllegalOwner)
    }

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature)
    }

    msg!("unpacking state account");
    let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("review title: {}", account_data.title);

    let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),], program_id);
    if pda != *pda_account.key {
        msg!("Invalid seeds for PDA");
        return Err(ReviewError::InvalidPDA.into())
    }

    msg!("checking if movie account is initialized");
    if !account_data.is_initialized() {
        msg!("Account is not initialized");
        return Err(ReviewError::UninitializedAccount.into());
    }

    if rating > 5 || rating < 1 {
        msg!("Invalid Rating");
        return Err(ReviewError::InvalidRating.into())
    }

    let update_len: usize = 1 + 1 + (4 + description.len()) + account_data.title.len();
    if update_len > 1000 {
        msg!("Data length is larger than 1000 bytes");
        return Err(ReviewError::InvalidDataLength.into())
    }

    msg!("Review before update:");
    msg!("Title: {}", account_data.title);
    msg!("Rating: {}", account_data.rating);
    msg!("Description: {}", account_data.description);

    account_data.rating = rating;
    account_data.description = description;

    msg!("Review after update:");
    msg!("Title: {}", account_data.title);
    msg!("Rating: {}", account_data.rating);
    msg!("Description: {}", account_data.description);

    msg!("serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}

pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String
) -> ProgramResult {
    msg!("Adding comment...");
    msg!("comment: {}", comment);
    // 1. As usual, we need to unpack the accounts and iterate through them
    // dang there are a lot of accounts
    let account_info_iter = &mut accounts.iter();
    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;

    let token_mint = next_account_info(account_info_iter)?;
    let mint_auth = next_account_info(account_info_iter)?;
    let user_ata = next_account_info(account_info_iter)?; // user's associated token account
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    let mut counter_data =
        try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

    // goddammit that was not well explained
    // each comment account has a unique address because we use the actual numeric count as a seed.
    let (pda, bump_seed) = Pubkey::find_program_address(&[pda_review.key.as_ref(), counter_data.counter.to_be_bytes().as_ref(),], program_id);
    if pda != *pda_comment.key {
        msg!("Invalid seeds for PDA");
        return Err(ReviewError::InvalidPDA.into())
    }

    if token_program.key != &TOKEN_PROGRAM_ID {
        msg!("Token mint account is not owned by the token program");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }
    if *user_ata.key != get_associated_token_address(commenter.key, token_mint.key) {
        msg!("User's associated token account is not owned by the token program");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }
    let (mint_pda, _mint_bump_seed) =
        Pubkey::find_program_address(&[b"token_mint",], program_id);
    if *token_mint.key != mint_pda {
        msg!("Mint authority is not the PDA");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }
    let (mint_auth_pda, mint_auth_bump) = Pubkey::find_program_address(&[b"token_auth",], program_id);
    if *mint_auth.key != mint_auth_pda {
        msg!("Mint authority is not owned by the token program");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }


    let account_len = MovieComment::get_account_size(comment.clone());

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);


    invoke_signed(
        &system_instruction::create_account(
            commenter.key, // Rent payer
            pda_comment.key, // Address who we're creating the account for
            rent_lamports, // Amount of rent to put into the account
            account_len.try_into().unwrap(), // Size of the account
            program_id,
        ),
        &[
            // List of accounts that will be read from/written to
            commenter.clone(),
            pda_comment.clone(),
            system_program.clone(),
        ],
        // Seeds for the PDA
        &[&[pda_review.key.as_ref(), counter_data.counter.to_be_bytes().as_ref(), &[bump_seed]]],
    )?;
    msg!("Created Comment Account");

    let mut comment_data = try_from_slice_unchecked::<MovieComment>(&pda_comment.data.borrow()).unwrap();

    msg!("checking if comment account is already initialized");
    if comment_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    comment_data.discriminator = MovieComment::DISCRIMINATOR.to_string();
    comment_data.review = *pda_review.key;
    comment_data.commenter = *commenter.key;
    comment_data.comment = comment;
    comment_data.is_initialized = true;
    comment_data.serialize(&mut &mut pda_comment.data.borrow_mut()[..])?;

    // and here we increment the counter
    // in its own account
    msg!("Comment Count: {}", counter_data.counter);
    counter_data.counter += 1;
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    msg!("minting 5 tokens to user");
    invoke_signed(
        &mint_to(
            token_program.key,
            token_mint.key,
            user_ata.key,
            mint_auth.key,
            &[],
            5 * LAMPORTS_PER_SOL,
        )?,
        &[
            token_mint.clone(),
            user_ata.clone(),
            mint_auth.clone(),
        ],
        &[&[b"token_auth", &[mint_auth_bump]]],
    )?;


    Ok(())
}


// 1. Pull out the accounts and iterate through them
// 2. Check that the correct accounts are being passed in
// 3. Create the mint account
// 4. Initialize the mint account
pub fn initialize_token_mint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    // whoever sent in transaction
    let initializer = next_account_info(account_info_iter)?;
    // derived on client
    let token_mint = next_account_info(account_info_iter)?;
    // why me?
    let mint_auth = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    // Solana token program address
    let token_program = next_account_info(account_info_iter)?;
    // we won't calculate the rent ourselves this time
    let sysvar_rent = next_account_info(account_info_iter)?;

    // validate mint pda
    let (mint_pda, mint_bump) = Pubkey::find_program_address(&[b"token_mint",], program_id);
    if mint_pda != *token_mint.key {
        msg!("Invalid token mint PDA");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }

    // validate mint auth pda
    let (mint_auth_pda, _mint_auth_bump) = Pubkey::find_program_address(&[b"token_auth",], program_id);
    if mint_auth_pda != *mint_auth.key {
        msg!("Invalid token mint auth PDA");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }
    // and check the other keys against already-existing variables
    if *token_program.key != TOKEN_PROGRAM_ID {
        msg!("Invalid token program");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }

    if *system_program.key != SYSTEM_PROGRAM_ID {
        msg!("Invalid system program");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }

    if *sysvar_rent.key != RENT_PROGRAM_ID {
        msg!("Invalid sysvar rent");
        return Err(ReviewError::IncorrectAccountInfo.into())
    }

    // calculate rent
    let rent = Rent::get()?;
    // size of a mint account is 82 bytes
    let rent_lamports = rent.minimum_balance(82);


    // create the token mint PDA
    invoke_signed(
        &system_instruction::create_account(
            initializer.key, // Rent payer
            token_mint.key, // Address who we're creating the account for
            rent_lamports, // Amount of rent to put into the account
            82, // Size of the account
            token_program.key,
        ),
        &[
            // List of accounts that will be read from/written to
            initializer.clone(),
            token_mint.clone(),
            system_program.clone(),
        ],
        // Seeds for the PDA
        &[&[b"token_mint", &[mint_bump]]],
    )?;
    msg!("Created Mint Account");

    // initialize the mint
    invoke_signed(
        &initialize_mint(
            token_program.key,
            token_mint.key,
            mint_auth.key,
            Option::None, // no freeze authority
            9, // 9 decimals
        )?,
        &[
            token_mint.clone(),
            sysvar_rent.clone(),
            mint_auth.clone(),
        ],
        &[&[b"token_mint", &[mint_bump]]],
    )?;

    Ok(())
}
