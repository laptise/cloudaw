import { faBackward, faForward, faPause, faPlay, faStop, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { timeStamp } from "console";
import { useContext, useEffect, useRef, useState } from "react";
import { DawContext } from ".";
import { TimeContext } from "../../utils";

const TopPannel = () => {
  const [audio, setAudio] = useState<HTMLAudioElement>(null as any);
  const [audio2, setAudio2] = useState<HTMLAudioElement>(null as any);
  const { playingState, projectState, timeState, timeContextState, curerntRatePositionState } = useContext(DawContext);
  const [currentPositionRate, setCurrentPositionRate] = curerntRatePositionState;
  const [timeContext, setTimeContext] = timeContextState;
  const [time, setTime] = timeState;
  const [bar, count, ms] = time;
  const [isPlaying, setIsPlaying] = playingState;
  const [pjt] = projectState;
  useEffect(() => {
    setAudio(new Audio("/Acoustic%20L-min2.wav"));
    setAudio2(new Audio("/Lead Electric-min2.wav"));
  }, []);
  const play = () => {
    setIsPlaying(true);
  };
  const pause = () => {
    setIsPlaying(false);
    return true;
  };
  const stop = () => {
    setTimeContext(new TimeContext(4, pjt.bpm));
    setCurrentPositionRate(0);
    setTime([0, 0, 0]);
  };
  return (
    <div id="topPannel">
      <div id="playbackCtl">
        <button>
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <button onClick={() => stop()}>
          <FontAwesomeIcon icon={faStop} />
        </button>
        {isPlaying ? (
          <button>
            <FontAwesomeIcon onClick={pause} icon={faPause} />
          </button>
        ) : (
          <button>
            <FontAwesomeIcon onClick={play} icon={faPlay} />
          </button>
        )}
        <button>
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button>
          <FontAwesomeIcon icon={faForward} />
        </button>
      </div>
      <div id="timeSetInfo">
        <div className="row">BPM : {pjt.bpm}</div>
        <div className="row">
          <span>{bar}.</span>
          <span>{count}.</span>
          <span>{ms}</span>
        </div>
      </div>
    </div>
  );
};

export default TopPannel;
