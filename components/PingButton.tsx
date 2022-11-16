import { FC, useState } from "react";
import * as Web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import styles from "../styles/PingButton.module.css";

export const PingButton: FC = () => {
  // get the connection from the useConnection hook
  const { connection } = useConnection();
  // use this string to create a new PublicKey: "Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz" and assign it to the variable myKey
  const myKey = new Web3.PublicKey(
    "Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz"
  );

  connection.getBalance(myKey).then((balance) => {
    console.log(balance);
  });
  // get the publicKey and sendTransaction from the useWallet hook
  const { publicKey, sendTransaction } = useWallet();

  const onClick = () => {
    if (!connection || !publicKey) {
      alert("Please connect your wallet first lol");
      return;
    }
    // this program just increments a counter haha
    const PROGRAM_ID = new Web3.PublicKey(
      "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa"
    );
    // and this stores the data for the counter program
    // solana stores executable code and stateful data separately
    const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey(
      "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod"
    );

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
    // this differs from the script because we're using the sendTransaction method from the useWallet hook
    sendTransaction(transaction, connection).then((sig) => {
      console.log(
        `Explorer URL: https://explorer.solana.com/tx/${sig}?cluster=devnet`
      );
    });

    console.log("Ping!");
  };

  return (
    <div className={styles.buttonContainer} onClick={onClick}>
      <button className={styles.button}>Ping!</button>
    </div>
  );
};
