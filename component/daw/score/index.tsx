import React, { useContext, useState } from "react";
import { DawContext, ProjectProp } from "..";
import { Track } from "../../../firebase/model";

const TrackCtl: React.FC<ChannelProps> = ({ width, setWidth }) => {
  const [init, setInit] = useState(0);
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
      {name}
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
  const mouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    document.onmousemove = (e) => {
      setHeight(height + e.clientY - startY);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  return (
    <div className="channel" style={{ height }}>
      <TrackCtl {...props} />
      <div className="board"></div>
      <div className="resizeBar bottom" onMouseDown={mouseDown}></div>
    </div>
  );
};

const ScoreTool: React.FC<ProjectProp> = (props) => {
  const context = useContext(DawContext);
  const [view, setView] = context.addNewModalViewState;
  return (
    <div id="scoreTool">
      <button onClick={() => setView(true)}>+</button>
    </div>
  );
};

const Score: React.FC<ProjectProp> = (props) => {
  const { project } = props;
  const { trackList } = project;
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
