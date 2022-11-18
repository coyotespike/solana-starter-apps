import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";

import {
  createNewMint,
  createTokenAccount,
  getOrCreateAssociatedTokenAccount,
  mintTokens,
  transferToMe,
} from "./mintingFunctions";
import { assetInfo, createTokenMetadata } from "./tokenMetadata";
import makeMetaplex from "./makeMetaplex";

/**
This function does the following:
1. Creates a new mint
2. Creates a metadata account for the mint
3. Creates a token account for the mint, if it doesn't already exist
4. Mints some tokens

It therefore demonstrates a single instruction that does everything at once!
**/

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const metaplex = await makeMetaplex(connection, user);

  // log the user's wallet address
  console.log("User wallet address:", user.publicKey.toBase58());

  // create a new token mint

  const mint = await createNewMint(
    connection,
    user, // payer
    user.publicKey, // mint authority
    user.publicKey, // freeze authority
    2 // decimals
  );

  const newAsset: assetInfo = {
    assetPath: "assets/austin.jpeg",
    name: "AustinCoin",
    symbol: "AUS",
    description: "AustinCoin is a cryptocurrency",
  };
  // create a metadata account for the token mint
  // you actually must supply complete metadata to create the account
  // so actually we will just make the token metadata
  const metadata = await createTokenMetadata(
    connection,
    metaplex,
    mint,
    user,
    newAsset
  );

  // create a token account
  // try to add this instruction conditionally if you can
  // I wrote a conditional function based on theirs and named it the same
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    mint,
    user.publicKey
  );

  // mint some tokens
  const txSig = await mintTokens(
    connection,
    user,
    mint,
    tokenAccount.address,
    user,
    1000
  );

  // I want to be able to see the metadata in my wallet :)
  // so I will transfer the tokens to myself
  const txSig2 = await transferToMe(connection, user, mint, tokenAccount);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
