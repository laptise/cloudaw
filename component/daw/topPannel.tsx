import { updateDoc } from "@firebase/firestore";
import { faBackward, faForward, faPause, faPlay, faStop, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { timeStamp } from "console";
import { format } from "date-fns";
import { useContext, useEffect, useRef, useState } from "react";
import { DawContext } from ".";
import { TimeContext } from "../../utils";
import { FlexRow } from "../flexBox";
interface Props {
  play(): Promise<void>;
  pause(): Promise<void>;
}
const TopPannel: React.FC<Props> = ({ play, pause }) => {
  const [audio, setAudio] = useState<HTMLAudioElement>(null as any);
  const [audio2, setAudio2] = useState<HTMLAudioElement>(null as any);
  const { playingState, projectState, timeState, timeContextState, curerntRatePositionState, projectRef } = useContext(DawContext);
  const [currentPositionRate, setCurrentPositionRate] = curerntRatePositionState;
  const [timeContext, setTimeContext] = timeContextState;
  const currentTime = timeContext.time;
  const [time, setTime] = timeState;
  const [bar, count, ms] = time;
  const [isPlaying, setIsPlaying] = playingState;
  const [pjt] = projectState;
  const [bpm, setBpm] = useState(pjt.bpm);
  const [bpmEditing, setBpmEditing] = useState(false);
  const bpmInputRef = useRef<HTMLInputElement>(null);
  const editBpm = () => {
    setBpmEditing(true);
    bpmInputRef.current?.focus();
  };
  const stop = () => {
    setTimeContext(new TimeContext(4, pjt.bpm));
    setCurrentPositionRate(0);
    setTime([0, 0, 0]);
  };
  const updateBpm = async () => {
    setBpmEditing(false);
    await updateDoc(projectRef, {
      bpm,
    });
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
        <FlexRow className="row" onDoubleClick={() => editBpm()}>
          BPM :
          <input
            ref={bpmInputRef}
            onKeyDown={(e) => e.code === "Enter" && bpmInputRef.current?.blur()}
            onBlur={() => updateBpm()}
            onInput={(e) => setBpm(Number(e.currentTarget.value))}
            className="textLike"
            style={{ width: 24 }}
            readOnly={!bpmEditing}
            value={bpm}
          />
        </FlexRow>
        <div className="row">
          <span>{bar}.</span>
          <span>{count}.</span>
          <span>{ms}</span>
        </div>
        <div className="row">{format(currentTime, "mm:ss:SS")}</div>
      </div>
    </div>
  );
};

export default TopPannel;
