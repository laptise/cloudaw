import type { GetServerSideProps, NextPage } from "next";
import React, { createContext, useEffect, useState } from "react";
import { FlexCol, FlexRow } from "../component/flexBox";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FireBase } from "../firebase";
import { collection, doc, setDoc, query, where, getDocs, addDoc, getFirestore, onSnapshot } from "firebase/firestore";
import Layout from "../component/Layout";
import nookies from "nookies";
import Link from "next/link";
import { firebaseAdmin } from "../back/firebaseAdmin";
import { getUserFromSession } from "../back/auth";
import { toObject } from "../utils";
import { clone, getProjectsColRef, ProjectEntity } from "../firebase/model";
interface PjtProps {
  pjtList: ProjectEntity[];
  setPjtList(list: ProjectEntity[]): void;
}

const SelectProject: React.FC<PjtProps> = ({ pjtList }) => {
  return (
    <FlexCol id="selectProject" style={{ width: "100%" }}>
      {pjtList.map((pjt, index) => (
        <Link href={`/project/${pjt.id}`} passHref key={index}>
          <div className="singleProject">{pjt["name"]}</div>
        </Link>
      ))}
    </FlexCol>
  );
};

const NewProject: React.FC<PjtProps> = ({ pjtList, setPjtList }) => {
  const [pjtNm, setPjtNm] = useState("");
  const addNewProject = async () => {
    const uid = getAuth().currentUser?.uid as string;
    const projectRef = await getProjectsColRef();
    const newProject = (() => {
      const newPjt = new ProjectEntity();
      newPjt.owner = uid;
      newPjt.name = pjtNm;
      newPjt.trackList = [];
      return newPjt;
    })();
    newProject.id = await addDoc(projectRef, newProject).then((ref) => ref.id);

    setPjtList([...pjtList, newProject]);
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

const Dashboard = ({ user }: UserProps) => {
  const [pjtList, setPjtList] = useState([] as any[]);
  const [isNew, setIsNew] = useState(false);
  const getList = async () => {
    FireBase.init();
    const pjtRef = getProjectsColRef();
    const { uid } = user;
    if (uid) {
      const q = query(pjtRef, where("owner", "==", uid));
      const owning = await getDocs(q)
        .then((res) => res.docs)
        .then((docs) =>
          docs.map((x) => {
            const data = x.data();
            data.id = x.id;
            return data;
          })
        );
      const q2 = query(pjtRef, where("collaborator", "array-contains", uid));
      const coling = await getDocs(q2)
        .then((res) => res.docs)
        .then((docs) =>
          docs.map((x) => {
            const data = x.data();
            data.id = x.id;
            return data;
          })
        );
      console.log(coling);
      setPjtList([...owning, ...coling]);
    }
  };
  useEffect(() => {
    console.log("index");
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
            {isNew ? <NewProject setPjtList={setPjtList} pjtList={pjtList} /> : <SelectProject setPjtList={setPjtList} pjtList={pjtList} />}
          </FlexRow>
        </FlexCol>
      </div>
    </Layout>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<UserProps> = async (ctx) => {
  console.log("indexed");
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
