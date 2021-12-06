import { QueryDocumentSnapshot, updateDoc } from "@firebase/firestore";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc } from "firebase/firestore";
import React, { useContext, useRef, useState } from "react";
import { getCollabColRef, getFocusColRef, getFocusDocRef, TrackEntity } from "../../../firebase/model";
import { ContextMenuContext, DawContext, ModalViewContext } from "../../../pages/project/[id]";
import Track from "./track";

const ScoreTool: React.FC = (props) => {
  const { newTrackModalViewState } = useContext(ModalViewContext);
  const [view, setView] = newTrackModalViewState;
  return (
    <div id="scoreTool">
      <button onClick={() => setView(true)}>
        <FontAwesomeIcon icon={faPlus} />
        トラック追加
      </button>
    </div>
  );
};

const Score: React.FC = (props) => {
  const { projectState, tracksState } = useContext(DawContext);
  const [trackList] = tracksState;
  const [ctlWidth, setCtlWidth] = useState(200);

  return (
    <div id="scores">
      <ScoreTool {...props} />
      {trackList.map((x, index) => (
        <Track width={ctlWidth} setWidth={setCtlWidth} track={x} key={index} />
      ))}
    </div>
  );
};

export default Score;
