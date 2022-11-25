use borsh::{BorshDeserialize};
use solana_program::{
    program_error::ProgramError,
};


/*
Defines our instruction data as a Rust type in an enum
Defines our payload struct
Declares the BorshDeserialize macro on the payload struct
Creates an implementation for the payload struct (bytes -> struct)
Creates an unpack function that takes in the instruction data and deserializes it
*/

// data type for the byte arrays of each instruction variant
pub enum NoteInstruction {
    CreateNote {
        title: String,
        body: String,
    },
    UpdateNote {
        title: String,
        body: String,
    },
    DeleteNote {
        title: String,
    }
}

// borsh is adding support for deserialization. It has added the functions necessary for us.
// has fn deserialize and fn try_from_slice
#[derive(BorshDeserialize)]
struct NoteInstructionPayload {
    title: String,
    body: String
}

// the weird thing here is it's both implementing a type and a function
// the function must resolve to a type
// and it uses the macro we added above

impl NoteInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    // Self is a NoteInstruction type
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

        // Take the first byte as the variant to determine which instruction to execute
        // ok_or will return an error if the slice is empty
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        // we got try_from_slice from the BorshDeserialize trait
        // unwrap in rust is like try catch in js
        let payload = NoteInstructionPayload::try_from_slice(rest).unwrap();

        // Match the variant and convert into enum variant aka instruction data type
        Ok(match variant {
            0 => Self::CreateNote {
                title: payload.title,
                body: payload.body,
            },
            1 => Self::UpdateNote {
                title: payload.title,
                body: payload.body,
            },
            2 => Self::DeleteNote {
                title: payload.title,
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
