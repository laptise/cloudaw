import { getDocs, onSnapshot } from "@firebase/firestore";
import { doc, DocumentReference, QueryDocumentSnapshot } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import React, { createContext, useEffect, useState } from "react";
import { getUserFromSession } from "../../back/auth";
import { firebaseAdmin } from "../../back/firebaseAdmin";
import Daw from "../../component/daw";
import ContextMenu from "../../component/daw/contextMenu";
import AddNewTrackModal from "../../component/daw/modal/addNewTrack";
import SettingModal from "../../component/daw/modal/setting";
import {
  CollaboratorEntity,
  dynamicConverter,
  getCollabColRef,
  getProjectDocRef,
  getProjectsColRef,
  getTracksColRef,
  ProjectEntity as projectEntity,
  ProjectConverter,
  TrackEntity,
} from "../../firebase/model";
import { toObject } from "../../utils";

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
const keyPair: any = {};

export const DawContext = createContext<DawContext>(null as any);
const Project: NextPage<ProjectProp> = ({ user, project }) => {
  const settingModalViewState = useState(false);
  const newTrackModalViewState = useState(false);
  const contextMenuViewState = useState(false);
  const conteextGroupState = useState([] as unknown as ContextGroup[]);
  const projectState = useState(project);
  const leftState = useState(0);
  const topState = useState(0);
  const tracksState = useState([] as QueryDocumentSnapshot<TrackEntity>[]);
  const projectColRef = getProjectsColRef();
  const projectRef = doc(projectColRef, project.id as string);
  const tracksColRef = getTracksColRef(projectRef);
  const collabColRef = getCollabColRef(projectRef);
  /**スナップショットリスナー追加 */
  const attach = () => {
    onSnapshot(projectRef, (doc) => {
      const [pjt, setPjt] = projectState;
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
      console.log(e.metaKey);
      console.log(keyPair);
    };
  };
  useEffect(() => {
    attach();
    keyBind();
    return detach;
  }, []);

  return (
    <main id="daw" onContextMenu={(e) => e.preventDefault()}>
      <DawContext.Provider value={{ user, tracksState, projectState, projectRef: getProjectDocRef(getProjectsColRef(), project.id as string) }}>
        <ModalViewContext.Provider value={{ settingModalViewState, newTrackModalViewState }}>
          <ContextMenuContext.Provider
            value={{ leftState, topState, contextMenuViewState: contextMenuViewState, contextMenuGroupState: conteextGroupState }}
          >
            <ContextMenu />
            <AddNewTrackModal />
            <SettingModal />
            <Daw project={project} user={user} />
          </ContextMenuContext.Provider>
        </ModalViewContext.Provider>
      </DawContext.Provider>
    </main>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<ProjectProp> = async (ctx) => {
  const { id } = ctx.query;
  const project = await firebaseAdmin
    .firestore()
    .collection("project")
    .withConverter(ProjectConverter as any)
    .doc(id as string)
    .get()
    .then(async (data) => {
      const doc = data.data() as projectEntity;
      const tracksRef = data.ref.collection("tracks").withConverter(dynamicConverter(TrackEntity) as any);
      doc.trackList = (await tracksRef.get().then((res) => res.docs.map((x) => x.data()))) as any;
      console.log(doc.trackList);
      doc.id = data.id;
      return doc;
    });
  const user = await getUserFromSession(ctx);

  if (user && project) return { props: { user: toObject(user), project: toObject(project) } };
  else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};

export default Project;
