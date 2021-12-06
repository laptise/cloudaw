import { GetServerSideProps } from "next";
import { useRouter } from "next/dist/client/router";
import { setCookie } from "nookies";
import React, { RefAttributes, useEffect, useState } from "react";
import { getUserFromSession } from "../back/auth";
import { FlexCol } from "../component/flexBox";
import { login } from "../utils/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const loggin = async (e: React.MouseEvent) => {
    try {
      await login(email, password);
      router.push("/");
    } catch {
      alert("no");
    }
  };
  const logOut = async () => {};
  useEffect(() => {}, []);
  return (
    <FlexCol id="login">
      <label>メールアドレス</label>
      <input type="email" onInput={(e) => setEmail(e.currentTarget.value)} value={email} />
      <label>パスワード</label>
      <input type="password" onInput={(e) => setPassword(e.currentTarget.value)} value={password} />
      <button onClick={(e) => loggin(e)}>ログイン</button>
      <button onClick={logOut}>out</button>
    </FlexCol>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await getUserFromSession(ctx);
  console.log(user);
  if (!user) return { props: {} };
  else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
export default Login;
