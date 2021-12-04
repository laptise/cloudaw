import { channel } from "diagnostics_channel";
import React, { createContext, useContext, useEffect, useState } from "react";
import { FlexRow } from "../flexBox";
import Head from "next/head";
import { getProjectRef, getTrackRef, Project, Track } from "../../firebase/model";
import TopPannel from "./topPannel";
import Score from "./score";
import AddNewTrackModal from "./modal/addNewTrack";
import { doc, getDoc, getFirestore, onSnapshot } from "@firebase/firestore";
import { FireBase } from "../../firebase";

export interface ProjectProp {
  project: Project;
}

interface DawContext {
  projectState: [Project, (val: Project) => void];
  addNewModalViewState: [boolean, (value: boolean) => void];
}

const dawContextinit = {
  viewAddNewTrackModal: false,
};

export const DawContext = createContext<DawContext>(null as any);

const Daw: React.FC<ProjectProp> = ({ project }) => {
  const context = useContext(DawContext);
  const projectState = useState(project);
  const addNewModalViewState = useState(false);
  const attach = async () => {
    const projectColRef = getProjectRef();
    const projectRef = doc(projectColRef, project.id as string);
    const tracksColRef = getTrackRef(projectRef);
    onSnapshot(projectRef, (doc) => {
      console.log(doc.data());
      console.log(11);
    });
    onSnapshot(tracksColRef, (snapshot) => {
      const tracks = snapshot.docs.map((x) => x.data());
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
      <DawContext.Provider value={{ addNewModalViewState, projectState }}>
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
