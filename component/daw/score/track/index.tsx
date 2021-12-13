import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { addDoc, deleteDoc, doc, DocumentReference, onSnapshot, QueryDocumentSnapshot, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCollabColRef, getRegionColRef, getTracksColRef, ProjectEntity, RegionEntity, TrackEntity } from "../../../../firebase/model";
import { contextFocus, removeDocumentMouseUpMoveEvent } from "../../../../utils";
import { AudioNodeGenerator } from "../../../../utils/audioNodes";
import { ContextMenuContext, DawContext } from "../../index";
import TrackCtl from "./ctl";
import Region from "./region";

export const TrackContext = createContext<TrackContext>(null as any);

/**トラック */
const Track: React.FC<ChannelProps> = (props) => {
  const { projectRef, user, projectState, curerntRatePositionState, focusingTrackState } = useContext(DawContext);
  const [focusing, setFocusing] = focusingTrackState;
  const [currentRatePosition] = curerntRatePositionState;
  const [pjt] = projectState;
  const [regions, setRegions] = useState([] as unknown as QueryDocumentSnapshot<RegionEntity>[]);
  const { contextMenuViewState, leftState, topState, contextMenuGroupState } = useContext(ContextMenuContext);
  const [ctxLeft, setCtxLeft] = leftState;
  const [ctxTop, setCtxTop] = topState;
  const [group, setGroup] = contextMenuGroupState;
  const audioNodeGeneratorsState = useState<AudioNodeGenerator.Generator[]>([]);
  const [viewContext, setViewContext] = contextMenuViewState;
  const [height, setHeight] = useState(80);
  const focuser = useRef<HTMLInputElement>(null);
  const { track } = props;
  const data = track.data();
  const { name, volume } = data;
  const trackState = useState(data);
  const volumeState = useState(volume);
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
      document.onmouseup = () => removeDocumentMouseUpMoveEvent();
    };
  };
  useEffect(() => {
    const ref = getRegionColRef(track.ref);
    onSnapshot(ref, (snapshot) => {
      const docs = snapshot.docs;
      setRegions(docs);
    });
  }, []);
  const callContext = (e: React.MouseEvent) => {
    setCtxLeft(e.clientX);
    setCtxTop(e.clientY);
    setGroup([
      {
        label: name,
        items: [
          {
            label: "トラック名編集",
            shortCut: "↩",
            disabled: false,
            async action() {},
          },
          {
            label: "トラック複製",
            shortCut: "⌘D",
            disabled: false,
            async action() {
              addDoc(getTracksColRef(projectRef), track.data());
            },
          },
          {
            label: "トラック削除",
            shortCut: "⌘⌫",
            disabled: false,
            async action() {
              if (window.confirm(`${name}を削除しますか？`)) {
                await deleteDoc(track.ref);
              }
            },
          },
        ],
      },
    ]);
    setViewContext(true);
  };
  const passFocus = async () => {
    setFocusing(track.id);
    await contextFocus(`track-${track.id}`, projectRef, user);
  };
  return (
    <TrackContext.Provider value={{ trackState, volumeState, audioNodeGeneratorsState }}>
      <input
        onClick={(e) => passFocus()}
        type="radio"
        className="focusChecker"
        data-doc-type="track"
        id={`track-${track.id}`}
        name={`focusFor1`}
        ref={focuser}
      />
      <label htmlFor={`track-${track.id}`} className="channel focusTarget" style={{ height }} onContextMenu={callContext}>
        <TrackCtl {...props} />
        <div className="board">
          {regions?.map?.((region, index) => (
            <Region snapshot={region} key={index} />
          ))}
          {new Array(pjt.bar).fill(null).map((bar, index) => (
            <div className="barArea" key={index}>
              <span className="barIndex"> </span>
            </div>
          ))}
          <div className="playBar" style={{ left: currentRatePosition * 100 + "%" }}></div>
        </div>
        <div className="resizeBar bottom" onMouseDown={mouseDown}></div>
      </label>
    </TrackContext.Provider>
  );
};

export default Track;
