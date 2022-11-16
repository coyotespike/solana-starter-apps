import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import * as fs from "fs";

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  findMetadataPda,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

const assetPath = "assets/timCoin.jpeg";

async function uploadFile(
  metaplex: Metaplex,
  { assetPath, name, symbol, description }: assetInfo
) {
  // file to buffer
  const buffer = fs.readFileSync(assetPath);

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "timCoin.jpeg");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: name,
    description: description,
    image: imageUri,
  });
  console.log("metadata uri:", uri);

  return uri;
}

type assetInfo = {
  assetPath: string;
  name: string;
  symbol: string;
  description: string;
};

async function createMetadataAccount(
  connection: web3.Connection,
  mint: web3.PublicKey,
  user: web3.Keypair,
  uri: string,
  assetInfo: assetInfo
) {
  // get metadata account address
  // this must be unique for each mint
  const metadataPDA = await findMetadataPda(mint);

  // onchain metadata format
  const tokenMetadata = {
    name: assetInfo.name,
    symbol: assetInfo.symbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );

  // send transaction
  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

  return transactionSignature;
}

async function createTokenMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  assetInfo: assetInfo
) {
  const uri = await uploadFile(metaplex, assetInfo);

  const transactionSignature = await createMetadataAccount(
    connection,
    mint,
    user,
    uri,
    assetInfo
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}
