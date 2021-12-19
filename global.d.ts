import { DocumentReference, QueryDocumentSnapshot } from "@firebase/firestore";
import { Dispatch, SetStateAction } from "react";
import { ProjectEntity, TrackEntity } from "./firebase/model";
import { TimeContext } from "./utils";
import { AudioNodeGenerator } from "./audioCore/audioNodes";
import { AudioManager } from "./audioCore/audioStore";
declare global {
  interface HTMLMediaElement {
    captureStream(): MediaStream;
  }
  /**User included */
  interface UserProps {
    user: UserRecord;
  }
  /**User, Project included */
  interface ProjectProp extends UserProps {
    project: ProjectEntity;
  }
  /**useState型 */
  type State<S> = [S, Dispatch<SetStateAction<S>>];

  type TimeSet = [number, number, number];

  interface AudioContextSet {
    id?: string;
    ctx?: AudioContext;
    audio?: HTMLAudioElement;
  }

  interface PlayContext {
    contextsState: State<AudioContextSet[]>;
  }

  interface TrackInfo {
    [string]: any;
  }
  interface DawContext extends UserProps {
    /**プロジェクトの情報 */
    projectState: State<ProjectEntity>;
    /**トラックリストのスナップショット */
    tracksState: State<QueryDocumentSnapshot<TrackEntity>[]>;
    /**プロジェクトレファレンス */
    projectRef: DocumentReference<ProjectEntity>;
    playingState: State<boolean>;
    timeState: State<TimeSet>;
    timeContextState: State<TimeContext>;
    curerntRatePositionState: State<number>;
    focusingTrackState: State<string>;
    dispatcherState: State<() => any>;
    onPlayFireState: State<() => Promise<string>>;
    trackInfo: TrackInfo;
  }

  /**モーダルの表示状態 */
  interface ModalViewContext {
    settingModalViewState: State<boolean>;
    newTrackModalViewState: State<boolean>;
  }

  interface ChannelProps {
    track: QueryDocumentSnapshot<TrackEntity>;
    width: number;
    setWidth(width: number): void;
  }

  interface ContextItem {
    label: string;
    action(): any;
    disabled: boolean;
    shortCut?: string;
  }

  interface ContextGroup {
    label?: string;
    items: ContextItem[];
  }
  /**コンテクストメニュー状態 */
  interface ContextMenuContext {
    /**表示状態 */
    contextMenuViewState: State<boolean>;
    leftState: State<number>;
    topState: State<number>;
    contextMenuGroupState: State<ContextGroup[]>;
  }

  interface TrackContext {
    trackState: State<TrackEntity>;
    volumeState: State<number>;
    audioNodeGeneratorsState: State<AudioNodeGenerator.Generator[]>;
    trackRef: QueryDocumentSnapshot<TrackEntity>;
  }
}
