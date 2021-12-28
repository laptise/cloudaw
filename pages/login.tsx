import { GetServerSideProps } from "next";
import { useRouter } from "next/dist/client/router";
import { setCookie } from "nookies";
import React, { RefAttributes, useEffect, useRef, useState } from "react";
import { getUserFromSession } from "../back/auth";
import { FlexCol } from "../component/flexBox";
import { login } from "../utils/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const loginButton = useRef<HTMLButtonElement>(null);
  const loggin = async (e: React.MouseEvent) => {
    const button = loginButton.current;
    try {
      if (button) button.disabled = true;
      await login(email, password);
      router.push("/");
    } catch {
      alert("no");
    } finally {
      if (button) button.disabled = false;
    }
  };
  const logOut = async () => {};
  useEffect(() => {}, []);
  return (
    <div id="loginWrapper">
      <FlexCol id="login">
        <div className="header">
          <h1>Enter Cloudaw</h1>
        </div>
        <FlexCol className="body">
          <label>メールアドレス</label>
          <input type="email" onInput={(e) => setEmail(e.currentTarget.value)} value={email} />
          <label>パスワード</label>
          <input type="password" onInput={(e) => setPassword(e.currentTarget.value)} value={password} />
          <button className="btn" ref={loginButton} onClick={(e) => loggin(e)}>
            ログイン
          </button>
          <button className="btn" onClick={logOut}>
            out
          </button>
        </FlexCol>
      </FlexCol>
    </div>
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
