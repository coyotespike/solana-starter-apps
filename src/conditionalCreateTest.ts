import * as web3 from "@solana/web3.js";

import { initializeKeypair } from "./initializeKeypair";
import { getOrCreateAssociatedTokenAccount } from "./mintingFunctions";

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const mintAddress = "D4hSeKYPGxq6tS9ELyfkKHUCBJQwAz54Wh72oEN6k7ic";
  const mint = new web3.PublicKey(mintAddress);

  const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user, // payer
    mint, // <-- this is the mint address
    user.publicKey // owner
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
