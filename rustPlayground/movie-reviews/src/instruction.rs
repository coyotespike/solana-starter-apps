use borsh::{BorshDeserialize};
use solana_program::{program_error::ProgramError};

// this is a type to enforce what we pass into the function
// we can use this enum in match statements to enforce what we pass in
// for example, see below and the process_instruction
pub enum MovieInstruction {
  AddMovieReview {
    title: String,
    rating: u8,
    description: String
  },
  UpdateMovieReview {
    title: String,
    rating: u8,
    description: String
  },
    AddComment {
    comment: String
    },
    InitializeMint,
}

// this is what we want the client to pass us
// but not what we want to store in the account. we also store is_initialized
#[derive(BorshDeserialize)]
struct MovieReviewPayload {
  title: String,
  rating: u8,
  description: String
}


#[derive(BorshDeserialize)]
struct CommentPayload {
  comment: String
}

impl MovieInstruction {
  pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
      println!("unpacking instruction");
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
      // borsh adds try_from_slice to all types that implement BorshDeserialize
      println!("unpacked instruction");
        Ok(match variant {
            0 => {
                println!("unpacking add movie review in variant 0");
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::AddMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description
                }
            },
            1 => {
                println!("unpacking update instruction in variant 1");
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description
                }
            },
                2 => {
                println!("unpacking add comment in variant 2");
                    // i guess the borsh deserializer macro adjusts based on the struct and type
                let payload = CommentPayload::try_from_slice(rest).unwrap();
                Self::AddComment {
                    comment: payload.comment
                }
            },
            3 => {
                println!("unpacking initialize mint in variant 3");
                Self::InitializeMint
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
