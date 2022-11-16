import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

// Next three functions are CREATE in CRUD :)
async function createNewMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey,
  decimals: number
): Promise<web3.PublicKey> {
  const tokenMint = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  );

  return tokenMint;
}

async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
): Promise<token.Account> {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer, // can differ from owner, but be aware you must pay "rent"
    mint,
    owner
  );

  console.log(
    `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
  );

  return tokenAccount;
}

async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  authority: web3.Keypair,
  amount: number
) {
  const mintInfo = await token.getMint(connection, mint);

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority, // what is this?
    amount * 10 ** mintInfo.decimals
  );

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

// UPDATE in CRUD :)
async function transferTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  source: web3.PublicKey,
  destination: web3.PublicKey,
  owner: web3.PublicKey,
  amount: number,
  mint: web3.PublicKey
) {
  const mintInfo = await token.getMint(connection, mint);

  const transactionSignature = await token.transfer(
    connection,
    payer,
    source,
    destination,
    owner, // how is this different from destination?
    amount * 10 ** mintInfo.decimals
  );

  console.log(
    `Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

// delete in CRUD :)
async function burnTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  account: web3.PublicKey,
  mint: web3.PublicKey,
  owner: web3.Keypair,
  amount: number
) {
  const transactionSignature = await token.burn(
    connection,
    payer,
    account,
    mint,
    owner,
    amount
  );

  console.log(
    `Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  // const mint = await createNewMint(
  //   connection,
  //   user,
  //   user.publicKey,
  //   user.publicKey,
  //   2
  // );

  // const tokenAccount = await createTokenAccount(
  //   connection,
  //   user,
  //   mint, // is already a public key. and is the owner of the token account!
  //   user.publicKey
  // );

  // const tokens = await mintTokens(
  //   connection,
  //   user,
  //   mint,
  //   tokenAccount.address,
  //   user,
  //   100
  // );

  // const receiver = web3.Keypair.generate().publicKey;
  // const receiverTokenAccount = await createTokenAccount(
  //   connection,
  //   user, // I pay
  //   mint, // the mint factory of this token account
  //   receiver // the owner of the token account
  // );

  // const transfer = await transferTokens(
  //   connection,
  //   user,
  //   tokenAccount.address,
  //   receiverTokenAccount.address,
  //   user.publicKey,
  //   10,
  //   mint
  // );

  // const receiverBalance = await connection.getTokenAccountBalance(
  //   receiverTokenAccount.address
  // );
  // console.log(`Receiver balance: ${receiverBalance.value.uiAmount}`);

  const mint = new web3.PublicKey(
    "5n2PyML9sB6uMFuaursPxgZMLPmxYoSitJM4Qra5eb2J"
  );
  const tokenAddress = new web3.PublicKey(
    "EWbWSRgXcC3tRWbxbRPPsvdLtN7JpNZqBwiawVhfrJuB"
  );

  console.log("initiating transfer");

  // I copied this from my in-browser PHantom wallet
  const myWalletKey = new web3.PublicKey(
    "Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz"
  );

  // we can only transfer tokens between token accounts from the same mint
  // to send to our wallet, therefore, we need to create a token account for our wallet
  const myTokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    myWalletKey // the owner of the token account
  );

  // after transfer, it will show in our wallet.
  const transferToMe = await transferTokens(
    connection,
    user, // payer
    tokenAddress, // source
    myTokenAccount.address, // destination
    user.publicKey, // owner
    10,
    mint
  );

  const myBalance = await connection.getBalance(user.publicKey);
  console.log(`My balance: ${myBalance}`);

  const burn = await burnTokens(
    connection,
    user,
    tokenAddress,
    mint,
    user, // again idk what owner is here
    10
  );

  const tokenBalance = await connection.getTokenAccountBalance(tokenAddress);
  console.log(`Token balance: ${tokenBalance.value.uiAmount}`);
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
