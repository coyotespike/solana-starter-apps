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
pub enum IntroInstruction {
    CreateIntro {
        name: String,
        msg: String,
    },
    UpdateIntro {
        name: String,
        msg: String,
    },
    DeleteIntro {
        name: String,
        msg: String,
    },
    AddReply {
        name: String,
        msg: String,
    },
}

// borsh is adding support for deserialization. It has added the functions necessary for us.
// has fn deserialize and fn try_from_slice
#[derive(BorshDeserialize)]
struct IntroInstructionPayload {
    name: String,
    msg: String
}

// the weird thing here is it's both implementing a type and a function
// the function must resolve to a type
// and it uses the macro we added above

impl IntroInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    // Self is a IntroInstruction type
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

        // Take the first byte as the variant to determine which instruction to execute
        // ok_or will return an error if the slice is empty
        // i also think this will return an error if the clietn just sends the name for DeleteIntro
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        // we got try_from_slice from the BorshDeserialize trait
        // unwrap in rust is like try catch in js
        let payload = IntroInstructionPayload::try_from_slice(rest).unwrap();

        // Match the variant and convert into enum variant aka instruction data type
        Ok(match variant {
            0 => Self::CreateIntro {
                name: payload.name,
                msg: payload.msg,
            },
            1 => Self::UpdateIntro {
                name: payload.name,
                msg: payload.msg,
            },
            2 => Self::DeleteIntro {
                name: payload.name,
                msg: payload.msg,
            },
            3 => Self::AddReply {
                name: payload.name,
                msg: payload.msg,
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
