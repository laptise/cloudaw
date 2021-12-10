import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useRef, useState } from "react";
import { ContextMenuContext, DawContext, ModalViewContext } from "../index";
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
  const { projectState, tracksState, curerntRatePositionState } = useContext(DawContext);
  const [currentPositionRate] = curerntRatePositionState;
  const [pjt] = projectState;
  const [trackList] = tracksState;
  const [width, setCtlWidth] = useState(200);

  return (
    <div id="scores">
      <ScoreTool {...props} />
      <div id="timeLineBox">
        <div style={{ width }}></div>
        <div id="timeLine">
          {new Array(pjt.bar).fill(null).map((bar, index) => (
            <div className="barArea" key={index}>
              <span className="barIndex">{index}</span>
            </div>
          ))}
          <div id="currentPoint" style={{ left: currentPositionRate * 100 + "%" }}>
            <div style={{ position: "relative", marginLeft: -7 }}>
              <div id="triangle"></div>
            </div>
          </div>
        </div>
      </div>
      {trackList.map((x, index) => (
        <Track width={width} setWidth={setCtlWidth} track={x} key={index} />
      ))}
    </div>
  );
};

export default Score;
