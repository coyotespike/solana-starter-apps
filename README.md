# Demo app for a data account


## Storing Data
In other apps, we send a transaction that executes a program (calls a smart contract) but does not store data.

The simplest possible example is sending money - a native program, core to Solana.

The next example is incrementing a counter.

On Solana, smart contracts (program accounts) don't store their own data. Rather they have an associated data account.

Storing data therefore requires the data to be serialized (so Solana can move fast), and the data account info to be included in the transaction.

This is kinda low-level but still pretty easy.

Then we include the data in the Solana instruction we build, and put the instruction into the transaction and send, as before.

After sending the transaction, the explorer shows this:
```
Unknown Program (CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN) Instruction
> Program logged: "process_instruction: CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN: 3 accounts, data=[0, 6, 0, 0, 0, 66, 97, 116, 109, 97, 110, 3, 25, 0, 0, 0, 97, 32, 100, 97, 114, 107, 101, 114, 44, 32, 103, 114, 105, 116, 116, 105, 101, 114, 32, 66, 97, 116, 109, 97, 110]"
> Program consumption: 176752 units remaining
> Program logged: "Initialize movie rating account"
> Program logged: "finding pda"
> Program logged: "pda: qp6Acy7sBPuN2EnTADBQiQCAvocUGj21LDYoKmvgR9E"
> Program logged: "initializing account at pda"
> Program invoked: System Program
  > Program returned success
> Program logged: "Movie: Batman"
> Program logged: "unpacking state account"
> Program logged: "borrowed account data"
> Program logged: "checking if user account is already initialized"
> Program logged: "serializing account"
> Program logged: "state account serialized"
> Program consumption: 151705 units remaining
> Program consumed: 48571 of 200000 compute units
```

Amusingly, the Borsh library we use here appears to have been developed by Serum - from the infamous and defunct Alameda/FTX!!

## Reading and Deserializing

Interestingly, although we use both the program ID and the movie title to CREATE the account address, the program knows all the addresses associated with it. We don't need the title to RECOVER the generated address.

i.e. `connection.getProgramAccounts(new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID))` works.
