import session from "../pages/api/session";
import { firebaseAdmin } from "./firebaseAdmin";
import nookies from "nookies";
import { GetServerSidePropsContext } from "next";

export async function getUserFromSession(ctx: GetServerSidePropsContext) {
  try {
    const cookies = nookies.get(ctx);
    const session = cookies.session || "";
    const credential = await firebaseAdmin
      .auth()
      .verifySessionCookie(session, true)
      .catch(() => null);
    if (!credential) throw new Error("not logged in");
    return await firebaseAdmin.auth().getUser(credential.uid);
  } catch {}
}
