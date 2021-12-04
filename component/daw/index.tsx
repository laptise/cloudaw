import { channel } from "diagnostics_channel";
import React, { createContext, useContext, useEffect, useState } from "react";
import { FlexRow } from "../flexBox";
import Head from "next/head";
import { getProjectColRef, getProjectDocRef, getTrackRef, Project, Track } from "../../firebase/model";
import TopPannel from "./topPannel";
import Score from "./score";
import AddNewTrackModal from "./modal/addNewTrack";
import { doc, DocumentReference, getDoc, getFirestore, onSnapshot } from "@firebase/firestore";
import { FireBase } from "../../firebase";

export interface ProjectProp {
  project: Project;
}

interface DawContext {
  projectState: [Project, (val: Project) => void];
  tracksState: [Track[], (val: Track[]) => void];
  addNewModalViewState: [boolean, (value: boolean) => void];
  projectRef: DocumentReference<Project>;
}

const dawContextinit = {
  viewAddNewTrackModal: false,
};

export const DawContext = createContext<DawContext>(null as any);

const Daw: React.FC<ProjectProp> = ({ project }) => {
  const projectState = useState(project);
  const addNewModalViewState = useState(false);
  const tracksState = useState([] as Track[]);
  const context = useContext(DawContext);
  const attach = async () => {
    const projectColRef = getProjectColRef();
    const projectRef = doc(projectColRef, project.id as string);
    const tracksColRef = getTrackRef(projectRef);
    onSnapshot(projectRef, (doc) => {
      const [pjt, setPjt] = projectState;
      const data = doc.data();
      if (data) setPjt(data);
    });
    onSnapshot(tracksColRef, (snapshot) => {
      const [val, setVal] = tracksState;
      const tracks = snapshot.docs.map((x) => x.data());
      setVal(tracks);
      console.log(tracks);
    });
  };
  useEffect(() => {
    attach();
  }, []);
  return (
    <>
      <Head>
        <title>{project.name}</title>
      </Head>
      <DawContext.Provider
        value={{ addNewModalViewState, tracksState, projectState, projectRef: getProjectDocRef(getProjectColRef(), project.id as string) }}
      >
        <div id="daw">
          <AddNewTrackModal />
          <div id="playBackCtl"></div>
          <FlexRow className="centerRow">
            <TopPannel />
            <Score />
          </FlexRow>
        </div>
      </DawContext.Provider>
    </>
  );
};

export default Daw;
