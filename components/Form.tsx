import { FC } from "react";
import { Movie } from "../models/Movie";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Textarea,
} from "@chakra-ui/react";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

/*

Unknown Program (CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN) Instruction
> Program logged: "process_instruction: CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN: 3 accounts, data=[0, 6, 0, 0, 0, 66, 97, 116, 109, 97, 110, 3, 25, 0, 0, 0, 97, 32, 100, 97, 114, 107, 101, 114, 44, 32, 103, 114, 105, 116, 116, 105, 101, 114, 32, 66, 97, 116, 109, 97, 110]"
> Program consumption: 176752 units remaining
> Program logged: "Initialize movie rating account"
> Program logged: "finding pda"
> Program logged: "pda: qp6Acy7sBPuN2EnTADBQiQCAvocUGj21LDYoKmvgR9E"
> Program logged: "initializing account at pda"
> Program invoked: System Program
  > Program returned success
> Program logged: "Movie: Batman"
> Program logged: "unpacking state account"
> Program logged: "borrowed account data"
> Program logged: "checking if user account is already initialized"
> Program logged: "serializing account"
> Program logged: "state account serialized"
> Program consumption: 151705 units remaining
> Program consumed: 48571 of 200000 compute units
  */

const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";

export const Form: FC = () => {
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  // before we can use handleSubmit, we need to create a connection to the Solana network
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const movie = new Movie(title, rating, message);
    handleTransactionSubmit(movie);
  };

  const handleTransactionSubmit = async (movie: Movie) => {
    if (!publicKey) {
      alert("Wallet not connected");
      return;
    }
    const buffer = movie.serialize();
    const transaction = new web3.Transaction();

    // generate the Program Derived Address, pda
    const [pda] = await web3.PublicKey.findProgramAddress(
      [publicKey.toBuffer(), new TextEncoder().encode(movie.title)],
      new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID)
    );

    const instruction = new web3.TransactionInstruction({
      keys: [
        // we pay
        { pubkey: publicKey, isSigner: true, isWritable: false },
        // we write to the pda
        { pubkey: pda, isSigner: false, isWritable: true },
        // the system program will be used to create the PDA
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
    });

    transaction.add(instruction);
    console.log("Sending transaction", transaction);
    try {
      let txid = await sendTransaction(transaction, connection);
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    } catch (error) {
      alert(JSON.stringify(error));
    }
  };

  return (
    <Box
      p={4}
      display={{ md: "flex" }}
      maxWidth="32rem"
      borderWidth={1}
      margin={2}
      justifyContent="center"
    >
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">Movie Title</FormLabel>
          <Input
            id="title"
            color="gray.400"
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">Add your review</FormLabel>
          <Textarea
            id="review"
            color="gray.400"
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">Rating</FormLabel>
          <NumberInput
            max={5}
            min={1}
            onChange={(valueString) => setRating(parseInt(valueString))}
          >
            <NumberInputField id="amount" color="gray.400" />
            <NumberInputStepper color="gray.400">
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Submit Review
        </Button>
      </form>
    </Box>
  );
};
