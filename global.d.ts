import { DocumentReference, QueryDocumentSnapshot } from "@firebase/firestore";
import { Dispatch, SetStateAction } from "react";
import { ProjectEntity, TrackEntity } from "./firebase/model";
declare global {
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

  interface DawContext extends UserProps {
    /**プロジェクトの情報 */
    projectState: State<ProjectEntity>;
    /**トラックリストのスナップショット */
    tracksState: State<QueryDocumentSnapshot<TrackEntity>[]>;
    /**プロジェクトレファレンス */
    projectRef: DocumentReference<ProjectEntity>;
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
}
