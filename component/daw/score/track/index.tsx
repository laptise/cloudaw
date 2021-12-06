import { doc, updateDoc } from "firebase/firestore";
import React, { useContext, useRef, useState } from "react";
import { getCollabColRef, TrackEntity } from "../../../../firebase/model";
import { ContextMenuContext, DawContext } from "../../../../pages/project/[id]";
import TrackCtl from "./ctl";

/**トラック */
const Track: React.FC<ChannelProps> = (props) => {
  const { projectRef, user } = useContext(DawContext);
  const { contextMenuViewState, leftState, topState, contextMenuGroupState } = useContext(ContextMenuContext);
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
            label: "トラック削除",
            disabled: false,
            async action() {
              window.confirm(`${name}を削除しますか？`);
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
        <div className="board"></div>
        <div className="resizeBar bottom" onMouseDown={mouseDown}></div>
      </div>
    </>
  );
};

export default Track;
