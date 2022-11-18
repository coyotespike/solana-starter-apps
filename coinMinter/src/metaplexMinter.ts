import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  NftWithToken,
} from "@metaplex-foundation/js";
import * as fs from "fs";

import { initializeKeypair } from "./initializeKeypair";
import makeMetaplex from "./makeMetaplex";
import { assetInfo, uploadFile } from "./tokenMetadata";

const tokenName = "Tim face";
const description = "My beautiful face";
const symbol = "TIMFACE";
const sellerFeeBasisPoints = 100;
const imageFile = "assets/timCoin.jpeg";

/**
Clearly, this demo is all prior art

with the exception of createNFT below.

image uri: https://arweave.net/D8WSCq4Jf3I-6HHXap465ChTosreBFYXLYZcSioO8RQ
metadata uri: https://arweave.net/iN7bGZLCTABiPPh0H7lNNhyRPeGY7T5u52MHzJKSU20
Token Mint: https://explorer.solana.com/address/HqgXfA31RQodsTmkAENpNj49xBx48qz75irz5X3jU5sF?cluster=devnet

What's fun is the explorer link above is special! Unlike the other Mints we have made, this special Metaplex mint immediately shows the uploaded asset.
   **/

// create NFT
async function createNft(
  metaplex: Metaplex,
  uri: string,
  tokenInfo: assetInfo
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create({
    uri: uri,
    name: tokenInfo.name,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
    symbol: tokenInfo.symbol,
  });

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );

  return nft;
}

// you have to update the uri first, remember
// still, pleasingly simple as it keeps the same mint address!
async function updateNft(
  metaplex: Metaplex,
  mintAddress: PublicKey,
  uri: string,
  tokenInfo: assetInfo
) {
  // get "NftWithToken" type from mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // omit any fields to keep unchanged
  await metaplex.nfts().update({
    nftOrSft: nft,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    uri: uri,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
  });

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const metaplex = await makeMetaplex(connection, user);

  const assetPackage: assetInfo = {
    assetPath: "assets/austin.jpeg",
    name: tokenName,
    symbol: symbol,
    description: description,
  };

  const uri = await uploadFile(metaplex, {
    ...assetPackage,
    assetPath: "assets/timCoin.jpeg",
  });
  // const nft = await createNft(metaplex, uri, assetPackage);
  const mintAddress = new web3.PublicKey(
    "HqgXfA31RQodsTmkAENpNj49xBx48qz75irz5X3jU5sF"
  );
  await updateNft(metaplex, mintAddress, uri, assetPackage);
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
