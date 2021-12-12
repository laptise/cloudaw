import { QueryDocumentSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { DawContext } from "../..";
import { RegionEntity } from "../../../../firebase/model";
import { GlobFunctions } from "../../../../utils";

interface Props {
  snapshot: QueryDocumentSnapshot<RegionEntity>;
}

const Region: React.FC<Props> = ({ snapshot }) => {
  const { projectState, curerntRatePositionState, timeContextState, playingState } = useContext(DawContext);
  const [time] = timeContextState;
  const [isPlaying] = playingState;
  const [current] = curerntRatePositionState;
  const [project] = projectState;
  const { startAt, src, duration } = snapshot.data();
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement>(null as any);
  const [regionPlaying, setRegionPlaying] = useState(false);
  useEffect(() => {
    const runningTIme = GlobFunctions.getRunTime(project);
    const rate = (startAt.valueOf() / runningTIme) * 100;
    const width = (duration / runningTIme) * 100;
    setWidth(width);
    setLeft(rate);
  }, [project]);
  const play = () => {
    if (regionPlaying) return;
    setRegionPlaying(true);
    audio.play();
  };
  const pause = () => {
    if (!regionPlaying) return;
    audio?.pause();
    setRegionPlaying(false);
  };
  const stop = () => {
    if (audio) audio.currentTime = 0;
    if (!regionPlaying) return;
    else setRegionPlaying(false);
  };
  useEffect(() => {
    const start = startAt.valueOf();
    const current = time.time.valueOf();
    const end = start + duration;
    // console.log(isPlaying);
    if (!isPlaying) {
      if (current <= end && start <= current) pause();
      if (current === 0) stop();
    }
    if (isPlaying) {
      if (start <= current && current <= end) {
        play();
      } else pause();
    }
  }, [current, isPlaying]);
  useEffect(() => {
    setAudio(new Audio(src));
  }, []);
  console.log();
  return (
    <div className="region" style={{ left: left + "%", width: width + "%" }}>
      {src}
    </div>
  );
};

export default Region;
