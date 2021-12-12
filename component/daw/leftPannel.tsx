import { useContext, useEffect, useState } from "react";
import { DawContext } from ".";
import { TrackEntity } from "../../firebase/model";

const LeftPannel: React.FC = () => {
  const { focusingTrackState, tracksState } = useContext(DawContext);
  const [tracks] = tracksState;
  const [focusing] = focusingTrackState;
  const [currentTrack, setCurrentTrack] = useState<TrackEntity>(null as any);
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
      <span id="trackName">{currentTrack?.name}</span>
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

export default LeftPannel;
