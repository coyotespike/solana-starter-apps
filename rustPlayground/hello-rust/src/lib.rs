use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};
pub mod notes;
use notes::{NoteInstruction};

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
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    title: String,
    body: String,
) -> ProgramResult {

    msg!("Adding a note");
    msg!("Title: {}", title);
    msg!("Body: {}", body);

    // gracefully exit the program
    Ok(())
}

pub fn update_note(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    title: String,
    body: String,
) -> ProgramResult {

    msg!("Updating a note");
    msg!("Title: {}", title);
    msg!("Body: {}", body);

    // gracefully exit the program
    Ok(())
}

pub fn delete_note(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    title: String,
) -> ProgramResult {

    msg!("Deleting a note: {}", title);

    // gracefully exit the program
    Ok(())
}
