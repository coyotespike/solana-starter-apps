import * as web3 from "@solana/web3.js";
import * as fs from "fs";
import dotenv from "dotenv";

import { initializeKeypair, airdropSolIfNeeded } from "./initializeKeypair";

const programId = new web3.PublicKey(
  "CP6ET2sewmoBvmhPwFcUDbiAGRMjQ1jeVE3xd2KMHCNR"
);

async function sayHello(
  connection: web3.Connection,
  payer: web3.Keypair
): Promise<web3.TransactionSignature> {
  const transaction = new web3.Transaction();

  const instruction = new web3.TransactionInstruction({
    keys: [], // We're not using any accounts yet...lesson learned, we don't even need the payer account.
    programId,
    // No need to add data here!
  });

  transaction.add(instruction);

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  return transactionSignature;
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

  const wallet = await initializeKeypair(connection);
  await airdropSolIfNeeded(wallet, connection);
  const transactionSignature = await sayHello(connection, wallet);

  console.log(
    `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

main();
