# Another data account demo

This builds on the movies app. This time the program uses only the public key of the caller wallet to generate the data account, note only publicKey.toBuffer() in the array below:
```
// once again we must figure out the address of the data account
    const [pda] = await web3.PublicKey.findProgramAddress(
      [publicKey.toBuffer()],
      new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID)
    );
```

Interestingly the wallet will not provide an estimate of gas if the call is invalid.

```
> Program logged: "process_instruction: HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf: 3 accounts, data=[0, 3, 0, 0, 0, 83, 66, 70, 21, 0, 0, 0, 108, 111, 115, 105, 110, 32, 49, 53, 32, 98, 105, 108, 108, 105, 111, 110, 44, 32, 110, 98, 100]"
> Program consumption: 178699 units remaining
> Program logged: "Initialize with user input"
> Program logged: "finding pda"
> Program logged: "pda: 7jETuuDKqvvc9Zz7xWCmWsirGzwYe5Hb9jxrnvWMgvgx"
> Program logged: "initializing account at pda"
> Program invoked: System Program
  > Program returned success
> Program logged: "User name: SBF"
> Program logged: "unpacking state account"
> Program logged: "borrowed account data"
> Program logged: "checking if user account is already initialized"
> Program logged: "serializing account"
> Program logged: "state account serialized"
> Program consumption: 153763 units remaining
> Program consumed: 46512 of 200000 compute units
```

