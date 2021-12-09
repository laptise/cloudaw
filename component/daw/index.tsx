import React, { createContext, useContext, useEffect, useState } from "react";
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

export const DawContext = createContext<DawContext>(null as any);
export const ModalViewContext = createContext<ModalViewContext>(null as any);
export const ContextMenuContext = createContext<ContextMenuContext>(null as any);

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
  const { projectState, tracksState, playingState, timeState, timeContextState } = useContext(DawContext);
  const [timeContext, setTimeContext] = timeContextState;
  const [timeSet, setTimeSet] = timeState;
  const [isPlaying, setIsPlaying] = playingState;
  const projectColRef = getProjectsColRef();
  const projectRef = doc(projectColRef, project.id as string);
  const tracksColRef = getTracksColRef(projectRef);
  const collabColRef = getCollabColRef(projectRef);
  const [pjt, setPjt] = projectState;

  const [settingModalView, setSettingModalView] = settingModalViewState;
  /**スナップショットリスナー追加 */
  const attach = () => {
    onSnapshot(projectRef, (doc) => {
      const data = doc.data();
      if (data) setPjt(data);
    });
    onSnapshot(tracksColRef, (snapshot) => {
      const [val, setVal] = tracksState;
      const tracks = snapshot.docs;
      setVal(tracks);
    });
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
    });
  };
  /**スナップショットリスナー解除 */
  const detach = () => {
    onSnapshot(projectRef, () => {});
    onSnapshot(tracksColRef, () => {});
    onSnapshot(collabColRef, () => {});
  };

  const keyBind = () => {
    document.onkeydown = (e) => {
      if (e.code === "Space") {
        setIsPlaying(!isPlaying);
      }
    };
  };
  useEffect(() => {
    attach();
    return detach;
  }, []);

  useEffect(() => {
    //playControl
    keyBind();
    const totalLong = pjt.bar * timeContext.milliSecondsPerBeat;
    timeContext.onTick = (bar, count, ms, time) => {
      setTimeSet([bar, count, ms]);
      const currentRatePosition = time.valueOf() / totalLong;

      console.log(currentRatePosition);
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
      <TopPannel />
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
  return (
    <DawContext.Provider
      value={{
        timeContextState,
        timeState,
        playingState,
        user,
        tracksState,
        projectState,
        projectRef: getProjectDocRef(getProjectsColRef(), project.id as string),
      }}
    >
      <ModalViewContext.Provider value={{ settingModalViewState, newTrackModalViewState }}>
        <ContextMenuContext.Provider
          value={{ leftState, topState, contextMenuViewState: contextMenuViewState, contextMenuGroupState: conteextGroupState }}
        >
          <ContextMenu />
          <AddNewTrackModal />
          <SettingModal />
          <Daw {...props} />
        </ContextMenuContext.Provider>
      </ModalViewContext.Provider>
    </DawContext.Provider>
  );
};

export default DawProvider;
