import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { FlexCol } from "../component/flexBox";
import { login } from "../utils/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const loggin = async () => {
    try {
      await login(email, password);
      router.push("/");
    } catch {
      alert("no");
    }
  };
  const logOut = async () => {};
  return (
    <FlexCol id="login">
      <label>メールアドレス</label>
      <input type="email" onInput={(e) => setEmail(e.currentTarget.value)} />
      <label>パスワード</label>
      <input type="password" onInput={(e) => setPassword(e.currentTarget.value)} />
      <button onClick={loggin}>ログイン</button>
      <button onClick={logOut}>out</button>
    </FlexCol>
  );
};

export default Login;
