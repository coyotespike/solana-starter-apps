# Solana Programs de novo

what is into() and as_ref()?

copilot says: as_ref() is a method on Option that returns a reference to the value inside the Option

## CLI set up
solana config set --url https://api.devnet.solana.com
solana config get
solana balance
or solana airdrop <num>

## Building the Rust file
`cargo build-bpf` didn't work until I had both [package] and [lib] in the toml file. then it generated the .so file.

`solana program deploy ./target/deploy/hello_world.so`

Program Id: CP6ET2sewmoBvmhPwFcUDbiAGRMjQ1jeVE3xd2KMHCNR

https://explorer.solana.com/address/CP6ET2sewmoBvmhPwFcUDbiAGRMjQ1jeVE3xd2KMHCNR?cluster=devnet

https://explorer.solana.com/tx/3a4x5gz3YWJGQgXUC6M8PgmCHz1yHZbGjtzJt5uLTzzm3kLpJjj8etrUxvBHzcsA9yNnAJLPWBR4ZYf4x1u8EgPY?cluster=devnet

## The Client
I used my prior art from the simple-client script folder to call the program.

https://explorer.solana.com/tx/2tYih9QxXuUTFdqLnxTy81HSkXxp3Ver95C2Byd2V4DuKtf86g9HAM51DnRhsVfTNdjEQbrcbEMqfw4ToVh1rVsX?cluster=devnet


## Next
4Urzd4Y2of3jjCDo9uGCqZxYSwP7WHhXtwgbxQrpYNKx
https://explorer.solana.com/address/4Urzd4Y2of3jjCDo9uGCqZxYSwP7WHhXtwgbxQrpYNKx?cluster=devnet

## Gotchas
Quite a painful experience. My Rust enum had an id, u64. On the client side, at first Borsh would not serialize a siple number, finally I converted it with new BN. But then the instruction still failed when sent to the Solana program/smart contract.

I just removed the ID, re-deployed under a new name (otherwise I am not sure it updates the program), and finally tried again. Success!

## Program from scratch
HXvmw6ZPPw2BnGzaGdUErRwUtfocnvAqiuEpbSBBRThZ
https://explorer.solana.com/address/HXvmw6ZPPw2BnGzaGdUErRwUtfocnvAqiuEpbSBBRThZ?cluster=devnet

oxc7UraX9w7BT4bcuoZsrGnoMxpYU7T8f4mbzEfkrnp
https://explorer.solana.com/address/oxc7UraX9w7BT4bcuoZsrGnoMxpYU7T8f4mbzEfkrnp?cluster=devnet


## Movie Review Comments
We want to store comments for each movie review.
- What does this look like on chain?
- When reading on the client, how do we find comments for a specific review?

For each movie review, we'll have one comment counter PDA, and many comment PDAs.
- commenter counter seeds: "comment", movie review PDA PubKey
- comment PDA seeds: comment ID, movie review PDA PubKey


Because each review doesn't know about its comments, the client must find it.

In fact the comment PDA seeds appear to be the PDA review key, and the comment counter key. I do not see how this provies a unique and recoverable address for each comment PDA.

Define structs to represent the comment counter and comment accounts
Update the existing MovieAccountState to contain a discriminator (more on this later)
Add an instruction variant to represent the add_comment instruction
Update the existing add_movie_review instruction to include creating the comment counter account
Create a new add_comment instruction

## Adding Replies to a Student Intro

From memory:
- We need to update the state to add a reply type, and so the intro knows about the counter
- We need to update the instruction types so the intro takes the counter, and to add a reply type.
- The add_intro function will also add a reply counter PDA and initialize it
- The `add_reply` function will receive the accounts for the reply_guy, the intro, the counter, the client-calculated comment, and ofc the system program

that is pretty much it.

Remember the program itself owns all the accounts: the intro accounts and the reply accounts.

On the client side, connection.getProgramAccounts will return all the accounts for the program. We can then filter by type, because we added a discriminator to the state.

This also matters for our StudentIntro Coordinator.

( For some reason we use this with Movies but not Comments. for comments, we iterate through all possible counter values to get each PDA individually, then fetch en masse. We had better use it anyway so the client can filter in this special way)

Really not too bad. in theory, the client should be able to calculate the reply PDA.

34tmM8HYe17XsWWuNp3qt63rQDKVJtRNy2EjL2GKAvb9

https://explorer.solana.com/address/34tmM8HYe17XsWWuNp3qt63rQDKVJtRNy2EjL2GKAvb9?cluster=devnet
