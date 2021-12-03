// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getAuth, signInWithEmailAndPassword } from "@firebase/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { FireBase } from "../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  const auth = await FireBase.auth();
  try {
    const succed = await signInWithEmailAndPassword(auth, "laptise@live.jp", "Kk@K172988");
    res.status(200).json("test");
  } catch {
    res.status(200).json("failed");
  }
}
