# SPL tokens

This project creates a mint, a token account, and then mints tokens. Then it burns and transfers them.

Basically it is a CRUD app for tokens.

You can see my wallet tokens below:
https://explorer.solana.com/address/Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz/tokens?cluster=devnet


Next, it uses Metaplex to create metadata for this token! Miraculously, it works!


## TimCoin assets created
image uri: https://arweave.net/qQqPU8e7yJEfCWftJ1w5PHJiTz29uQXIrF-fsMEij7g
metadata uri: https://arweave.net/5c7qUykLzhyebt71CAbqyK1LgvIRyEV6y3nVyX36veg
Create Metadata Account: https://explorer.solana.com/tx/5DcKrTdzggWCqaBpk5yQ2kg5SPNUD4xXEESzMY7jAeMxkwsWbVgUTZZpAGQYrcxickQXECAodSSnkb5GoJXnsn5t?cluster=devnet

The token mint account address is 5n2PyML9sB6uMFuaursPxgZMLPmxYoSitJM4Qra5eb2J
Token Mint: https://explorer.solana.com/address/5n2PyML9sB6uMFuaursPxgZMLPmxYoSitJM4Qra5eb2J?cluster=devnet
Token Account: https://explorer.solana.com/address/EWbWSRgXcC3tRWbxbRPPsvdLtN7JpNZqBwiawVhfrJuB?cluster=devnet

I think this one is my wallet's token account:
Token Account: https://explorer.solana.com/address/61SgjmzWruU4PTkDcXZWC2NYnWLwTi7hewa9U4PKQuW5?cluster=devnet

## AustinCoin assets created
User wallet address: 6pp11AKVEoe8u78fV3wT85MdJXuodSMoodogpS3waXQP
The token mint account address is D4hSeKYPGxq6tS9ELyfkKHUCBJQwAz54Wh72oEN6k7ic
Token Mint: https://explorer.solana.com/address/D4hSeKYPGxq6tS9ELyfkKHUCBJQwAz54Wh72oEN6k7ic?cluster=devnet
image uri: https://arweave.net/RrLeXlvrxyUFV1WLVH-NJKij--5L5XbgYUDl_cUy0QM
metadata uri: https://arweave.net/F2QttYIeMG2hFzF5obKJbyQbmaBb8DcSMIl7GG-GAmo
Create Metadata Account: https://explorer.solana.com/tx/5sFTz1iUHYo4RXyaBExtik6ZTS6xbhqzHw5o57DvitiufbQoZpogH8M3Z4TiLZvYNTrSYRGjT9rg2Z2YJfkjyzu2?cluster=devnet

## TypeScript

Lesson learned: `tsc` from the command line ignored the tsconfig.json file. When run as an npm command, it now works. The problem was that it kept checking node modules.
