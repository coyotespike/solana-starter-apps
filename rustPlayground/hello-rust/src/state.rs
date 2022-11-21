use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct NoteAccountState {
    pub is_initialized: bool,
    pub title: String,
    pub body: String,
}
