import { faBackward, faForward, faPause, faPlay, faStop, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { ContextMenuContext } from "../../pages/project/[id]";

const TopPannel = () => {
  const [audio, setAudio] = useState<HTMLAudioElement>(null as any);
  const [audio2, setAudio2] = useState<HTMLAudioElement>(null as any);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    setAudio(new Audio("/Acoustic%20L-min2.wav"));
    setAudio2(new Audio("/Lead Electric-min2.wav"));
  }, []);
  const play = () => {
    audio.play();
    audio2.play();
    setIsPlaying(true);
  };
  const pause = () => {
    audio2.pause();
    audio.pause();
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
    </div>
  );
};

export default TopPannel;
