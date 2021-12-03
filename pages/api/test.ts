// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getAuth, signInWithEmailAndPassword } from "@firebase/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { FireBase } from "../../firebase";

export async function handler(req: NextApiRequest, res: NextApiResponse<void>) {
  return res.status(404);
}
