import { addDoc, deleteDoc, DocumentReference, getDocs, onSnapshot, QueryDocumentSnapshot, updateDoc } from "@firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ContextMenuContext, DawContext } from "../.";
import { getNodeColRef, NodeEntity, TrackEntity } from "../../../firebase/firestore";
import { ContextMenuInit, defineContextMenu } from "../../../utils";
import { AudioNodeGenerator } from "../../../audioCore/audioNodes";
import NodeInfo from "./nodeInfo";

const TrackInfo: React.FC<{ track: QueryDocumentSnapshot<TrackEntity> }> = ({ track }) => {
  const { contextMenuViewState, leftState, topState, contextMenuGroupState } = useContext(ContextMenuContext);
  const [viewContext, setViewContext] = contextMenuViewState;
  const [ctxLeft, setCtxLeft] = leftState;
  const [ctxTop, setCtxTop] = topState;
  const [group, setGroup] = contextMenuGroupState;
  const { name } = track.data();
  const [nodes, setNodes] = useState<QueryDocumentSnapshot<NodeEntity>[]>([]);

  const addGain = async () => {
    const gen = new AudioNodeGenerator.Gain();
    gen.gain = 2;
    const entity = gen.toEntity();
    await addDoc(getNodeColRef(track.ref), entity);
  };

  const addDelay = async () => {
    const gen = new AudioNodeGenerator.Delay();
    gen.delay = 0.5;
    const entity = gen.toEntity();
    await addDoc(getNodeColRef(track.ref), entity);
  };

  useEffect(() => {
    onSnapshot(getNodeColRef(track.ref), (snapshot) => {
      setNodes(snapshot.docs);
    });
  }, [track]);

  const callContext = (e: React.MouseEvent) => {
    setCtxLeft(e.clientX);
    setCtxTop(e.clientY);
    setGroup([
      {
        label: "ノード追加",
        items: [
          {
            label: "Gain",
            disabled: false,
            action: () => addGain(),
          },
          {
            label: "Delay",
            disabled: false,
            action: () => addDelay(),
          },
        ],
      },
    ]);
    setViewContext(true);
  };
  return (
    <>
      <span id="trackName">{name}</span>
      <div id="leftNodes">
        {nodes?.map((node, index) => (
          <NodeInfo key={index} node={node} />
        ))}
        <div onClick={callContext} className="singleNode">
          新規追加
        </div>
      </div>
    </>
  );
};

const LeftPannel: React.FC = () => {
  const { focusingTrackState, tracksState } = useContext(DawContext);
  const [tracks] = tracksState;
  const [focusing] = focusingTrackState;
  const trackState = useState<QueryDocumentSnapshot<TrackEntity>>(null as any);
  const [track, setTrack] = trackState;
  const [width, setWidth] = useState(120);
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  //ユーザーが見てるものが変わる度
  useEffect(() => {
    const target = tracks.find((x) => x.id === focusing);
    if (target) {
      setTrack(target);
    }
  }, [focusing]);

  return (
    <div id="leftPannel" style={{ width }}>
      {track && <TrackInfo track={track} />}
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

export default LeftPannel;
