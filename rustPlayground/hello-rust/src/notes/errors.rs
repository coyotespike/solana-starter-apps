use solana_program::{
    program_error::ProgramError
};
use thiserror::Error;

#[derive(Error)]
pub enum NoteError {

    #[error("Account not initialized yet")]
    UninitializedAccount,

    #[error("PDA derived does not equal PDA passed in")]
    InvalidPDA,

    #[error("Text is too long")]
    InvalidDataLength,
}

// in Solana we can only return ProgramError
// so we need to convert our NoteError to ProgramError
// we implement From trait for NoteError
impl From<NoteError> for ProgramError {
    fn from(e: NoteError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
