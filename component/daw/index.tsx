import { channel } from "diagnostics_channel";
import React, { createContext, useContext, useState } from "react";
import { FlexRow } from "../flexBox";
import Head from "next/head";
import { Project, Track } from "../../firebase/model";
import TopPannel from "./topPannel";
import Score from "./score";
import AddNewTrackModal from "./modal/addNewTrack";

export interface ProjectProp {
  project: Project;
}

interface DawContext {
  addNewModalViewState: [boolean, (value: boolean) => void];
}

const dawContextinit = {
  viewAddNewTrackModal: false,
};

export const DawContext = createContext<DawContext>(null as any);

const Daw: React.FC<ProjectProp> = ({ project }) => {
  const context = useContext(DawContext);
  const addNewModalViewState = useState(false);
  return (
    <>
      <Head>
        <title>{project.name}</title>
      </Head>
      <DawContext.Provider value={{ ...dawContextinit, ...{ addNewModalViewState } }}>
        <div id="daw">
          <AddNewTrackModal />
          <div id="playBackCtl"></div>
          <FlexRow className="centerRow">
            <TopPannel project={project} />
            <Score project={project} />
          </FlexRow>
        </div>
      </DawContext.Provider>
    </>
  );
};

export default Daw;
