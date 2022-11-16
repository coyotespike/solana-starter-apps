import { initializeKeypair } from "./initializeKeypair";
import {
  createNewMint,
  createTokenAccount,
  mintTokens,
  transferTokens,
  burnTokens,
} from "./mintingFunctions";

import * as web3 from "@solana/web3.js";

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  const mint = await createNewMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    2
  );

  const tokenAccount = await createTokenAccount(
    connection,
    user,
    mint, // is already a public key. and is the owner of the token account!
    user.publicKey
  );

  const tokens = await mintTokens(
    connection,
    user,
    mint,
    tokenAccount.address,
    user,
    100
  );

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${tokens}?cluster=devnet`
  );

  const receiver = web3.Keypair.generate().publicKey;
  const receiverTokenAccount = await createTokenAccount(
    connection,
    user, // I pay
    mint, // the mint factory of this token account
    receiver // the owner of the token account
  );

  const transfer = await transferTokens(
    connection,
    user,
    tokenAccount.address,
    receiverTokenAccount.address,
    user.publicKey,
    10,
    mint
  );

  const receiverBalance = await connection.getTokenAccountBalance(
    receiverTokenAccount.address
  );
  console.log(`Receiver balance: ${receiverBalance.value.uiAmount}`);

  console.log("initiating transfer");

  // I copied this from my in-browser PHantom wallet
  const myWalletKey = new web3.PublicKey(
    "Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz"
  );

  // we can only transfer tokens between token accounts from the same mint
  // to send to our wallet, therefore, we need to create a token account for our wallet
  const myTokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    myWalletKey // the owner of the token account
  );

  // after transfer, it will show in our wallet.
  const transferToMe = await transferTokens(
    connection,
    user, // payer
    tokenAccount.address, // from
    myTokenAccount.address, // destination
    user.publicKey, // owner
    10,
    mint
  );

  const myBalance = await connection.getBalance(user.publicKey);
  console.log(`My balance: ${myBalance}`);

  const burn = await burnTokens(
    connection,
    user,
    tokenAccount.address,
    mint,
    user, // again idk what owner is here
    10
  );

  const tokenBalance = await connection.getTokenAccountBalance(
    tokenAccount.address
  );
  console.log(`Token balance: ${tokenBalance.value.uiAmount}`);
}

export default main;
