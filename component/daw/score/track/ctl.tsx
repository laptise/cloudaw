import { useContext, useState } from "react";
import { TrackContext } from ".";

/**トラックコントロール */
const TrackCtl: React.FC<ChannelProps> = (props) => {
  const [init, setInit] = useState(0);
  const { width, setWidth, track } = props;
  const startWidth = width;
  const { name, volume } = track.data();
  const { volumeState } = useContext(TrackContext);
  const [currentVolume, setCurrentVolue] = volumeState;
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
      <div>
        <input onChange={(e) => setCurrentVolue(Number(e.currentTarget.value))} type="range" min={0} max={1000} value={currentVolume} />
      </div>
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

export default TrackCtl;
