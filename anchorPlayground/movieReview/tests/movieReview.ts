import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect, assert } from "chai";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { MovieReview } from "../target/types/movie_review";

describe("movieReview", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MovieReview as Program<MovieReview>;
  const movie = {
    title: "The Matrix",
    description: "Keanu Reeves fights the machines in the Matrix",
    rating: 5,
  };
  const [movie_pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    program.programId
  );
  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  xit("Initializes the mint maybe", async () => {
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey
    );

    const tx = await program.methods
      .createRewardMint("fakeUri", "tim", "TIM")
      .accounts({
        rewardMint: mint,
        metadata: tokenAccount,
        tokenMetadataProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

  it("Initializes the reward token", async () => {
    const tx = await program.methods
      .initializeTokenMint()
      .accounts({
        mint,
      })
      .rpc();
  });

  it("Adds a movie review", async () => {
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey
    );
    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        movieReview: movie_pda,
        rewardMint: mint,
        tokenAccount,
      })
      .rpc();

    const account = await program.account.movieAccountState.fetch(movie_pda);
    expect(account.title).to.equal(movie.title);
    expect(account.description).to.equal(movie.description);
    expect(account.rating).to.equal(movie.rating);
    expect(account.reviewer).to.eql(provider.wallet.publicKey);

    const tokens = await getAccount(provider.connection, tokenAccount);
    expect(tokens.amount).to.equal(10000000n);
  });

  it("Updates a movie review", async () => {
    const tx = await program.methods
      .updateMovieReview(movie.title, "the first one was the best though", 1)
      .accounts({
        movieReview: movie_pda,
      })
      .rpc();

    const account = await program.account.movieAccountState.fetch(movie_pda);
    expect(movie.title).to.eq(account.title);
    expect(account.rating).to.eq(1);
    expect(account.description).to.eq("the first one was the best though");
    expect(account.reviewer).to.eql(provider.wallet.publicKey);
  });

  it("Close a movie review", async () => {
    const tx = await program.methods
      .closeMovieReview()
      .accounts({
        movieReview: movie_pda,
      })
      .rpc();

    try {
      await program.account.movieAccountState.fetch(movie_pda);
    } catch (err) {
      // the error message includes the account address
      expect(err.message).to.have.string("Account does not exist");
    }
  });
});
