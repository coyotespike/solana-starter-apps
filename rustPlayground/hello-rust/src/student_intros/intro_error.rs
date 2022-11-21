use solana_program::{
    program_error::ProgramError
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum IntroError {

    #[error("Wrong signer")]
    MissingRequiredSignature,

    #[error("Account not initialized yet")]
    UninitializedAccount,

    #[error("PDA derived does not equal PDA passed in")]
    InvalidPDA,

    #[error("Text is too long")]
    InvalidDataLength,

    #[error("Illegal owner")]
    IllegalOwner,
}

// in Solana we can only return ProgramError
// so we need to convert our IntroError to ProgramError
// we implement From trait for IntroError
impl From<IntroError> for ProgramError {
    fn from(e: IntroError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
