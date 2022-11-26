use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use anchor_lang::solana_program::program::invoke_signed;
use mpl_token_metadata::instruction::create_metadata_accounts_v2;


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

        let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];

        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.reward_mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.reward_mint.to_account_info(),
            },
            &signer,
        );

        token::mint_to(cpi_ctx, 10000000)?;
        msg!("Minted Tokens");

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

    pub fn initialize_token_mint(_ctx: Context<InitializeMint>) -> Result<()> {
        msg!("Token mint initialized");
        Ok(())
    }

    // can't get this to work

    pub fn create_reward_mint(
        ctx: Context<CreateTokenReward>,
        uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        msg!("Create Reward Token");

        let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];

        let signer = [&seeds[..]];

        let account_info = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.reward_mint.to_account_info(),
            ctx.accounts.reward_mint.to_account_info(),
            ctx.accounts.user.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];

        invoke_signed(
            &create_metadata_accounts_v2(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.reward_mint.key(),
                ctx.accounts.reward_mint.key(),
                ctx.accounts.user.key(),
                ctx.accounts.user.key(),
                name,
                symbol,
                uri,
                None,
                0,
                true,
                true,
                None,
                None,
            ),
            account_info.as_slice(),
            &signer,
        )?;

        Ok(())
    }
}

// // used in create_reward_mint
#[derive(Accounts)]
pub struct CreateTokenReward<'info> {
    #[account(
        init,
        seeds = ["mint".as_bytes().as_ref()],
        bump,
        payer = user,
        mint::decimals = 6,
        mint::authority = reward_mint,

    )]
    pub reward_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,

    /// CHECK:
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    /// CHECK:
    pub token_metadata_program: AccountInfo<'info>,
}

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

    #[account(mut,
              seeds = ["mint".as_bytes().as_ref()],
              bump
    )]
    pub reward_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = initializer,
        associated_token::mint = reward_mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)] // implements all the shit #[account] added below
    pub initializer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct UpdateMovieReview<'info> {
    // #[account] and pub <name> work together to define an account validation, to be performed on each call to this method
    #[account( // CPI to system program: create_account, initialize_account
        mut, // must be provided before realloc
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

#[derive(Accounts)]
pub struct CloseMovieReview<'info> {
    #[account(mut, close = reviewer, has_one = reviewer)] // CPI to system program: close_account
    pub movie_review: Account<'info, MovieAccountState>, // what to validate against. Checks owner too.
    #[account(mut)] // implements all
    reviewer: Signer<'info>, // account to refund to
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        seeds = [b"mint"],
        bump,
        payer = user,
        mint::decimals = 6,
        mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

#[account]
pub struct MovieAccountState {
    pub reviewer: Pubkey, // 32
    pub title: String,    // 4 + len()
    pub description: String, // 4 + len()
    pub rating: u8,       // 1
}
