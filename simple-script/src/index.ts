/*
  In this comment, I'll summarize what each function does

    1. initializeKeypair
        - creates a new keypair if one doesn't exist
        - creates a .env file if one doesn't exist
        - appends the new keypair to the .env file
        - returns the keypair

    2. airdropSolIfNeeded
        - checks the balance of the keypair
        - if the balance is less than 1 SOL, airdrops 1 SOL
        - returns nothing

    3. pingProgram
        - creates a new transaction
        - creates a new instruction
        - adds the instruction to the transaction
        - sends the transaction to the network
        - returns nothing

    4. main
        - creates a connection to the network
        - creates a keypair
        - checks the balance of the keypair
        - if the balance is less than 1 SOL, airdrops 1 SOL
        - pings the program
        - creates a new keypair
        - transfers 0.15 SOL to the new keypair
        - returns nothing
  */

// We're adding these
import * as Web3 from "@solana/web3.js";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// this program just increments a counter haha
const PROGRAM_ID = new Web3.PublicKey(
  "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa"
);
// and this stores the data for the counter program
// solana stores executable code and stateful data separately
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey(
  "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod"
);

type TestWallets = {
  primary: Web3.Keypair;
  alternate: Web3.Keypair;
};
// this script lets us avoid having to manage testing wallets
// instead we create a testing account
async function initializeKeypair(): Promise<TestWallets> {
  // connection: Web3.Connection
  if (!process.env.PRIVATE_KEY) {
    console.log("Generating new keypair... 🗝️");
    const primary = Web3.Keypair.generate();

    console.log("Creating .env file");
    fs.writeFileSync(".env", `PRIVATE_KEY=[${primary.secretKey.toString()}]`);
  }

  if (!process.env.ALT_PRIVATE_KEY) {
    console.log("Generating new keypair... 🗝️");
    const alternate = Web3.Keypair.generate();

    console.log("Appending to .env file");
    // this is actually incorrect
    // it puts it on one line and JSON.parse fails
    fs.appendFileSync(
      ".env",
      `ALT_PRIVATE_KEY=[${alternate.secretKey.toString()}]`
    );
  }

  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecret = Web3.Keypair.fromSecretKey(secretKey);

  const altSecret = JSON.parse(process.env.ALT_PRIVATE_KEY ?? "") as number[];
  const altSecretKey = Uint8Array.from(altSecret);
  const altKeypairFromSecret = Web3.Keypair.fromSecretKey(altSecretKey);

  return { primary: keypairFromSecret, alternate: altKeypairFromSecret };
}

async function airdropSolIfNeeded(
  signer: Web3.Keypair,
  connection: Web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log("Current balance is", balance / Web3.LAMPORTS_PER_SOL, "SOL");

  // 1 SOL should be enough for almost anything you wanna do
  if (balance / Web3.LAMPORTS_PER_SOL < 1) {
    // You can only get up to 2 SOL per request
    console.log("Airdropping 1 SOL");
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      Web3.LAMPORTS_PER_SOL
    );

    const latestBlockhash = await connection.getLatestBlockhash();

    // does this request info, or accomplish a side effect?
    // apparently the first two properties confirm to the network that
    // we aren't sending a stale transaction
    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log("New balance is", newBalance / Web3.LAMPORTS_PER_SOL, "SOL");
  }
}

async function pingProgram(connection: Web3.Connection, payer: Web3.Keypair) {
  const transaction = new Web3.Transaction();
  const instruction = new Web3.TransactionInstruction({
    // Instructions need 3 things

    // 1. The public keys of all the accounts the instruction will read/write
    keys: [
      // this allows the Solana network to parallelize transactions which don't
      // hit the same data accounts or use the same programs
      {
        // find the below by reading the program itself or its documentation
        // because we must tell the runtime which data account to use
        pubkey: PROGRAM_DATA_PUBLIC_KEY,
        // the program does not require our signature
        isSigner: false,
        // but we are incrementing the counter after all
        isWritable: true,
      },
    ],

    // 2. The ID of the program this instruction will be sent to
    programId: PROGRAM_ID,

    // 3. Data - in this case, there's none!
  });

  transaction.add(instruction);
  const transactionSignature = await Web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  console.log(
    `Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

async function transferSol(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  recipient: Web3.Keypair,
  amount: number
) {
  let payerBalance = await connection.getBalance(payer.publicKey);
  console.log(
    "Current payer balance is",
    payerBalance / Web3.LAMPORTS_PER_SOL,
    "SOL"
  );
  let recipientBalance = await connection.getBalance(recipient.publicKey);
  console.log(
    "Current recipient balance is",
    recipientBalance / Web3.LAMPORTS_PER_SOL,
    "SOL"
  );

  const transaction = new Web3.Transaction();
  const sendSolInstruction = Web3.SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient.publicKey,
    lamports: Web3.LAMPORTS_PER_SOL * amount,
  });

  transaction.add(sendSolInstruction);
  const transactionSignature = await Web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  console.log(
    `Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
  payerBalance = await connection.getBalance(payer.publicKey);
  recipientBalance = await connection.getBalance(recipient.publicKey);
  console.log(
    `New balances: payer ${payerBalance}, recipient: ${recipientBalance}`
  );
}

async function main() {
  // I am not running a local net so this is a live net
  const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
  const wallets = await initializeKeypair();
  const signer = wallets.primary;

  console.log("Public key:", signer.publicKey.toBase58());

  // wonder if I can get the cooldown period from the faucet
  await airdropSolIfNeeded(signer, connection);
  await pingProgram(connection, signer);

  const recipient = wallets.alternate;
  await transferSol(connection, signer, recipient, 0.15);
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
