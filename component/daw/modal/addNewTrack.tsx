import { addDoc } from "@firebase/firestore";
import React, { useContext, useState } from "react";
import { DawContext } from "..";
import { getTracksColRef, Track } from "../../../firebase/model";
import Modal from "../../modal";

interface Props {}
const AddNewTrackModal: React.FC<Props> = () => {
  const { addNewModalViewState, projectRef } = useContext(DawContext);
  const [trackNm, setTrackNm] = useState("");
  const [view, setView] = addNewModalViewState;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setView(false);
    const newTrack = (() => {
      const item = new Track();
      item.name = trackNm;
      return item;
    })();
    await addDoc(getTracksColRef(projectRef), newTrack);
  };
  return (
    <Modal title={"新規トラック追加"} id="AddNewTrackModal" viewState={addNewModalViewState}>
      <form onSubmit={submit}>
        <label>トラック名</label>
        <input value={trackNm} onInput={(e) => setTrackNm(e.currentTarget.value)} />
        <button type="submit">OK</button>
      </form>
    </Modal>
  );
};
export default AddNewTrackModal;
