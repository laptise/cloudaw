import { QueryDocumentSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { DawContext } from "../..";
import { RegionEntity } from "../../../../firebase/model";
import { contextFocus, GlobFunctions } from "../../../../utils";

interface Props {
  snapshot: QueryDocumentSnapshot<RegionEntity>;
}

const Region: React.FC<Props> = ({ snapshot }) => {
  const { projectState, projectRef, curerntRatePositionState, timeContextState, playingState, user } = useContext(DawContext);

  const [time] = timeContextState;
  const [isPlaying] = playingState;
  const [current] = curerntRatePositionState;
  const [project] = projectState;
  const { startAt, src, duration } = snapshot.data();
  const focuser = useRef<HTMLInputElement>(null);
  //リジョンの左位置
  const [left, setLeft] = useState(0);
  //リジョンの幅
  const [width, setWidth] = useState(0);
  //リジョンのオーディオ
  const [audio, setAudio] = useState<HTMLAudioElement>(null as any);
  //リジョンの再生状態
  const [regionPlaying, setRegionPlaying] = useState(false);

  //リジョンの大きさ、位置を調整
  const setRegionLayout = () => {
    const runningTIme = GlobFunctions.getRunTime(project);
    const rate = (startAt.valueOf() / runningTIme) * 100;
    const width = (duration / runningTIme) * 100;
    setWidth(width);
    setLeft(rate);
  };

  /**再生 */
  const play = () => {
    if (regionPlaying) return;
    setRegionPlaying(true);
    audio.play();
  };

  /**一時停止 */
  const pause = () => {
    if (!regionPlaying) return;
    audio?.pause();
    setRegionPlaying(false);
  };

  /**停止 */
  const stop = () => {
    if (audio) audio.currentTime = 0;
    if (!regionPlaying) return;
    else setRegionPlaying(false);
  };

  //プロジェクトの情報が変わるたびにリジョンを生成
  useEffect(() => {
    setRegionLayout();
  }, [project]);

  //再生ヘッダーの移動のたびにオーディオの再生をコントロール
  useEffect(() => {
    const start = startAt.valueOf();
    const current = time.time.valueOf();
    const end = start + duration;
    if (!isPlaying) {
      if (current <= end && start <= current) pause();
      if (current === 0) stop();
    }
    if (isPlaying) {
      if (start <= current && current <= end) {
        //再生ヘッダーがリジョン内なら再生
        play();
      } else pause();
    }
  }, [current, isPlaying]);

  //初期表示としてaudioを格納
  useEffect(() => {
    setAudio(new Audio(src));
  }, []);

  /**リジョンの持ち上げ */
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const parentWidth = (100 * e.currentTarget.clientWidth) / width;
    const currentLeft = (parentWidth * left) / 100;
    document.onmousemove = (e) => {
      const changed = e.clientX - startX;
      const newLeft = currentLeft + changed;
      const newLeftRate = (newLeft / parentWidth) * 100;
      setLeft(newLeftRate);
    };
    document.onmouseup = () => {
      const runTime = GlobFunctions.getRunTime(project);
      const newStart = runTime * (left / 100);
      console.log(newStart);
      document.onmousemove = () => {};
    };
  };
  return (
    <>
      <input
        type="radio"
        onClick={() => contextFocus(`region-${snapshot.id}`, projectRef, user)}
        className="focusChecker"
        data-doc-type="region"
        id={`region-${snapshot.id}`}
        name={`focusFor1`}
        ref={focuser}
      />
      <label
        htmlFor={`region-${snapshot.id}`}
        className="region focusTarget"
        onMouseDown={mouseDown}
        style={{ left: left + "%", width: width + "%", zIndex: 1 }}
      >
        {src}
      </label>
    </>
  );
};

export default Region;
