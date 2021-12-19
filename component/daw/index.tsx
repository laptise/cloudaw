import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { FlexRow } from "../flexBox";
import Head from "next/head";
import TopPannel from "./topPannel";
import Score from "./score";
import AddNewTrackModal from "./modal/addNewTrack";
import { doc, DocumentReference, getDocs, onSnapshot, QueryDocumentSnapshot } from "@firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faHome } from "@fortawesome/free-solid-svg-icons";
import SettingModal from "./modal/setting";
import Link from "next/link";
import LeftPannel from "./leftPannel";
import { CollaboratorEntity, getCollabColRef, getProjectDocRef, getProjectsColRef, getTracksColRef, TrackEntity } from "../../firebase/model";
import ContextMenu from "./contextMenu";
import { TimeContext } from "../../utils";
import { db } from "../../db";
import { AudioManager } from "../../audioCore/audioStore";

export const DawContext = createContext<DawContext>(null as any);
export const ModalViewContext = createContext<ModalViewContext>(null as any);
export const ContextMenuContext = createContext<ContextMenuContext>(null as any);
export const PlayContext = createContext<PlayContext>(null as any);

/**他ユーザーのフォーカスを描画 */
export function setFocusTarget(target: HTMLInputElement, user: QueryDocumentSnapshot<CollaboratorEntity>) {
  const { color, displayName } = user.data();
  const exists = document.querySelector(`[data-by="${user.id}"]`);
  exists?.parentElement?.removeChild(exists);
  const elm = document.createElement("div");
  const border = document.createElement("div");
  border.className = "border";
  elm.className = "focusLabel";
  border.style.borderColor = color;
  elm.dataset.by = user.id;
  elm.appendChild(border);
  target.nextSibling?.appendChild(elm);
  const badge = document.createElement("div");
  badge.className = "badge";
  const img = document.createElement("img");
  img.innerHTML = "#";
  badge.append(img);
  badge.style.backgroundColor = color;
  const name = document.createElement("span");
  name.className = "name";
  name.innerText = displayName || "unknown";
  badge.append(name);
  elm.append(badge);
}

const Daw: React.FC<ProjectProp> = ({ project, user }) => {
  const { settingModalViewState } = useContext(ModalViewContext);
  const { projectState, onPlayFireState, tracksState, playingState, timeState, timeContextState, curerntRatePositionState, audioManagerState } =
    useContext(DawContext);
  const [tracks] = tracksState;
  const [onPlayFire] = onPlayFireState;
  const { contextsState } = useContext(PlayContext);
  const [playState, setPlayState] = contextsState;
  const [currentPosition, setCurrentPosition] = curerntRatePositionState;
  const [timeContext, setTimeContext] = timeContextState;
  const [timeSet, setTimeSet] = timeState;
  const [isPlaying, setIsPlaying] = playingState;
  const projectColRef = getProjectsColRef();
  const projectRef = doc(projectColRef, project.id as string);
  const [bpm, setBpm] = useState(0);
  const tracksColRef = getTracksColRef(projectRef);
  const collabColRef = getCollabColRef(projectRef);
  const [pjt, setPjt] = projectState;
  const [settingModalView, setSettingModalView] = settingModalViewState;
  const [audioManager, setAudioManager] = audioManagerState;
  /**スナップショットリスナー追加 */
  const snapshotEvent = () => {
    const unsubscriber = [
      onSnapshot(projectRef, (doc) => {
        const data = doc.data();
        if (data) {
          setPjt(data);
          setBpm(data.bpm);
        }
      }),
      onSnapshot(tracksColRef, (snapshot) => {
        const [val, setVal] = tracksState;
        const tracks = snapshot.docs;
        const contexts: AudioContextSet[] = tracks.map((track) => {
          return {
            id: track.id,
          };
        });
        setPlayState(contexts);
        setVal(tracks);
      }),
      onSnapshot(collabColRef, (snapshot) => {
        snapshot.docs
          .filter((doc) => {
            return doc.id != user.uid;
          })
          .forEach((snapshot) => {
            const x = snapshot.data();
            const target = document.querySelector<HTMLInputElement>(`#${x.focusing}`);
            target && snapshot.id && setFocusTarget(target, snapshot);
          });
      }),
    ];
    return () => unsubscriber.forEach((fn) => fn());
  };
  useEffect(() => {}, [pjt]);
  const play = async () => {
    const manager = new AudioManager(projectRef.id, bpm, 44100);
    const { processor } = manager;
    const projectId = projectRef.id;
    const trackIds = tracks.map((track) => track.id);
    await manager.prepare(projectId, trackIds);
    setAudioManager(manager);
    manager.play();
    setIsPlaying(true);
  };

  const pause = async () => {
    audioManager?.stop();
    setIsPlaying(false);
  };

  const keyBind = () => {
    document.onkeydown = (e) => {
      if (e.code === "Space") {
        setIsPlaying(!isPlaying);
      }
    };
  };
  useEffect(() => {
    return snapshotEvent();
  }, []);

  useEffect(() => {
    //playControl
    keyBind();
    const totalLong = pjt.bar * timeContext.milliSecondsPerBeat;
    timeContext.onTick = (bar, count, ms, time) => {
      setTimeSet([bar, count, ms]);
      const currentRatePosition = time.valueOf() / totalLong;
      setCurrentPosition(currentRatePosition);
    };
    isPlaying ? timeContext.go() : timeContext.puase();
  }, [isPlaying, setIsPlaying]);

  return (
    <>
      <header onContextMenu={(e) => console.log(19878897)}>
        <div style={{ display: "flex", gap: 5 }}>
          <Link href="/" passHref>
            <button>
              <FontAwesomeIcon icon={faHome} />
            </button>
          </Link>
          <span>|</span>
          {project.name}
        </div>
        <button onClick={() => setSettingModalView(true)}>
          <FontAwesomeIcon icon={faCog} />
        </button>
      </header>
      <TopPannel pause={pause} play={play} />
      <Head>
        <title>{project.name}</title>
      </Head>
      {/* <div id="playBackCtl"></div> */}
      <FlexRow className="centerRow">
        <LeftPannel />
        <Score />
      </FlexRow>
    </>
  );
};

const DawProvider: React.FC<ProjectProp> = (props) => {
  const { user, project } = props;
  const settingModalViewState = useState(false);
  const newTrackModalViewState = useState(false);
  const contextMenuViewState = useState(false);
  const conteextGroupState = useState([] as unknown as ContextGroup[]);
  const playingState = useState(false);
  const leftState = useState(0);
  const topState = useState(0);
  const timeContextState = useState(new TimeContext(4, project.bpm));
  const tracksState = useState([] as QueryDocumentSnapshot<TrackEntity>[]);
  const projectState = useState(project);
  const timeState = useState([0, 0, 0] as TimeSet);
  const focusingTrackState = useState("");
  const curerntRatePositionState = useState(0);
  const contextsState = useState<AudioContextSet[]>([]);
  const onPlayFireState = useState<() => Promise<string>>(null as any);
  const dispatcherState = useState<() => any>(null as any);
  const audioManagerState = useState(null as any);
  return (
    <DawContext.Provider
      value={{
        audioManagerState,
        trackInfo: {},
        onPlayFireState,
        dispatcherState,
        curerntRatePositionState,
        timeContextState,
        timeState,
        playingState,
        user,
        tracksState,
        focusingTrackState,
        projectState,
        projectRef: getProjectDocRef(getProjectsColRef(), project.id as string),
      }}
    >
      <ModalViewContext.Provider value={{ settingModalViewState, newTrackModalViewState }}>
        <ContextMenuContext.Provider
          value={{ leftState, topState, contextMenuViewState: contextMenuViewState, contextMenuGroupState: conteextGroupState }}
        >
          <PlayContext.Provider value={{ contextsState }}>
            <ContextMenu />
            <AddNewTrackModal />
            <SettingModal />
            <Daw {...props} />
          </PlayContext.Provider>
        </ContextMenuContext.Provider>
      </ModalViewContext.Provider>
    </DawContext.Provider>
  );
};

export default DawProvider;
