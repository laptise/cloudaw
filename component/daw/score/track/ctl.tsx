import { useContext, useEffect, useRef, useState } from "react";
import { TrackContext } from ".";
import { DawContext } from "../..";
import useTrackVuMeter from "../../../../hooks/audioMeter";

interface MeterProp {
  width: number;
}
const Meter: React.FC<MeterProp> = ({ width }) => {
  const { audioManagerState } = useContext(DawContext);

  return (
    <div className="meter">
      <div className="masker" style={{ width: width + "%" }}></div>
      <div className="bar"></div>
    </div>
  );
};

/**トラックコントロール */
const TrackCtl: React.FC<ChannelProps> = (props) => {
  const { audioManagerState, playingState } = useContext(DawContext);
  const [isPlaying] = playingState;
  const [audioManager] = audioManagerState;
  const [init, setInit] = useState(0);
  const { width, setWidth, track } = props;
  const startWidth = width;
  const trackName = useRef<HTMLInputElement>(null);
  const { name, volume } = track.data();
  const { volumeState } = useContext(TrackContext);
  const [currentVolume, setCurrentVolue] = volumeState;
  const [inpueDisabled, setInputDisabled] = useState(true);
  const [vol, setVol] = useState(0);
  const vuMeter = useTrackVuMeter(audioManager, track.id);
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    document.onmousemove = (e) => {
      setWidth(width + e.clientX - startX);
      document.onmouseup = () => (document.onmousemove = () => {});
    };
  };
  const goEdit = () => setInputDisabled(false);
  useEffect(() => getWidth(), [vuMeter, isPlaying]);
  const getWidth = () => {
    if (isPlaying) {
      const volume = Math.abs(vuMeter);
      if (volume > 0 && volume < 60) {
        const offset = 60;
        setVol((volume / offset) * 100);
        // setPer(100 - percentage);
      } else setVol(100);
    } else setVol(100);
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
      <Meter width={vol} />
      <div className="resizeBar right" onMouseDown={mouseDown}></div>
    </div>
  );
};

export default TrackCtl;
