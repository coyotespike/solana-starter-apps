import { FC } from "react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import {
  WalletMultiButton,
  WalletModalButton,
} from "@solana/wallet-adapter-react-ui";

// WalletMultiButton handles connecting to _app.tsx ???
// don't really believe it tbh

export const AppBar: FC = () => {
  return (
    <div className={styles.AppHeader}>
      <Image src="/solanaLogo.png" height={30} width={200} />
      <span>Wallet-Adapter Example</span>
      <WalletModalButton />
      <WalletMultiButton />
    </div>
  );
};
