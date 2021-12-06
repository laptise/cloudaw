import { DocumentReference, QueryDocumentSnapshot } from "@firebase/firestore";
import { Dispatch, SetStateAction } from "react";
import { Project, Track } from "./firebase/model";
declare global {
  /**User included */
  interface UserProps {
    user: UserRecord;
  }
  /**User, Project included */
  interface ProjectProp extends UserProps {
    project: Project;
  }
  /**useState型 */
  type State<S> = [S, Dispatch<SetStateAction<S>>];

  interface DawContext extends UserProps {
    /**プロジェクトの情報 */
    projectState: State<Project>;
    /**トラックリストのスナップショット */
    tracksState: State<QueryDocumentSnapshot<Track>[]>;
    /**プロジェクトレファレンス */
    projectRef: DocumentReference<Project>;
  }
  /**モーダルの表示状態 */
  interface ModalViewContext {
    settingModalViewState: State<boolean>;
    newTrackModalViewState: State<boolean>;
  }

  interface ContextItem {
    label: string;
    action(): any;
    disabled: boolean;
  }

  interface ContextGroup {
    label?: string;
    items: ContextItem[];
  }
  /**コンテクストメニュー状態 */
  interface ContextMenuContext {
    /**表示状態 */
    view: State<boolean>;
    groups: State<ContextGroup[]>;
  }
}
