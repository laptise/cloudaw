import React, { createContext, useContext, useEffect, useState } from "react";
import { FlexRow } from "../flexBox";
import Head from "next/head";
import TopPannel from "./topPannel";
import Score from "./score";
import AddNewTrackModal from "./modal/addNewTrack";
import { doc, DocumentReference, getDocs, onSnapshot, QueryDocumentSnapshot } from "@firebase/firestore";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faHome } from "@fortawesome/free-solid-svg-icons";
import SettingModal from "./modal/setting";
import Link from "next/link";
import { ContextMenuContext, ModalViewContext } from "../../pages/project/[id]";
import LeftPannel from "./leftPannel";

const Daw: React.FC<ProjectProp> = ({ project, user }) => {
  const { settingModalViewState } = useContext(ModalViewContext);
  const [settingModalView, setSettingModalView] = settingModalViewState;
  return (
    <>
      <header onContextMenu={(e) => console.log(19878897)}>
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
      <TopPannel />
      <Head>
        <title>{project.name}</title>
      </Head>
      {/* <div id="playBackCtl"></div> */}
      <FlexRow className="centerRow">
        <LeftPannel />
        <Score />
      </FlexRow>
    </>
  );
};

export default Daw;
