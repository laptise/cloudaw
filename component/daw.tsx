import { channel } from "diagnostics_channel";
import React, { useState } from "react";
import { FlexRow } from "./flexBox";
import Head from "next/head";
const ChannelCtl: React.FC<ChannelProps> = ({ name, width, setWidth }) => {
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
  name: string;
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
      <ChannelCtl {...props} />
      <div className="board"></div>
      <div className="resizeBar bottom" onMouseDown={mouseDown}></div>
    </div>
  );
};

const Scores: React.FC = () => {
  const channels = ["guitar", "eb"];
  const [ctlWidth, setCtlWidth] = useState(200);

  return (
    <div id="scores">
      {channels.map((x, index) => (
        <Channel width={ctlWidth} setWidth={setCtlWidth} name={x} key={index} />
      ))}
    </div>
  );
};

const Pannel: React.FC = () => {
  const [width, setWidth] = useState(120);
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  return (
    <div id="pannels" style={{ width }}>
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

interface Prop {
  name: string;
}
const Daw: React.FC<Prop> = ({ name }) => {
  return (
    <>
      <Head>
        <title>{name}</title>
      </Head>
      <div id="daw">
        <div id="playBackCtl"></div>
        <FlexRow className="centerRow">
          <Pannel />
          <Scores />
        </FlexRow>
      </div>
    </>
  );
};

export default Daw;
