import { updateDoc } from "@firebase/firestore";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { DawContext, ModalViewContext } from "../../../pages/project/[id]";
import { FlexCol } from "../../flexBox";
import Modal from "../../modal";

interface UserBadgeProps {
  addThisUser: (user: UserRecord) => void;
  user: UserRecord;
}
const UserBadge: React.FC<UserBadgeProps> = ({ user, addThisUser }) => {
  return (
    <FlexCol className="userBadge">
      <span className="email">{user.email}</span>
      <span className="name">kim</span>
      <button type="button" onClick={() => addThisUser(user)}>
        追加
      </button>
    </FlexCol>
  );
};

interface Props {
  viewState: State<boolean>;
}
const InviteModal: React.FC<Props> = ({ viewState }) => {
  const [email, setEmail] = useState("");
  const [isFailed, setIsFailed] = useState(false);
  const { projectRef, projectState } = useContext(DawContext);
  const [pjt] = projectState;
  const [target, setTarget] = useState(null as unknown as UserRecord);
  const searchUserByEmail = async () => {
    try {
      setIsFailed(false);
      const res = await fetch(`/api/fba/users/?email=${email}`).then((res) => res.json());
      setTarget(res);
    } catch {
      setIsFailed(true);
    }
  };
  const addThisUser = async (user: UserRecord) => {
    await updateDoc(projectRef, {
      collaborator: [...pjt.collaborator, user.uid],
    });
  };
  return (
    <Modal id="inviteColaboratorModal" viewState={viewState} title="コラボーレーター追加">
      <label>利用者検索</label>
      <input onInput={(e) => setEmail(e.currentTarget.value)} value={email} />
      <button onClick={searchUserByEmail} type="button">
        検索
      </button>
      {isFailed ? <div>failed</div> : target ? <UserBadge user={target} addThisUser={addThisUser} /> : <div>検索して</div>}
    </Modal>
  );
};

const SettingModal: React.FC = () => {
  const { projectState } = useContext(DawContext);
  const [pjt] = projectState;
  const { settingModalViewState } = useContext(ModalViewContext);
  const [view, setView] = settingModalViewState;
  const inviteModalView = useState(false);
  const [inviteView, setIniviteView] = inviteModalView;
  const submit = async (e: React.FormEvent) => {};
  return (
    <>
      <InviteModal viewState={inviteModalView} />
      <Modal title={"プロジェクト設定"} id="ProjectSettingModal" viewState={settingModalViewState}>
        <form onSubmit={submit}>
          <label>オーナー</label>
          <label>
            コラボレーター
            <button onClick={() => setIniviteView(true)} type="button">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </label>
          {pjt.collaborator.map((x) => (
            <span key={x}>{x}</span>
          ))}
          <button type="submit">OK</button>
        </form>
      </Modal>
    </>
  );
};
export default SettingModal;
