import * as web3 from "@solana/web3.js";
import * as fs from "fs";
import * as borsh from "@project-serum/borsh";
import dotenv from "dotenv";

import { initializeKeypair, airdropSolIfNeeded } from "./initializeKeypair";

const noteInstructionLayout = borsh.struct([
  borsh.u8("variant"),
  borsh.str("title"),
  borsh.str("body"),
]);

async function createNote(
  signer: web3.Keypair,
  programId: web3.PublicKey,
  connection: web3.Connection
) {
  let buffer = Buffer.alloc(1000);
  let title = "Hello World";
  let body = "This is a note";
  noteInstructionLayout.encode({ variant: 0, title, body }, buffer);
  const fittedBuffer = buffer.slice(0, noteInstructionLayout.getSpan(buffer));

  const [pda] = await web3.PublicKey.findProgramAddress(
    [signer.publicKey.toBuffer(), Buffer.from(title)],
    programId
  );

  console.log("PDA: ", pda.toBase58());

  const transaction = new web3.Transaction();
  const instruction = new web3.TransactionInstruction({
    programId,
    data: fittedBuffer,
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: false },
      { pubkey: pda, isSigner: false, isWritable: true },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
  });

  transaction.add(instruction);
  const tx = await web3.sendAndConfirmTransaction(connection, transaction, [
    signer,
  ]);
  console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  return tx;
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const programId = new web3.PublicKey(
    "HY7fYbBQvEUeHKsdFTv5teyYmtm9QCt2E6QhofonUGdk"
  );

  const wallet = await initializeKeypair(connection);
  await airdropSolIfNeeded(wallet, connection);

  const transactionSignature = await createNote(wallet, programId, connection);
}

main();
