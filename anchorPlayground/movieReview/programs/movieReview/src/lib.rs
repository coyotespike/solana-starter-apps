use anchor_lang::prelude::*;

declare_id!("97CXoUqqeTT52KLt7nBBx5oaFMkiu5QMUGLoRc18qnFA");

// Step 2: Define logic for the program
#[program]
pub mod movie_review {
    use super::*;

    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("Adding movie review");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review_account = &mut ctx.accounts.movie_review;
        movie_review_account.reviewer = ctx.accounts.initializer.key();
        movie_review_account.title = title;
        movie_review_account.description = description;
        movie_review_account.rating = rating;

        Ok(())
    }

    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("Updating movie review");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        msg!("Context: {:?}", ctx);

        let movie_review_account = &mut ctx.accounts.movie_review;
        movie_review_account.title = title;
        movie_review_account.description = description;
        movie_review_account.rating = rating;

        Ok(())
    }

    pub fn close_movie_review(_ctx: Context<CloseMovieReview>) -> Result<()> {
        msg!("Closing movie review");
        Ok(())
    }

}

// Step 3: Define validation and context for the program
#[derive(Debug)] // Debug is required for the Context to be printable
#[derive(Accounts)] // Adds validation
#[instruction(title: String, description: String)]
pub struct AddMovieReview<'info> {
    #[account( // CPI to system program: create_account, initialize_account
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 4 + title.len() + 4 + description.len() + 1
    )]
    pub movie_review: Account<'info, MovieAccountState>, // what to validate against. Checks owner too.
    #[account(mut)] // implements all the shit #[account] added below
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Debug)]
#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct UpdateMovieReview<'info> {
    #[account( // CPI to system program: create_account, initialize_account
        mut, // must be provided before realloc seeds = [title.as_bytes(), initializer.key().as_ref()],
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        realloc = 8 + 32 + 4 + title.len() + 4 + description.len() + 1,
        realloc::payer = initializer,
        realloc::zero = true, // should new memory be zeroed out upon initialization?
    )]
    pub movie_review: Account<'info, MovieAccountState>, // what to validate against. Checks owner too.
    #[account(mut)] // implements all
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Debug)]
#[derive(Accounts)]
pub struct CloseMovieReview<'info> {
    #[account(mut, close = reviewer, has_one = reviewer)] // CPI to system program: close_account
    pub movie_review: Account<'info, MovieAccountState>, // what to validate against. Checks owner too.
    #[account(mut)] // implements all
    reviewer: Signer<'info>,
}

// Step 1: Define the state of the program
#[derive(Debug)]
#[account]
pub struct MovieAccountState {
    pub reviewer: Pubkey, // 32
    pub title: String,    // 4 + len()
    pub description: String, // 4 + len()
    pub rating: u8,       // 1
}
