import type { GetServerSideProps, NextPage } from "next";
import React, { createContext, useEffect, useState } from "react";
import { FlexCol, FlexRow } from "../component/flexBox";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FireBase } from "../firebase";
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import Layout, { UserProps } from "../component/Layout";
import { login } from "../utils/auth";
import { useRouter } from "next/dist/client/router";
import nookies from "nookies";
import { firebaseAdmin } from "../back/firebaseAdmin";
interface PjtProps {
  pjtList: any[];
}

const SelectProject = ({ pjtList }: PjtProps) => {
  return (
    <FlexCol>
      {pjtList.map((pjt, index) => (
        <span key={index}>{pjt["name"]}</span>
      ))}
    </FlexCol>
  );
};

const NewProject = () => {
  const [pjtNm, setPjtNm] = useState("");
  const addNewProject = async () => {
    const db = await FireBase.fireStore();
    const docRef = doc(db, "project", pjtNm);
    const uid = getAuth().currentUser?.uid as string;
    await setDoc(docRef, {
      owner: uid,
      name: pjtNm,
    });
  };
  return (
    <FlexCol id="settingForNew">
      <FlexCol>
        プロジェクト名
        <input onInput={(e) => setPjtNm(e.currentTarget.value)} />
      </FlexCol>
      <button onClick={addNewProject}>作成</button>
    </FlexCol>
  );
};

interface Props {
  userName: string;
}

const Dashboard = ({ user }: UserProps) => {
  const [pjtList, setPjtList] = useState([] as any[]);
  const [isNew, setIsNew] = useState(false);
  const getList = async () => {
    const db = await FireBase.fireStore();
    const pjtRef = collection(db, "project");
    const uid = getAuth().currentUser?.uid as string;
    const q = query(pjtRef, where("owner", "==", uid));
    const res = await getDocs(q)
      .then((res) => res.docs)
      .then((docs) => docs.map((x) => x.data()));
    setPjtList(res);
  };
  useEffect(() => {
    getList();
  }, []);
  return (
    <Layout user={user}>
      <div id="dashboard">
        <FlexCol className="window">
          <FlexCol className="header">
            <span>プロジェクトを選択してください</span>
          </FlexCol>
          <FlexRow className="body content">
            <FlexCol className="modeSelect">
              <button onClick={() => setIsNew(false)}>既存のプロジェクト</button>
              <button onClick={() => setIsNew(true)}>新規のプロジェクト</button>
            </FlexCol>
            {isNew ? <NewProject /> : <SelectProject pjtList={pjtList} />}
          </FlexRow>
        </FlexCol>
      </div>
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
  // Pass data to the page via props

  if (user?.email) return { props: { userName: user.email } };
  else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};

export default Dashboard;
