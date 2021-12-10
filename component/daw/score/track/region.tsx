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
  useEffect(() => {
    const runningTIme = GlobFunctions.getRunTime(project);
    const rate = (startAt.valueOf() / runningTIme) * 100;
    const width = (duration / runningTIme) * 100;
    setWidth(width);
    setLeft(rate);
  }, [project]);
  useEffect(() => {
    const start = startAt.valueOf();
    const current = time.time.valueOf();
    const end = start + duration;
    if (current >= start) audio?.play?.();
    if (!isPlaying || current > end) audio?.pause();
  }, [current, playingState]);
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
