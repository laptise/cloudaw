// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { auth } from "firebase-admin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import type { NextApiRequest, NextApiResponse } from "next";
import { toObject } from "../../../../utils";

type Data = {
  name: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<UserRecord>) {
  console.log(11);
  try {
    const email = req.query.email as string;
    const user = await auth().getUserByEmail(email).then(toObject);
    console.log(user);
    res.status(200).json(user);
  } catch {
    console.log(11);
    res.status(503).end();
  } finally {
  }
}
