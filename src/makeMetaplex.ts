import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";

import * as web3 from "@solana/web3.js";

const makeMetaplex = async (
  connection: web3.Connection,
  user: web3.Keypair
) => {
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

  return metaplex;
};

export default makeMetaplex;
