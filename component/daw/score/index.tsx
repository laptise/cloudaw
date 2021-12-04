import React, { useContext, useRef, useState } from "react";
import { DawContext, ProjectProp } from "..";
import { Track } from "../../../firebase/model";

const TrackCtl: React.FC<ChannelProps> = (props) => {
  const [init, setInit] = useState(0);
  const { width, setWidth, track } = props;
  const startWidth = width;
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  return (
    <div className="ctl" style={{ width: startWidth }}>
      {track.name}
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

interface ChannelProps {
  track: Track;
  width: number;
  setWidth(width: number): void;
}

const Channel: React.FC<ChannelProps> = (props) => {
  const [height, setHeight] = useState(80);
  const focuser = useRef<HTMLInputElement>(null);
  const focus = () => {
    if (focuser.current) focuser.current.checked = true;
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
      <input type="radio" className="focusChecker" name={`focusFor1`} ref={focuser} />
      <div onClick={focus} className="channel focusTarget" style={{ height }}>
        <TrackCtl {...props} />
        <div className="board"></div>
        <div className="resizeBar bottom" onMouseDown={mouseDown}></div>
      </div>
    </>
  );
};

const ScoreTool: React.FC = (props) => {
  const context = useContext(DawContext);
  const [view, setView] = context.addNewModalViewState;
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
