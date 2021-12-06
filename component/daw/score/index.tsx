import { QueryDocumentSnapshot, updateDoc } from "@firebase/firestore";
import { doc } from "firebase/firestore";
import React, { useContext, useRef, useState } from "react";
import { getCollabColRef, getFocusColRef, getFocusDocRef, Track } from "../../../firebase/model";
import { DawContext, ModalViewContext } from "../../../pages/project/[id]";

const TrackCtl: React.FC<ChannelProps> = (props) => {
  const [init, setInit] = useState(0);
  const { width, setWidth, track } = props;
  const startWidth = width;
  const { name } = track.data();
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  return (
    <div className="ctl" style={{ width: startWidth }}>
      {name}
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

interface ChannelProps {
  track: QueryDocumentSnapshot<Track>;
  width: number;
  setWidth(width: number): void;
}

const Channel: React.FC<ChannelProps> = (props) => {
  const { projectRef, user } = useContext(DawContext);
  const [height, setHeight] = useState(80);
  const focuser = useRef<HTMLInputElement>(null);
  const { track } = props;
  const focus = async () => {
    if (focuser.current) {
      focuser.current.checked = true;
      const colRef = getCollabColRef(projectRef);
      const docRef2 = doc(colRef, user.uid);
      updateDoc(docRef2, {
        focusing: `${focuser.current.id}`,
        displayName: user.displayName || "unknown",
      });
    }
  };
  const mouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    document.onmousemove = (e) => {
      setHeight(height + e.clientY - startY);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  return (
    <>
      <input type="radio" className="focusChecker" data-doc-type="track" id={`track-${track.id}`} name={`focusFor1`} ref={focuser} />
      <div onClick={focus} className="channel focusTarget" style={{ height }}>
        <TrackCtl {...props} />
        <div className="board"></div>
        <div className="resizeBar bottom" onMouseDown={mouseDown}></div>
      </div>
    </>
  );
};

const ScoreTool: React.FC = (props) => {
  const { newTrackModalViewState } = useContext(ModalViewContext);
  const [view, setView] = newTrackModalViewState;
  return (
    <div id="scoreTool">
      <button onClick={() => setView(true)}>+</button>
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
        <Channel width={ctlWidth} setWidth={setCtlWidth} track={x} key={index} />
      ))}
    </div>
  );
};

export default Score;
