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
    pub discriminator: String, // to enable client-side filtering
    pub is_initialized: bool,
    pub name: String,
    pub msg: String,
}

impl IntroAccountState {
    // static, basically
    pub const DISCRIMINATOR: &'static str = "intro";

    // lil convenience method
    pub fn get_account_size(name: String, intro: String) -> usize {
        return (4 + IntroAccountState::DISCRIMINATOR.len())
            + 1  // 1 byte for is_initialized (boolean)
            + (4 + name.len()) // 4 bytes to store the size of the subsequent dynamic data (string)
            + (4 + intro.len()); // 4 bytes to store the size of the subsequent dynamic data (string)
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct ReplyCounterState {
    pub discriminator: String, // to enable client-side filtering
    pub is_initialized: bool, // Highlander rule: there can be only one!
    pub count: u64,
}

impl ReplyCounterState {
    // static, basically
    pub const DISCRIMINATOR: &'static str = "counter";

    // lil convenience method
    pub const SIZE: usize = (4 + ReplyCounterState::DISCRIMINATOR.len());
}

impl Sealed for ReplyCounterState {}
impl IsInitialized for ReplyCounterState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct ReplyAccountState {
    pub discriminator: String, // to enable client-side filtering
    pub is_initialized: bool, // Highlander rule: there can be only one!
    pub name: String,
    pub msg: String,
}


impl IsInitialized for ReplyAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

// no editing allowed!
impl Sealed for ReplyAccountState {}

impl ReplyAccountState {
    // static, basically
    pub const DISCRIMINATOR: &'static str = "reply";

    // lil convenience method
    pub fn get_account_size(reply: String) -> usize {
        return (4 + ReplyAccountState::DISCRIMINATOR.len())
            + 1  // 1 byte for is_initialized (boolean)
            + 32 // 32 bytes for the intro account key
            + 32 // 32 bytes for the reply_guy key size
            + (4 + reply.len()) // 4 bytes to store the size of the subsequent dynamic data (string)
            + 8; // 8 bytes for the count (u64)
    }
}
