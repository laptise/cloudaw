import { UserInfo, UserRecord } from "firebase-admin/lib/auth/user-record";
import { addDoc, doc, DocumentReference } from "firebase/firestore";
import { getCollabColRef, getProjectsColRef, getUserInfoDocRef, getUserProjectColRef, ProjectEntity, UserInfoEntity } from "../../firebase/firestore";

/**新規プロジェクトを追加 */
export default async function addNewProject(userRef: DocumentReference<UserInfoEntity>, user: UserRecord, projectName: string) {
  const { uid } = user;
  const userInfoDocRef = getUserInfoDocRef(user.uid);
  const userProjectColRef = getUserProjectColRef(userInfoDocRef);
  const projectRef = getProjectsColRef();

  /**新規プロジェクト */
  const newProject = (() => {
    const newPjt = new ProjectEntity();
    newPjt.owner = uid;
    newPjt.name = projectName;
    newPjt.trackList = [];
    newPjt.bpm = 100;
    newPjt.bar = 64;
    return newPjt;
  })();

  /**FireBase格納後した参照 */
  const newRef = await addDoc(projectRef, newProject);

  /**自分を最初のコラボレーターとして追加 */
  await addDoc(getCollabColRef(newRef), {
    user: userRef,
    color: "red",
  });

  /**ユーザーデーターにプロジェクトを登録 */
  await addDoc(userProjectColRef, {
    isOwner: true,
    projectRef: newRef,
  });
}
