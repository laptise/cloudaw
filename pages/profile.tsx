import { GetServerSideProps, NextPage } from "next";
import Layout from "../component/Layout";
import nookies from "nookies";
import { firebaseAdmin } from "../back/firebaseAdmin";
import { FormEvent, useState } from "react";
import { FireBase } from "../firebase";
import { updateProfile } from "@firebase/auth";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { toObject } from "../utils";
import { logout } from "../utils/auth";
import { useRouter } from "next/dist/client/router";

interface Props extends UserProps {
  user: UserRecord;
}
const Profile: NextPage<Props> = ({ user }) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const auth = FireBase.auth();
    if (auth.currentUser) updateProfile(auth.currentUser, { displayName });
  };
  const logOut = async () => {
    await logout();
    router.push("/");
  };
  return (
    <Layout id="profile" user={user}>
      <form onSubmit={onSubmit}>
        ニックネーム
        <input value={displayName} onInput={(e) => setDisplayName(e.currentTarget.value)} />
        <button type="submit">更新</button>
        <button onClick={() => logOut()} type="button">
          ログアウト
        </button>
      </form>
    </Layout>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const cookies = nookies.get(ctx);
  const session = cookies.session || "";
  // セッションIDを検証して、認証情報を取得する
  const user = await firebaseAdmin
    .auth()
    .verifySessionCookie(session, true)
    .catch(() => null);
  if (user) {
    const uid = user.uid;
    const current = await firebaseAdmin.auth().getUser(uid);
    console.log(current);
    return { props: { user: toObject(current), userName: current.displayName || "" } };
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};

export default Profile;
