// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getAuth, signInWithEmailAndPassword } from "@firebase/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { FireBase } from "../../firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  await FireBase.init();
  const auth = await FireBase.auth();
  const name = auth.currentUser?.email;
  console.log();
  if (name) res.status(200).json(name);
  else res.status(200).json("no");
}
