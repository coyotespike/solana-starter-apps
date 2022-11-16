import { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import { AppBar } from "../components/AppBar";
import Head from "next/head";
import { PingButton } from "../components/PingButton";
import { AirDropButton } from "../components/AirDropButton";

const Home: NextPage = (props) => {
  const [balance, setBalance] = useState(0);

  return (
    <div className={styles.App}>
      <Head>
        <title>Wallet-Adapter Example</title>
        <meta name="description" content="Wallet-Adapter Example" />
      </Head>
      <AppBar />
      <div className={styles.AppBody}>
        <p>Balance: {balance}</p>
        <PingButton />
        <AirDropButton setBalance={setBalance} />
      </div>
    </div>
  );
};

export default Home;
