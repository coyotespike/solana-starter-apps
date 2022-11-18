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

async function getOrCreateAssociatedTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
): Promise<token.Account> {
  const tokenAddress = await token.getAssociatedTokenAddress(mint, owner);
  let account: token.Account;

  try {
    account = await token.getAccount(connection, tokenAddress);
  } catch (error) {
    console.log(`failed to get account: ${error}`);
    console.log(`creating account for ${tokenAddress}`);
    const tx = await token.createAssociatedTokenAccount(
      connection,
      payer,
      mint,
      owner
    );
  }
  account = await token.getAccount(connection, tokenAddress);
  console.log(
    `Token Account: https://explorer.solana.com/address/${account.address}?cluster=devnet`
  );

  return account;
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
    `Mint Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );

  return transactionSignature;
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

async function transferToMe(
  connection: web3.Connection,
  user: web3.Keypair,
  mint: web3.PublicKey,
  sendingTokenAccount: token.Account
) {
  // I copied this from my in-browser PHantom wallet
  const myWalletKey = new web3.PublicKey(
    "Gwb6adtXkJ3A311gxZ24vnRDXd1gS2JmYb4oS74F9ocz"
  );

  // we can only transfer tokens between token accounts from the same mint
  // to send to our wallet, therefore, we need to create a token account for our wallet
  const myTokenAccount = await createTokenAccount(
    connection,
    user, // payer haha
    mint,
    myWalletKey // the owner of the token account
  );

  // after transfer, it will show in our wallet.
  const transferToMe = await transferTokens(
    connection,
    user, // payer
    sendingTokenAccount.address, // from
    myTokenAccount.address, // destination
    user.publicKey, // owner...idk should it be me?
    10,
    mint
  );

  const myBalance = await connection.getBalance(user.publicKey);
  console.log(`My balance: ${myBalance}`);
}

export {
  burnTokens,
  createNewMint,
  createTokenAccount,
  getOrCreateAssociatedTokenAccount,
  mintTokens,
  transferTokens,
  transferToMe,
};
