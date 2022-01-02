import type { GetServerSideProps, NextPage } from "next";
import React, { createContext, useEffect, useRef, useState, useContext } from "react";
import { FlexCol, FlexRow } from "../component/flexBox";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FireBase } from "../firebase";
import { Skeleton } from "@mui/material";
import {
  QueryDocumentSnapshot,
  QuerySnapshot,
  DocumentSnapshot,
  onSnapshot,
  addDoc,
  doc,
  query,
  where,
  getDocs,
  DocumentReference,
} from "firebase/firestore";
import Layout from "../component/Layout";
import nookies from "nookies";
import Link from "next/link";
import { firebaseAdmin } from "../back/firebaseAdmin";
import { getUserFromSession } from "../back/auth";
import { toObject } from "../utils";
import {
  clone,
  CollaboratorEntity,
  getCollabColRef,
  getProjectDocRef,
  getProjectsColRef,
  getUserInfoDocRef,
  getUserProjectColRef,
  ProjectConverter,
  ProjectEntity,
  UserInfoEntity,
  UserProjectEntity,
} from "../firebase/firestore";
import { db } from "../db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { utls } from "../utils/utls";

interface PjtProps {
  pjtState: State<QueryDocumentSnapshot<ProjectEntity>[]>;
  uPjtState: State<QuerySnapshot<UserProjectEntity>>;
}

interface Props {
  uPjt: UserProjectEntity;
}

const AuthContext = createContext<AuthContext>(null as unknown as AuthContext);

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const Project: React.FC<{ project: DocumentSnapshot<ProjectEntity> }> = ({ project }) => {
  const [size, setSize] = useState<string>();
  const collaboratorsRef = useRef(getCollabColRef(project.ref));
  const [collaborators, setCoolaborators] = useState<QueryDocumentSnapshot<CollaboratorEntity>[]>();
  const getSize = async () => {
    const res = await db.wavs.where("projectId").equals(project.id).toArray();
    const bytes = res.reduce((size, x) => size + x.linear.byteLength, 0);
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
    const collabs = onSnapshot(collaboratorsRef.current, (snapshot) => {
      setCoolaborators(snapshot.docs);
    });
    return collabs;
  };
  useEffect(() => {
    getSize();
    return attachListener();
  }, []);

  return (
    <FlexCol className="singleProject">
      <FlexRow className="header">
        {project?.data()?.name}
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
const ProjectOverView: React.FC<Props> = ({ uPjt }) => {
  const [project, setProject] = useState<DocumentSnapshot<ProjectEntity>>();
  const attachListener = () => {
    const pjt = onSnapshot(uPjt.projectRef, (snapshot) => {
      setProject(snapshot);
    });
    return pjt;
  };

  useEffect(() => attachListener(), []);
  return project ? (
    <Project project={project} />
  ) : (
    <FlexCol className="singleProject">
      <FlexRow className="header">
        <Skeleton variant="text" width="30%" />
        <FlexRow style={{ marginLeft: "auto", gap: 10 }}>
          <Skeleton variant="text" width="50%" />
        </FlexRow>
      </FlexRow>
      <FlexCol className="projectInfo">
        <FlexRow className="singleDetail">
          <Skeleton variant="text" width="100%" />
        </FlexRow>
      </FlexCol>
      <Skeleton variant="text" width={200} />
    </FlexCol>
  );
};

const SelectProject: React.FC = () => {
  const { uPjtStates } = useContext(AuthContext);
  const [uPjt] = uPjtStates;
  const [pjtList, setPjtList] = useState<UserProjectEntity[]>();
  useEffect(() => {
    if (uPjt?.docs) {
      setPjtList(uPjt?.docs?.map((x) => x.data()));
    }
  }, []);
  return (
    <FlexCol id="selectProject" style={{ width: "100%" }}>
      {pjtList?.map((pjt, index) => (
        <ProjectOverView uPjt={pjt} key={index} />
      ))}
    </FlexCol>
  );
};

interface NewPrjProp {
  isNewState: State<boolean>;
}

const NewProject: React.FC<NewPrjProp> = ({ isNewState }) => {
  const { user, uPjtStates, userRef } = useContext(AuthContext);
  const [isNew, setIsNew] = isNewState;
  const [pjtNm, setPjtNm] = useState("");

  async function addNewProject() {
    await utls.project.addProject(userRef, user, pjtNm);
    setIsNew(false);
  }

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
  const userProjectEntityListState = useState<QuerySnapshot<UserProjectEntity>>([] as any);
  const [uPjtEntities, setUPjtEntities] = userProjectEntityListState;
  const [userInfo, setUserInfo] = useState<DocumentReference<UserInfoEntity>>(null as any);
  const isNewState = useState(false);
  const [isNew, setIsNew] = isNewState;
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

  const attach = () => {
    const userInfoDocRef = getUserInfoDocRef(user.uid);
    const userProjectColRef = getUserProjectColRef(userInfoDocRef);
    const userInfo = onSnapshot(userInfoDocRef, (snapshot) => {
      setUserInfo(snapshot.ref);
    });
    const userProjects = onSnapshot(userProjectColRef, (snapshot) => {
      setUPjtEntities(snapshot);
    });
    return () => [userInfo, userProjects].forEach((x) => x());
  };

  const authContextInit: AuthContext = { user, uPjtStates: userProjectEntityListState, userRef: userInfo };

  useEffect(() => {
    // getList();
    return attach();
  }, []);
  return (
    <AuthContext.Provider value={authContextInit}>
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
              {isNew ? <NewProject isNewState={isNewState} /> : <SelectProject />}
            </FlexRow>
          </FlexCol>
        </div>
      </Layout>
    </AuthContext.Provider>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<UserProps> = async (ctx) => {
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
