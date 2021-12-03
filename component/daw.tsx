import React from "react";
import { FlexRow } from "./flexBox";

interface Props {
  name: string;
}
const Channel: React.FC<Props> = ({ name }) => {
  return (
    <div className="channel">
      <div className="ctl">{name}</div>
      <div className="board"></div>
    </div>
  );
};

const Scores: React.FC = () => {
  const channels = ["guitar", "eb"];
  return (
    <div id="scores">
      {channels.map((x, index) => (
        <Channel name={x} key={index} />
      ))}
    </div>
  );
};

const Daw: React.FC = () => {
  return (
    <div id="daw">
      <div id="playBackCtl"></div>
      <FlexRow className="centerRow">
        <div id="pannels"></div>
        <Scores />
      </FlexRow>
    </div>
  );
};
export default Daw;
