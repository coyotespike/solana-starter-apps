use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_pack::{ Sealed, IsInitialized };

// apparently this just works
impl Sealed for IntroAccountState {}

impl IsInitialized for IntroAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct IntroAccountState {
    pub is_initialized: bool,
    pub name: String,
    pub msg: String,
}
