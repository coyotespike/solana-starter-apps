use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    pubkey::Pubkey,
    program_pack::{IsInitialized, Sealed},
};

// we are adding a discriminator field as a run-time type
// we will use it to tell which sort of account we are accessing
// guessing we need to send the correct seeeds along
// otherwise we won't derive the correct PDA address

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieAccountState {
    pub discriminator: String,
    pub is_initialized: bool,
    pub reviewer: Pubkey,
    pub rating: u8,
    pub title: String,
    pub description: String,
}

// if we know struct size, this trait allows for some compiler optimizations
// we will know the size of this struct, and of MovieCommentCounter
impl Sealed for MovieAccountState {}

// I cannot figure out why we need this.
// isn't is_initialized already a bool?
// because IsInitialized is already defined as a trait
// we must implement ours specifically
// in order to override the default implementation
impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

// I think we will store these calculations in the state
// that way they are not recalculated every time
impl MovieAccountState {
    pub const DISCRIMINATOR: &'static str = "review";

    pub fn get_account_size(title: String, description: String) -> usize {
        // 4 bytes to store the size of the subsequent dynamic data (string)
        return (4 + MovieAccountState::DISCRIMINATOR.len())
            + 1 // 1 byte for is_initialized (boolean)
            + 1 // 1 byte for rating
            + (4 + title.len()) // 4 bytes to store the size of the subsequent dynamic data (string)
            + (4 + description.len()); // Same as above
    }

}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieCommentCounter {
    pub discriminator: String,
    pub is_initialized: bool,
    pub counter: u64,
}


impl Sealed for MovieCommentCounter{}

// why do we need to implement this for the is_initialized bool?
impl IsInitialized for MovieCommentCounter {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl MovieCommentCounter {
    pub const DISCRIMINATOR: &'static str = "counter";
    pub const SIZE: usize = (4 + MovieCommentCounter::DISCRIMINATOR.len()) + 1 + 8;
}


#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieComment {
    pub discriminator: String,
    pub is_initialized: bool,
    pub review: Pubkey,
    pub commenter: Pubkey,
    pub comment: String,
    pub count: u64,
}

// No Sealed here because the size of this struct is dynamic
impl IsInitialized for MovieComment {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl MovieComment {
    pub const DISCRIMINATOR: &'static str = "comment";

    pub fn get_account_size(comment: String) -> usize {
        return (4 + MovieComment::DISCRIMINATOR.len())
        + 1  // 1 byte for is_initialized (boolean)
        + 32 // 32 bytes for the movie review account key
        + 32 // 32 bytes for the commenter key size
        + (4 + comment.len()) // 4 bytes to store the size of the subsequent dynamic data (string)
        + 8; // 8 bytes for the count (u64)
    }
}
