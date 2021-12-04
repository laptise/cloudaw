import type { GetServerSideProps, NextPage } from "next";
import React, { createContext, useEffect, useState } from "react";
import { FlexCol, FlexRow } from "../component/flexBox";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FireBase } from "../firebase";
import { collection, doc, setDoc, query, where, getDocs, addDoc, getFirestore } from "firebase/firestore";
import Layout, { CommonProps } from "../component/Layout";
import nookies from "nookies";
import Link from "next/link";
import { firebaseAdmin } from "../back/firebaseAdmin";
import { getUserFromSession } from "../back/auth";
import { toObject } from "../utils";
import { clone } from "../firebase/model";
interface PjtProps {
  pjtList: any[];
}

const SelectProject = ({ pjtList }: PjtProps) => {
  return (
    <FlexCol>
      {pjtList.map((pjt, index) => (
        <Link href={`/project/${pjt.id}`} passHref key={index}>
          <span>{pjt["name"]}</span>
        </Link>
      ))}
    </FlexCol>
  );
};

const NewProject = () => {
  const [pjtNm, setPjtNm] = useState("");
  const addNewProject = async () => {
    const db = await FireBase.fireStore();
    const docRef = collection(db, "project");
    const uid = getAuth().currentUser?.uid as string;
    await addDoc(docRef, {
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

const Dashboard = ({ user }: CommonProps) => {
  const [pjtList, setPjtList] = useState([] as any[]);
  const [isNew, setIsNew] = useState(false);
  const getList = async () => {
    await FireBase.init();
    const db = getFirestore();
    const pjtRef = collection(db, "project");
    const { uid } = user;
    console.log(uid);
    if (uid) {
      const q = query(pjtRef, where("owner", "==", uid));
      const res = await getDocs(q)
        .then((res) => res.docs)
        .then((docs) =>
          docs.map((x) => {
            const data = x.data();
            data.id = x.id;
            return data;
          })
        );
      setPjtList(res);
    }
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
export const getServerSideProps: GetServerSideProps<CommonProps> = async (ctx) => {
  const user = await getUserFromSession(ctx);
  if (user) return { props: { user: toObject(user) } };
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
