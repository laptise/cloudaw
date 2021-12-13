import React, { useContext, useEffect, useState } from "react";
import { ContextMenuContext, DawContext } from ".";
import { TrackEntity } from "../../firebase/model";
import { AudioNodeGenerator } from "../../utils/audioNodes";

const TrackInfo: React.FC<{ trackState: State<TrackEntity> }> = ({ trackState }) => {
  const { contextMenuViewState, leftState, topState, contextMenuGroupState } = useContext(ContextMenuContext);
  const [ctxLeft, setCtxLeft] = leftState;
  const [ctxTop, setCtxTop] = topState;
  const [group, setGroup] = contextMenuGroupState;
  const [viewContext, setViewContext] = contextMenuViewState;
  const [currentTrack, setCurrentTrack] = trackState;
  const addGain = () => {
    const gen = new AudioNodeGenerator.Gain();
    gen.gain = 2;
    currentTrack.nodes.push(gen);
    console.log(gen);
  };
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
        ],
      },
    ]);
    setViewContext(true);
  };
  return (
    <>
      <span id="trackName">{currentTrack?.name}</span>
      <div id="leftNodes">
        {currentTrack?.nodes?.map((node, index) => (
          <div className="singleNode" key={index}>
            a
          </div>
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
  const trackState = useState<TrackEntity>(null as any);
  const [currentTrack, setCurrentTrack] = trackState;
  const [width, setWidth] = useState(120);
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  useEffect(() => {
    const target = tracks.find((x) => x.id === focusing);
    if (target) setCurrentTrack(target.data());
  }, [focusing]);

  return (
    <div id="leftPannel" style={{ width }}>
      {currentTrack && <TrackInfo trackState={trackState} />}
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

export default LeftPannel;
