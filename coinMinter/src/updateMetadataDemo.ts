import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";

import { updateTokenDescription } from "./tokenMetadata";

const assetPath = "assets/timCoin.jpeg";

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  const assetInfo = {
    assetPath,
    name: "TimCoin",
    symbol: "TIM",
    description:
      "TimCoin is an awesome cryptocurrency created by Tim, with a rad logo",
  };

  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // this is from the first time I ran the code
  const MINT_ADDRESS = "5n2PyML9sB6uMFuaursPxgZMLPmxYoSitJM4Qra5eb2J";
  const mint = new web3.PublicKey(MINT_ADDRESS);

  const txSignature = await updateTokenDescription(
    connection,
    metaplex,
    mint,
    user,
    assetInfo
  );
}

export default main;
