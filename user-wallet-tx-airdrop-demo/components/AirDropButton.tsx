import { FC, useState } from "react";
import * as Web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import styles from "../styles/PingButton.module.css";

export const AirDropButton: FC = ({ setBalance }) => {
  // get the connection from the useConnection hook
  const { connection } = useConnection();

  // use this string to create a new PublicKey: "Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz" and assign it to the variable myKey

  const { publicKey, sendTransaction } = useWallet();

  const onClick = () => {
    if (!connection || !publicKey) {
      alert("Please connect your wallet first lol");
      return;
    }
    connection.getBalance(publicKey).then((balance) => {
      console.log("balance", balance);
      setBalance(balance);
    });

    // use the connection to request an airdrop to your publicKey
    connection
      .requestAirdrop(publicKey, Web3.LAMPORTS_PER_SOL)
      .then((signature) => {
        connection.confirmTransaction(signature).then(() => {
          connection.getBalance(publicKey).then((balance) => {
            setBalance(balance);
          });
        });
      });
  };

  return (
    <div className={styles.buttonContainer} onClick={onClick}>
      <button className={styles.button}>Get Money!</button>
    </div>
  );
};
