use borsh::{BorshDeserialize, BorshSerialize};

// apparently this just works
impl Sealed for NoteAccountState {}

impl IsInitialized for NoteAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct NoteAccountState {
    pub is_initialized: bool,
    pub title: String,
    pub body: String,
}
