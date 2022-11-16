import { FC } from "react";
import { StudentIntro } from "../models/StudentIntro";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const STUDENT_INTRO_PROGRAM_ID = "HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf";

export const Form: FC = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // before we can use handleSubmit, we need to create a connection to the Solana network
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const studentIntro = new StudentIntro(name, message);
    handleTransactionSubmit(studentIntro);
  };

  const handleTransactionSubmit = async (studentIntro: StudentIntro) => {
    console.log(studentIntro.name, studentIntro.message);

    if (!publicKey) {
      alert("Wallet not connected");
      return;
    }
    const serializedStudentIntro = studentIntro.serialize();
    const transaction = new web3.Transaction();

    // once again we must figure out the address of the data account
    const [pda] = await web3.PublicKey.findProgramAddress(
      [publicKey.toBuffer()],
      new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID)
    );

    const instruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: pda, isSigner: false, isWritable: true },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
      data: serializedStudentIntro,
    });

    transaction.add(instruction);
    try {
      let txId = await sendTransaction(transaction, connection);
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txId}?cluster=devnet`
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
          <FormLabel color="gray.200">What do we call you?</FormLabel>
          <Input
            id="name"
            color="gray.400"
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">
            What brings you to Solana, friend?
          </FormLabel>
          <Textarea
            id="message"
            color="gray.400"
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};
