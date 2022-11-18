import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";

import makeMetaplex from "./makeMetaplex";

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";

import { createTokenMetadata } from "./tokenMetadata";

const assetPath = "assets/timCoin.jpeg";

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const metaplex = await makeMetaplex(connection, user);

  const assetInfo = {
    assetPath,
    name: "TimCoin",
    symbol: "TIM",
    description: "TimCoin is a cryptocurrency created by Tim",
  };

  // this is from the first time I ran the code
  const MINT_ADDRESS = "5n2PyML9sB6uMFuaursPxgZMLPmxYoSitJM4Qra5eb2J";
  const mint = new web3.PublicKey(MINT_ADDRESS);

  const metadata = await createTokenMetadata(
    connection,
    metaplex,
    mint,
    user,
    assetInfo
  );
}

export default main;
