import { addDoc, deleteDoc, doc, DocumentReference, onSnapshot, QueryDocumentSnapshot, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getNodeColRef, getRegionColRef, getTracksColRef, RegionEntity, TrackEntity } from "../../../../firebase/firestore";
import { contextFocus, removeDocumentMouseUpMoveEvent } from "../../../../utils";
import { AudioNodeGenerator } from "../../../../audioCore/audioNodes";
import { ContextMenuContext, DawContext } from "../../index";
import TrackCtl from "./ctl";
import { getProjectWavStorageRef } from "../../../../firebase/storage";
import { ref, uploadBytes } from "firebase/storage";
import dynamic from "next/dynamic";
const Region = dynamic(() => import("./region"), {
  ssr: false,
});

export const TrackContext = createContext<TrackContext>(null as any);

/**トラック */
const Track: React.FC<ChannelProps> = (props) => {
  const { projectRef, user, projectState, curerntRatePositionState, focusingTrackState, trackInfo, playingState } = useContext(DawContext);
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
  useEffect(
    () =>
      onSnapshot(getNodeColRef(track.ref), (snapshot) => {
        console.log(snapshot);
      }),
    []
  );
  const mouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    document.onmousemove = (e) => {
      setHeight(height + e.clientY - startY);
      document.onmouseup = removeDocumentMouseUpMoveEvent;
    };
  };
  useEffect(() => {
    const ref = getRegionColRef(track.ref);
    return onSnapshot(ref, (snapshot) => {
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
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };
  const uploadFile = async (file: File) => {
    const fileRef = ref(getProjectWavStorageRef(projectRef.id), file.name);
    const buffer = await file.arrayBuffer();
    const [node] = await Promise.all([new AudioContext().decodeAudioData(buffer), uploadBytes(fileRef, file)]);
    const entity = new RegionEntity();
    entity.duration = node.duration * 1000;
    entity.src = file.name;
    entity.startAt = 0;
    entity.metastamp = new Date();
    entity.timestamp = new Date();
    await addDoc(getRegionColRef(track.ref), entity);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    console.log(e);
    e.stopPropagation();
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      for (let i = 0; i <= files.length; i++) {
        const file = files[i];
        file && uploadFile(file);
      }
    }
  };
  return (
    <TrackContext.Provider value={{ trackRef: track, trackState, volumeState, audioNodeGeneratorsState }}>
      <form>
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
          <div onDragOver={onDragOver} onDrop={onDrop} className="board">
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
      </form>
    </TrackContext.Provider>
  );
};

export default Track;
