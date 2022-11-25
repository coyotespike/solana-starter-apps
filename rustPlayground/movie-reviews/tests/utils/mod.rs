use {
    // super::*, doesn't appear to do anything
    solana_program_test::*,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        system_program::ID as SYSTEM_PROGRAM_ID,
        pubkey::Pubkey,
        hash::Hash,
    },
    solana_sdk::{
        signature::{ Keypair },
        sysvar::rent::ID as SYSVAR_RENT_ID
    },
    spl_token:: ID as TOKEN_PROGRAM_ID,
    movies::processor::process_instruction,
};


// helper function for tests
pub fn create_init_mint_ix(payer: Pubkey, program_id: Pubkey) -> (Pubkey, Pubkey, Instruction) {
    // Derive PDA for token mint authority
    let (mint, _bump_seed) = Pubkey::find_program_address(&[b"token_mint"], &program_id);
    let (mint_auth, _bump_seed) = Pubkey::find_program_address(&[b"token_auth"], &program_id);

    let init_mint_ix = Instruction {
        program_id: program_id,
        accounts: vec![
            AccountMeta::new_readonly(payer, true),
            AccountMeta::new(mint, false),
            AccountMeta::new(mint_auth, false),
            AccountMeta::new_readonly(SYSTEM_PROGRAM_ID, false),
            AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
            AccountMeta::new_readonly(SYSVAR_RENT_ID, false)
        ],
        data: vec![3]
    };

    // return tuple
    (mint, mint_auth, init_mint_ix)
}

// setup function
// get an odd type error about opaqueness
pub async fn setup() -> (BanksClient, Keypair, Hash, Pubkey) {
    let program_id = Pubkey::new_unique();
    let (banks_client, payer, recent_blockhash) = ProgramTest::new(
        "pda_local",
        program_id,
        processor!(process_instruction),
    )
        .start()
        .await;

    (banks_client, payer,recent_blockhash, program_id)
}

