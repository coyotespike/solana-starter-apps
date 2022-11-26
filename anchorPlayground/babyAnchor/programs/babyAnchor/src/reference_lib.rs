use anchor_lang::prelude::*;

// will generate a new keypair and use it to deploy the program.
// replaces the entrypoint! macro which passed a program id into our program
declare_id!("ASLTT67FCXboVCz5bRcTGNmYQ3BkUzqVpZeRvc3azCiS");

// defines the module that contains the program's instructions
// account validation and security checks defined separately
// every instruction/function takes context and instruction data
// anchor deserializes the data!
#[program]
pub mod baby_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

// but what is context?
// our programs are stateless
// context is a struct that contains the following fields:
  // the program id
  // accounts: deserialized accounts
  // remaining_accounts:  not deserialized OR VALIDATED. basically don't use.
  // bump seeds found during constraint validation. BTreeMap. no need to recalculate inside instruction handlers

// the lifetime of the context is the lifetime of all properties which are denoted with a lifetime

// at runtime, we can access ctx.program_id, ctx.accounts, ctx.remaining_accounts, ctx.bumps


// here we define accounts pass into our program
// this macro has Anchor create the implementations to parse the accounts
// creates a struct with account_name, user, system_program
//     #[account(mut)] adds additional constraints
// anchor will always check the accounts passed in match the correct types, and additional constraints
#[derive(Accounts)]
// pub struct InstructionAccounts {
//     #[account(init, payer = user, space = 8 + 8)]
//     pub account_name: Account<'info, AccountStruct>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// Anchor also adds more AccountInfo types!
//// Account wrapper deseriealizes into AccountStruct, checks if program owner of the account also matches correct account type, and checks the correct owner
//// Signer. Validates user has signed.
//// Program. checks if account passed in is actually an executable program


//     #[account(init, payer = user, space = 8 + 8)]
// init: this creates the account via CPI to the system program, and initializes it with account discriminator and size
// payer: the account that pays for the account creation
// space: the size of the account in bytes. first 8 bytes are discriminator, then 8 bytes are the data
// this one line was create_account and initialize_account

// how about #[account(mut)]?
// implements:
//     AccountSerialize
//     AccountDeserialize. try_deserialize will always check the discriminator
//     AnchorSerialize
//     AnchorDeserialize
//     Clone
//     Discriminator
//     Owner. checks if the owner of the account is the program id, with declareId. And any accounts initialized using an account type defined with #[account] will have the program id as the owner


pub struct Initialize {}
