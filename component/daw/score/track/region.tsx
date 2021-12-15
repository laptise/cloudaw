import { onSnapshot, QueryDocumentSnapshot, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { TrackContext } from ".";
import { DawContext } from "../..";
import { getNodeColRef, NodeEntity, RegionEntity } from "../../../../firebase/model";
import { contextFocus, GlobFunctions } from "../../../../utils";
import { AudioNodeGenerator, NodeContext } from "../../../../utils/audioNodes";

interface Props {
  snapshot: QueryDocumentSnapshot<RegionEntity>;
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
  const { startAt, src, duration } = snapshot.data();
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
  const [currentPosition, setCurrentPosition] = useState(0);
  const [audioNodes, setAudioNodes] = useState<AudioNode[]>([]);
  //リジョンの再生状態
  const [regionPlaying, setRegionPlaying] = useState(false);
  const [nodeStates, setNodeStates] = useState<NodeContext[]>([]);
  //リジョンの大きさ、位置を調整
  const setRegionLayout = () => {
    const runningTIme = GlobFunctions.getRunTime(project);
    const rate = (startAt.valueOf() / runningTIme) * 100;
    const width = (duration / runningTIme) * 100;
    setWidth(width);
    setLeft(rate);
  };

  const initiate = async () => {
    const buffer = await fetch(src).then((res) => res.arrayBuffer().then((buffer) => new AudioContext().decodeAudioData(buffer)));
    setBuffer(buffer);
  };

  //ボリューム調整を反映
  useEffect(() => {
    if (volumeNode) volumeNode.gain.value = currentVolume / 1000;
    // if (audio) audio.volume =
  }, [audio, currentVolume]);

  const buildAudio = () => {
    if (!src || !buffer) throw new Error();
    const ctx = new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const mapper = new AudioNodeGenerator.Mapper(ctx, source);
    const contexts = mapper.chainAll(nodes.map((x) => x.data()));
    contexts.forEach((c, index) => (c.id = nodes[index].id));
    const volume = ctx.createGain();
    volume.gain.value = currentVolume / 1000;
    mapper.lastNode.connect(volume);
    volume.connect(ctx.destination);
    setNodeStates(contexts);
    setVolumeNode(volume);
    setSrcNode(source);
    return source;
  };

  /**再生 */
  const play = () => {
    if (regionPlaying || !buffer) return;
    const srcNode = buildAudio();
    console.log(srcNode);
    if (srcNode) {
      srcNode.start(0, 5);
    }
    // src.onended = (e) => {
    //   const target = e.currentTarget as AudioBufferSourceNode;
    //   // console.log(target.context.currentTime);
    //   // console.log(new Date(0));
    //   // console.log(new Date(e.timeStamp));
    //   setCurrentPosition(e.timeStamp);
    //   // console.log(e);
    // };
    // connections();
    setRegionPlaying(true);
  };

  /**一時停止 */
  const pause = () => {
    if (!regionPlaying) return;
    srcNode?.stop();
    setRegionPlaying(false);
  };

  /**停止 */
  const stop = () => {
    if (audio) audio.currentTime = 0;
    if (!regionPlaying) return;
    else setRegionPlaying(false);
  };

  // プロジェクトの情報が変わるたびにリジョンを生成
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
    initiate();
    const nodeColRef = getNodeColRef(trackRef.ref);
    onSnapshot(nodeColRef, (snapshot) =>
      snapshot.docChanges().forEach((change) => {
        setNodes(snapshot.docs);
      })
    );
    onSnapshot(trackRef.ref, (snapshot) => {});
    const audio = new Audio(src);
    setAudio(audio);
    const detach = () => {
      onSnapshot(nodeColRef, () => {});
      onSnapshot(trackRef.ref, () => {});
    };
    return detach;
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
      await updateDoc(snapshot.ref, { startAt: startAt < 0 ? 0 : startAt });
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
        {src}
      </label>
    </>
  );
};

export default Region;
