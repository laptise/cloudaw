import { ref, getBlob } from "@firebase/storage";
import { faCheckCircle, faDownload, faQuestion, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { storage } from "firebase-admin";
import { getDoc, onSnapshot, QueryDocumentSnapshot, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { TrackContext } from ".";
import { DawContext } from "../..";
import { db } from "../../../../db";
import { FireBase } from "../../../../firebase";
import { getNodeColRef, getProjectWavsRef, NodeEntity, RegionEntity } from "../../../../firebase/model";
import { contextFocus, GlobFunctions } from "../../../../utils";
import { AudioNodeGenerator, NodeContext } from "../../../../utils/audioNodes";
import { AudioManager } from "../../../../utils/audioStore";
import { FlexCol, FlexRow } from "../../../flexBox";

interface Props {
  snapshot: QueryDocumentSnapshot<RegionEntity>;
}

enum RegionLocalUpdateState {
  onTime,
  updateNeeded,
  unknown,
}

const Region: React.FC<Props> = ({ snapshot }) => {
  const { projectState, projectRef, curerntRatePositionState, timeContextState, playingState, user } = useContext(DawContext);
  const { trackState, volumeState, trackRef } = useContext(TrackContext);
  const [currentVolume] = volumeState;
  const [track] = trackState;
  const [time] = timeContextState;
  const [isPlaying] = playingState;
  const [current] = curerntRatePositionState;
  const [project] = projectState;
  const { startAt, src, duration, timestamp, metastamp } = snapshot.data();
  const [nodes, setNodes] = useState<QueryDocumentSnapshot<NodeEntity>[]>([]);
  const focuser = useRef<HTMLInputElement>(null);
  //リジョンの左位置
  const [left, setLeft] = useState(0);
  //リジョンの幅
  const [width, setWidth] = useState(0);
  //リジョンのオーディオ
  const [audio, setAudio] = useState<HTMLAudioElement>(null as any);
  const [buffer, setBuffer] = useState<AudioBuffer>();
  const [srcNode, setSrcNode] = useState<AudioBufferSourceNode>();
  const [volumeNode, setVolumeNode] = useState<GainNode>();
  const [updateState, setUpdateState] = useState(RegionLocalUpdateState.unknown);
  //リジョンの再生状態
  const [nodeStates, setNodeStates] = useState<NodeContext[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //リジョンの大きさ、位置を調整
  const setRegionLayout = () => {
    const runningTIme = GlobFunctions.getRunTime(project);
    const rate = (startAt.valueOf() / runningTIme) * 100;
    const width = (duration / runningTIme) * 100;
    setWidth(width);
    setLeft(rate);
  };

  const fetchWav = async () => {
    const wav = await (async () => {
      const item = await db.wavs.get(snapshot.id);
      const needHardFetch = !item || item.timestamp?.valueOf() !== timestamp.valueOf();
      const needMetaUpdate = !needHardFetch && item.metastamp?.valueOf() !== metastamp.valueOf();
      const getData = async () => {
        const newSnapshot = await getDoc(snapshot.ref);
        const data = newSnapshot.data();
        if (!newSnapshot || !data) throw new Error();
        const { metastamp, timestamp, duration, startAt } = data;
        const newItem = {
          projectId: projectRef.id,
          name: src,
          id: newSnapshot.id,
          duration,
          startAt,
          timestamp,
          trackId: trackRef.id,
          metastamp,
        };
        return newItem;
      };
      if (needHardFetch) {
        setUpdateState(RegionLocalUpdateState.updateNeeded);
        const buffer = await (await getBlob(ref(getProjectWavsRef(projectRef), src))).arrayBuffer();
        const entity = await getData();
        const newItem = { ...entity, ...{ buffer } };
        db.wavs.put(newItem);
        setUpdateState(RegionLocalUpdateState.onTime);
        return newItem;
      } else if (needMetaUpdate) {
        const entity = await getData();
        const newItem = { ...entity };
        db.wavs.update(newItem.id, newItem);
        return item;
      } else {
        setUpdateState(RegionLocalUpdateState.onTime);
        return item;
      }
    })();
    const arrayBuffer = wav.buffer;
    const buffer = await new AudioContext().decodeAudioData(arrayBuffer);
    const processor = new AudioManager(project.bpm, 44100).processor;
    const start = processor.samplePerMilliSecond * wav.startAt;
    const duration = processor.samplePerMilliSecond * wav.duration;
    const end = start + duration;
    const ab = buffer.getChannelData(0);
    const sliced = ab.slice(start, end);
    const peaks = getPeaks(sliced);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const barMargin = 0;
      const barWidth = canvas.width / peaks.length - barMargin;
      const canvasH = canvas.height;
      const halfCanvasH = canvasH / 2;
      ctx.fillStyle = "white";
      let sample;
      let barHeight;
      for (let i = 0, len = peaks.length; i < len; i++) {
        //ch1
        sample = peaks[i];
        barHeight = sample * halfCanvasH;
        ctx.fillRect(i * (barWidth + barMargin), halfCanvasH - barHeight, barWidth, barHeight);

        //ch2
        sample = peaks[i];
        barHeight = sample * halfCanvasH;
        ctx.fillRect(i * (barWidth + barMargin), halfCanvasH, barWidth, barHeight);
      }
      setBuffer(buffer);
    }
  };
  function getPeaks(array: Float32Array, peakLength = 2000) {
    let step;
    if (!peakLength) {
      peakLength = 9000;
    }
    step = Math.floor(array.length / peakLength);
    if (step < 1) {
      step = 1;
    }
    let peaks = [];
    for (let i = 0, len = array.length; i < len; i += step) {
      const peak = getPeak(array, i, i + step);
      peaks.push(peak);
    }
    return peaks;
  }
  function getPeak(array: Float32Array, startIndex: number, endIndex: number) {
    const sliced = array.slice(startIndex, endIndex);
    let peak = -100;
    for (let i = 0, len = sliced.length; i < len; i++) {
      const sample = sliced[i];
      if (sample > peak) {
        peak = sample;
      }
    }
    return peak;
  }

  //ボリューム調整を反映
  useEffect(() => {
    if (volumeNode) volumeNode.gain.value = currentVolume / 1000;
  }, [audio, currentVolume]);
  useEffect(() => {
    fetchWav();
  }, [snapshot]);
  // プロジェクトの情報が変わるたびにリジョンを生成
  useEffect(() => {
    setRegionLayout();
  }, [project]);

  //初期表示としてaudioを格納
  useEffect(() => {
    fetchWav();
  }, []);

  useEffect(() => {
    nodes.forEach((node) => {
      const target = nodeStates.find((x) => x.id === node.id);
      if (target) {
        target.value1 = node.data().value;
      }
    });
    // console.log(src, regionPlaying, nodeStates);
  }, [nodes, isPlaying]);

  /**リジョンの持ち上げ */
  const mouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const parentWidth = (100 * e.currentTarget.clientWidth) / width;
    const currentLeft = (parentWidth * left) / 100;
    let newLeftRate = 0;
    document.onmousemove = (e) => {
      const changed = e.clientX - startX;
      const newLeft = currentLeft + changed;
      newLeftRate = (newLeft / parentWidth) * 100;
      if (newLeftRate < 0) newLeftRate = 0;
      setLeft(newLeftRate);
    };
    document.onmouseup = async () => {
      document.onmousemove = () => {};
      document.onmouseup = () => {};
      const runTime = GlobFunctions.getRunTime(project);
      const newRate = newLeftRate / 100;
      const startAt = Math.floor(runTime * newRate);
      await updateDoc(snapshot.ref, { startAt: startAt < 0 ? 0 : startAt, metastamp: new Date() });
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
        data-loading={!buffer}
        onMouseDown={mouseDown}
        style={{ left: left + "%", width: width + "%", zIndex: 1 }}
      >
        <FlexCol style={{ fontSize: 11, gap: 5 }}>
          <FlexRow style={{ fontSize: 11 }}>
            {updateState === RegionLocalUpdateState.updateNeeded && (
              <button>
                <FontAwesomeIcon icon={faDownload} />
              </button>
            )}
            {updateState === RegionLocalUpdateState.onTime && (
              <button title="リジョンは最新です">
                <FontAwesomeIcon icon={faCheckCircle} />
              </button>
            )}
          </FlexRow>
          <canvas width={4000} ref={canvasRef}></canvas>
          {src}
        </FlexCol>
      </label>
    </>
  );
};

export default Region;
