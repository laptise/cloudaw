import { useState, useEffect, useContext } from "react";
import { AudioManager } from "../audioCore/audioStore";
import { DawContext } from "../component/daw";

function useVolumeMeter(manager: AudioManager, trackId: string, volume: number) {
  const { playingState } = useContext(DawContext);
  const [isPlaying] = playingState;

  useEffect(() => {
    console.log(volume);
    const target = manager?.tracks?.getTrack?.(trackId);
    if (target) {
      target.volume = volume;
    }
  }, [manager?.tracks, volume, isPlaying]);

  return volume;
}

export default useVolumeMeter;
