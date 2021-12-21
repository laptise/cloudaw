import { useState, useEffect, useContext } from "react";
import { AudioManager } from "../audioCore/audioStore";
import { DawContext } from "../component/daw";

function useTrackVuMeter(manager: AudioManager, trackId: string) {
  const { playingState } = useContext(DawContext);
  const [isPlaying] = playingState;
  const [volume, setVolume] = useState(0);

  const toDbu = (value: number) => 20 * Math.log10(value) + 18;

  useEffect(() => {
    const target = manager?.tracks?.getTrack?.(trackId);
    if (target) {
      target.onMeter = (e) => {
        setVolume(toDbu(e.data.volume));
      };
    }
  }, [manager?.tracks]);

  return volume;
}

export default useTrackVuMeter;
