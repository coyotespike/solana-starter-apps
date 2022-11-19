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

  // in this case I copied this the AustinCoin/TimFace mint address
  const mint = new web3.PublicKey(
    "D4hSeKYPGxq6tS9ELyfkKHUCBJQwAz54Wh72oEN6k7ic"
  );

  // I copied this from my in-browser PHantom wallet
  const myWalletKey = new web3.PublicKey(
    "Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz"
  );

  // we can only transfer tokens between token accounts from the same mint
  // to send to our wallet, therefore, we need to create a token account for our wallet
  const myTokenAccount = await createTokenAccount(
    connection,
    user, // payer haha
    mint,
    myWalletKey // the owner of the token account
  );
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

export default main;
