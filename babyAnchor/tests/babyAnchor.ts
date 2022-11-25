import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { BabyAnchor } from "../target/types/baby_anchor";

describe("babyAnchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.BabyAnchor as Program<BabyAnchor>;
  const counter = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counter.publicKey,
      })
      .signers([counter]) // i think without this, we sign with the provider or something but the check demans the same account
      .rpc();
    console.log("Your transaction signature", tx);
  });
  it("Increments!", async () => {
    // Add your test here.
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counter.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
  it("Decrements!", async () => {
    // Add your test here.
    const tx = await program.methods
      .decrement()
      .accounts({
        counter: counter.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
