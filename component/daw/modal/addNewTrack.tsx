import { useContext } from "react";
import { DawContext } from "..";
import Modal from "../../modal";

interface Props {}
const AddNewTrackModal: React.FC<Props> = () => {
  const { addNewModalViewState } = useContext(DawContext);
  return <Modal title={"新規トラック追加"} id="AddNewTrackModal" viewState={addNewModalViewState}></Modal>;
};
export default AddNewTrackModal;
