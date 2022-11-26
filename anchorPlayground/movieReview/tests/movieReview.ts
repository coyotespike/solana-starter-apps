import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
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

  it("Adds a movie review", async () => {
    // movieReview because we have pub movie_review in the method validation
    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        movieReview: movie_pda,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
