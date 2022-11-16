import { Card } from "./Card";
import { FC, useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
import { StudentIntro } from "../models/StudentIntro";

const STUDENT_INTRO_PROGRAM_ID = "HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf";

export const StudentIntroList: FC = () => {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const [studentIntros, setStudentIntros] = useState<StudentIntro[]>([]);

  useEffect(() => {
    // setStudentIntros(StudentIntro.mocks)
    connection
      .getProgramAccounts(new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID))
      .then(async (accounts) => {
        const students: StudentIntro[] = accounts.reduce(
          (accum: StudentIntro[], { pubkey, account }) => {
            const student = StudentIntro.deserialize(account.data);
            if (!student) {
              return accum;
            } else {
              return [...accum, student];
            }
          },
          []
        );
        setStudentIntros(students);
      });
  }, []);

  return (
    <div>
      {studentIntros.map((studentIntro, i) => (
        <Card key={i} studentIntro={studentIntro} />
      ))}
    </div>
  );
};
