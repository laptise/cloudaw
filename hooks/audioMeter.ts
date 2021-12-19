import { useState, useEffect } from "react";
import { AudioManager } from "../audioCore/audioStore";

function useTrackVuMeter(manager: AudioManager, trackId: string) {
  const [volume, setVolume] = useState(0);

  const toDbu = (value: number) => 20 * Math.log10(value) + 18;

  useEffect(() => {
    console.log("yes");
    const target = manager?.tracks?.getTrack?.(trackId);
    if (target)
      target.onMeter = (e) => {
        setVolume(toDbu(e.data.volume));
      };
  }, [manager?.tracks]);

  return volume;
}

export default useTrackVuMeter;
