use anchor_lang::prelude::*;

declare_id!("ASLTT67FCXboVCz5bRcTGNmYQ3BkUzqVpZeRvc3azCiS");

// logic
#[program]
pub mod baby_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Initialized counter to 0: { }", counter.count);
        println!("Initialized counter to 0: { }", counter.count);
        Ok(())
    }
    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Previous count: { }", counter.count);
        counter.count = counter.count.checked_add(1).unwrap();
        msg!("Incremented counter to: { }", counter.count);
        Ok(())
    }
    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Previous count: { }", counter.count);
        counter.count = counter.count.checked_sub(1).unwrap();
        msg!("Decremented counter to: { }", counter.count);
        Ok(())
    }
}

// validation
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}

// structures
#[account]
pub struct Counter {
    pub count: u64,
}
