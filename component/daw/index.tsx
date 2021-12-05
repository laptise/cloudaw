import React, { createContext, useContext, useEffect, useState } from "react";
import { FlexRow } from "../flexBox";
import Head from "next/head";
import { getProjectsColRef, getProjectDocRef, getTracksColRef, Project, Track } from "../../firebase/model";
import TopPannel from "./topPannel";
import Score from "./score";
import AddNewTrackModal from "./modal/addNewTrack";
import { doc, DocumentReference, onSnapshot, QueryDocumentSnapshot } from "@firebase/firestore";
import Layout, { UserProps } from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faHome } from "@fortawesome/free-solid-svg-icons";
import SettingModal from "./modal/setting";
import Link from "next/link";
export interface ProjectProp extends UserProps {
  project: Project;
}

interface DawContext extends UserProps {
  projectState: State<Project>;
  tracksState: State<QueryDocumentSnapshot<Track>[]>;
  projectRef: DocumentReference<Project>;
}

interface ModalViewContext {
  settingModalViewState: State<boolean>;
  newTrackModalViewState: State<boolean>;
}

export const DawContext = createContext<DawContext>(null as any);
export const ModalViewContext = createContext<ModalViewContext>(null as any);
const keyPair: any = {};

const Daw: React.FC<ProjectProp> = ({ project, user }) => {
  const { settingModalViewState } = useContext(ModalViewContext);
  const [settingModalView, setSettingModalView] = settingModalViewState;
  return (
    <>
      <AddNewTrackModal />
      <SettingModal />
      <header>
        <div style={{ display: "flex", gap: 5 }}>
          <Link href="/" passHref>
            <button>
              <FontAwesomeIcon icon={faHome} />
            </button>
          </Link>
          <span>|</span>
          {project.name}
        </div>
        <button onClick={() => setSettingModalView(true)}>
          <FontAwesomeIcon icon={faCog} />
        </button>
      </header>
      <Head>
        <title>{project.name}</title>
      </Head>
      <div id="playBackCtl"></div>
      <FlexRow className="centerRow">
        <TopPannel />
        <Score />
      </FlexRow>
    </>
  );
};

const DawProvider: React.FC<ProjectProp> = (props) => {
  const { project, user } = props;
  const projectState = useState(project);
  const newTrackModalViewState = useState(false);
  const tracksState = useState([] as QueryDocumentSnapshot<Track>[]);
  const settingModalViewState = useState(false);
  const context = useContext(DawContext);
  const attach = async () => {
    const projectColRef = getProjectsColRef();
    const projectRef = doc(projectColRef, project.id as string);
    const tracksColRef = getTracksColRef(projectRef);
    onSnapshot(projectRef, (doc) => {
      const [pjt, setPjt] = projectState;
      const data = doc.data();
      if (data) setPjt(data);
    });
    onSnapshot(tracksColRef, (snapshot) => {
      const [val, setVal] = tracksState;
      const tracks = snapshot.docs;
      setVal(tracks);
      console.log(tracks);
    });
  };
  const keyBind = () => {
    document.onkeydown = (e) => (keyPair[e.key] = true);
    document.onkeyup = (e) => (keyPair[e.key] = false);
  };
  useEffect(() => {
    attach();
    keyBind();
  }, []);
  return (
    <main id="daw">
      <ModalViewContext.Provider value={{ settingModalViewState, newTrackModalViewState }}>
        <DawContext.Provider value={{ user, tracksState, projectState, projectRef: getProjectDocRef(getProjectsColRef(), project.id as string) }}>
          <Daw {...props} />
        </DawContext.Provider>
      </ModalViewContext.Provider>
    </main>
  );
};

export default DawProvider;
