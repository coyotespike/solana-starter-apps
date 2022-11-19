# Candy Machine Demo
Super easy and incredible. Used my solana default payer ID as the pubkey.
Candy Machine ID: 6mmBfcPHvEkW7oXFVvKKqHWwQLJ5NxFvYECvSLWi6AUw
https://www.solaneyes.com/address/6mmBfcPHvEkW7oXFVvKKqHWwQLJ5NxFvYECvSLWi6AUw?cluster=devnet

and then `sugar mint` mints an NFT, again with the default wallet. You can click through on Solaneyes and see that wallet now owns the minted NFT!

Candy Machine mints are randomised by default. Purchasing 1 does indeed reduce the total supply in the Machine.


## Running
After creating `assets` in the required format, `sugar launch`

## Frontend
simply `git clone https://github.com/metaplex-foundation/candy-machine-ui`


## Configuration
`sugar update`

### Gatekeeper
For example, this struct:

```
{
    "gatekeeperNetwork": "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6",
    "expireOnUse": true
  },
```

then prompts any UI to display the requested Captcha! The chain really is a global database.

HOWEVER note this is known to break things! Concretely non-SOL tokens below do not work. The transaction fails, the Candy Machine is not updated, the wallet displays unknown tokens with no metadata.

### Nonstandard Tokens

Super cool.

```
  "solTreasuryAccount": null,
  "splTokenAccount": "61SgjmzWruU4PTkDcXZWC2NYnWLwTi7hewa9U4PKQuW5",
  "splToken": "5n2PyML9sB6uMFuaursPxgZMLPmxYoSitJM4Qra5eb2J",
```
`solTreasuryAccount` is null because no treasury will be paid in Sol now. The `splTokenAccount` is my Phantom wallet's token account for that token. And `splToken` is the mint address for the token.

I don't get charged my own coin if my wallet is the splTokenAccount - because I am just paying myself! but if the original mint token account is the `splTokenAccount`, then I have to pay my coin. super cool.
