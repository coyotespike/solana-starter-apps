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
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
      // borsh adds try_from_slice to all types that implement BorshDeserialize
        Ok(match variant {
            0 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::AddMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description
                }
            },
            1 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description
                }
            },
                2 => {
                    // i guess the borsh deserializer macro adjusts based on the struct and type
                let payload = CommentPayload::try_from_slice(rest).unwrap();
                Self::AddComment {
                    comment: payload.comment
                }
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
