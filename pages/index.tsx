import type { GetServerSideProps, NextPage } from "next";
import React, { createContext, useEffect, useRef, useState } from "react";
import { FlexCol, FlexRow } from "../component/flexBox";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FireBase } from "../firebase";
import { collection, doc, setDoc, query, where, getDocs, addDoc, getFirestore, onSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import Layout from "../component/Layout";
import nookies from "nookies";
import Link from "next/link";
import { firebaseAdmin } from "../back/firebaseAdmin";
import { getUserFromSession } from "../back/auth";
import { toObject } from "../utils";
import { clone, CollaboratorEntity, getCollabColRef, getProjectsColRef, ProjectEntity } from "../firebase/model";
import { db } from "../db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
interface PjtProps {
  pjtState: State<QueryDocumentSnapshot<ProjectEntity>[]>;
}
interface Props {
  project: QueryDocumentSnapshot<ProjectEntity>;
}
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const ProjectOverView: React.FC<Props> = ({ project }) => {
  const { name } = project.data();
  const [size, setSize] = useState<string>();
  const collaboratorsRef = useRef(getCollabColRef(project.ref));
  const [collaborators, setCoolaborators] = useState<QueryDocumentSnapshot<CollaboratorEntity>[]>();
  const getSize = async () => {
    const res = await db.wavs.where("projectId").equals(project.id).toArray();
    const bytes = res.reduce((size, x) => size + x.buffer.byteLength, 0);
    setSize(formatBytes(bytes));
  };

  const deleteAllFiles = async () => {
    const res = await db.wavs.where("projectId").equals(project.id).toArray();
    if (res.length === 0) return;
    else if (
      confirm(`${res.length}個の音源ファイルがデバイスから削除されます。よろしいですか？\nプロジェクトからの削除を意味するものではありません`)
    ) {
      const ids = res.map((x) => x.id);
      await Promise.all(ids.map((id) => db.wavs.delete(id)));
      await getSize();
    }
  };
  const attachListener = () => {
    return onSnapshot(collaboratorsRef.current, (snapshot) => {
      setCoolaborators(snapshot.docs);
    });
  };
  useEffect(() => {
    getSize();
    return attachListener();
  }, []);
  return (
    <FlexCol className="singleProject">
      <FlexRow className="header">
        {name}
        <FlexRow style={{ marginLeft: "auto", gap: 10 }}>
          {collaborators?.map((collaborator) => (
            <div key={collaborator.id}>{collaborator.data().displayName}</div>
          ))}
        </FlexRow>
      </FlexRow>
      <FlexCol className="projectInfo">
        <FlexRow className="singleDetail">
          <span>デバイスに保存されている容量</span>
          <span>{size}</span>
          <button onClick={deleteAllFiles}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </FlexRow>
      </FlexCol>
      <Link href={`/project/${project.id}`} passHref>
        <button>開く</button>
      </Link>
    </FlexCol>
  );
};

const SelectProject: React.FC<PjtProps> = ({ pjtState }) => {
  const [pjtList] = pjtState;
  return (
    <FlexCol id="selectProject" style={{ width: "100%" }}>
      {pjtList.map((pjt, index) => (
        <ProjectOverView project={pjt} key={index} />
      ))}
    </FlexCol>
  );
};

const NewProject: React.FC<PjtProps> = ({ pjtState }) => {
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
    const newRef = await addDoc(projectRef, newProject);
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
  const pjtListState = useState<QueryDocumentSnapshot<ProjectEntity>[]>([] as any[]);
  const [owning, setOwning] = useState<QueryDocumentSnapshot<ProjectEntity>[]>();
  const [collaborating, setCollaborating] = useState<QueryDocumentSnapshot<ProjectEntity>[]>();
  const [pjtList, setPjtList] = pjtListState;
  const [isNew, setIsNew] = useState(false);
  const getList = async () => {
    FireBase.init();
    const pjtRef = getProjectsColRef();
    const { uid } = user;
    if (uid) {
      const q = query(pjtRef, where("owner", "==", uid));
      const owning = await getDocs(q).then((res) => res.docs);

      const q2 = query(pjtRef, where("collaborator", "array-contains", uid));
      const coling = await getDocs(q2).then((res) => res.docs);

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
            {isNew ? <NewProject pjtState={pjtListState} /> : <SelectProject pjtState={pjtListState} />}
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
