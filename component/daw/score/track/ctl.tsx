import { useContext, useEffect, useRef, useState } from "react";
import { TrackContext } from ".";
import { DawContext } from "../..";
import useTrackVuMeter from "../../../../hooks/audioMeter";

interface MeterProp {
  trackId: string;
}
const Meter: React.FC<MeterProp> = ({ trackId }) => {
  const { audioManagerState } = useContext(DawContext);
  const [audioManager] = audioManagerState;
  const vuMeter = useTrackVuMeter(audioManager, trackId);
  const getWidth = () => {
    const volume = Math.abs(vuMeter);
    if (volume > 0 && volume < 60) {
      const offset = 60;
      return (volume / offset) * 100;
      // setPer(100 - percentage);
    } else return 100;
  };
  return (
    <div className="meter">
      <div className="masker" style={{ width: getWidth() + "%" }}></div>
      <div className="bar"></div>
    </div>
  );
};

/**トラックコントロール */
const TrackCtl: React.FC<ChannelProps> = (props) => {
  const { audioManagerState } = useContext(DawContext);
  const [audioManager] = audioManagerState;
  const [init, setInit] = useState(0);
  const { width, setWidth, track } = props;
  const startWidth = width;
  const trackName = useRef<HTMLInputElement>(null);
  const { name, volume } = track.data();
  const { volumeState } = useContext(TrackContext);
  const [currentVolume, setCurrentVolue] = volumeState;
  const [inpueDisabled, setInputDisabled] = useState(true);
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  const goEdit = () => {
    setInputDisabled(false);
  };
  return (
    <div className="ctl" style={{ width: startWidth }}>
      <input
        onDoubleClick={goEdit}
        onBlur={() => setInputDisabled(true)}
        className="textLike"
        readOnly={inpueDisabled}
        ref={trackName}
        value={name}
      />
      <input onChange={(e) => setCurrentVolue(Number(e.currentTarget.value))} type="range" min={0} max={1000} value={currentVolume} />
      <Meter trackId={track.id} />
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

export default TrackCtl;
