import { addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import React, { useContext, useRef, useState } from "react";
import { getCollabColRef, getTracksColRef, TrackEntity } from "../../../../firebase/model";
import { ContextMenuContext, DawContext } from "../../index";
import TrackCtl from "./ctl";

/**トラック */
const Track: React.FC<ChannelProps> = (props) => {
  const { projectRef, user, projectState } = useContext(DawContext);
  const { contextMenuViewState, leftState, topState, contextMenuGroupState } = useContext(ContextMenuContext);
  const [pjt] = projectState;
  const [ctxLeft, setCtxLeft] = leftState;
  const [ctxTop, setCtxTop] = topState;
  const [group, setGroup] = contextMenuGroupState;
  const [viewContext, setViewContext] = contextMenuViewState;
  const [height, setHeight] = useState(80);
  const focuser = useRef<HTMLInputElement>(null);
  const { track } = props;
  const { name } = track.data();
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
  return (
    <>
      <input type="radio" className="focusChecker" data-doc-type="track" id={`track-${track.id}`} name={`focusFor1`} ref={focuser} />
      <div onClick={focus} className="channel focusTarget" style={{ height }} onContextMenu={callContext}>
        <TrackCtl {...props} />
        <div className="board">
          {new Array(pjt.bar).fill(null).map((bar, index) => (
            <div className="barArea" key={index}>
              <span className="barIndex"> </span>
            </div>
          ))}
          <div className="playBar"></div>
        </div>
        <div className="resizeBar bottom" onMouseDown={mouseDown}></div>
      </div>
    </>
  );
};

export default Track;
