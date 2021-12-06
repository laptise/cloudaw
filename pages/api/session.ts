import type { NextApiRequest, NextApiRequest as Req, NextApiResponse, NextApiResponse as Res } from "next";

import { parseCookies, setCookie } from "nookies";
import { firebaseAdmin } from "../../back/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  // "POST"以外は、"404 Not Found"を返す
  if (req.method !== "POST") return res.status(404).send("Not Found");
  console.log(111);
  const auth = firebaseAdmin.auth();

  // Tokenの有効期限
  const expiresIn = 60 * 60 * 3 * 1 * 1000; // 5日

  // セッションCookieを作成するためのIDを取得
  const id = (JSON.parse(req.body).id || "").toString();

  // Cookieに保存するセッションIDを作成する
  const sessionCookie = await auth.createSessionCookie(id, { expiresIn });
  // Cookieのオプション
  const options = {
    maxAge: expiresIn,
    httpOnly: true,
    // secure: true,
    path: "/",
  };
  // セッションIDをCookieに設定する
  // res.setHeader("Set-Cookie", `session=${sessionCookie};path='/';maxAge=${expiresIn};httpOnly;`);
  setCookie({ res }, "session", sessionCookie, options);
  // res.redirect("/");
  res.end("ok");
}
