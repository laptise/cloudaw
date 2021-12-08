import { faBackward, faForward, faPause, faPlay, faStop, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { timeStamp } from "console";
import { useContext, useEffect, useRef, useState } from "react";
import { DawContext } from ".";

const TopPannel = () => {
  const [audio, setAudio] = useState<HTMLAudioElement>(null as any);
  const [audio2, setAudio2] = useState<HTMLAudioElement>(null as any);
  const { playingState, projectState, timeState } = useContext(DawContext);
  const [bar, count, ms] = timeState[0];
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
  };
  return (
    <div id="topPannel">
      <div id="playbackCtl">
        <button>
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <button>
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
