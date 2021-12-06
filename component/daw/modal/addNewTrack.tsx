import { addDoc } from "@firebase/firestore";
import React, { useContext, useState } from "react";
import { getTracksColRef, TrackEntity } from "../../../firebase/model";
import { DawContext, ModalViewContext } from "../../../pages/project/[id]";
import Modal from "../../modal";

interface Props {}
const AddNewTrackModal: React.FC<Props> = () => {
  const { projectRef } = useContext(DawContext);
  const { newTrackModalViewState } = useContext(ModalViewContext);
  const [trackNm, setTrackNm] = useState("");
  const [view, setView] = newTrackModalViewState;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setView(false);
    const newTrack = (() => {
      const item = new TrackEntity();
      item.name = trackNm;
      return item;
    })();
    await addDoc(getTracksColRef(projectRef), newTrack);
  };
  return (
    <Modal title={"新規トラック追加"} id="AddNewTrackModal" viewState={newTrackModalViewState}>
      <form onSubmit={submit}>
        <label>トラック名</label>
        <input value={trackNm} onInput={(e) => setTrackNm(e.currentTarget.value)} />
        <button type="submit">OK</button>
      </form>
    </Modal>
  );
};
export default AddNewTrackModal;
