import { ref } from "@firebase/storage";
import { FireBase } from ".";

/**プロジェクトのWav保管庫の参照取得 */
export const getProjectWavStorageRef = (proejctId: string) => ref(FireBase.storage(), "projects/" + proejctId);
