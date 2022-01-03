import { collection, CollectionReference, doc, DocumentReference, FirestoreDataConverter } from "firebase/firestore";
import { FireBase } from ".";
import { toObject } from "../utils";
import { AudioNodeGenerator } from "../audioCore/audioNodes";
import { ref } from "firebase/storage";
export function clone(src: any, target: any) {
  for (const [key] of Object.entries(src)) {
    setValue(key, src, target);
  }
}
function setValue(key: any, src: any, target: any) {
  if (Array.isArray(src[key])) {
    target[key] = new Array(src[key].length).fill(undefined);
    target[key].forEach((_: unknown, index: number, list: any) => setValue(index, src[key], list));
  } else if (typeof src[key] === "object") {
    target[key] = {};
    clone(src[key], target[key]);
  } else if (isJsonTime(src[key])) target[key] = new Date(src[key]);
  else target[key] = src[key];
}

function isJsonTime(value: any) {
  const isString = typeof value === "string";
  const lengthSafe = value.length === 24;
  const spliterSafe = value[10] === "T" && value[23] === "Z";
  return isString && lengthSafe && spliterSafe;
}

export class BaseEntity {
  /**docId */
  id?: string;
  constructor(data?: object) {
    switch (arguments.length) {
      case 1:
        clone(data, this);
        break;
    }
  }
}

export class UserProjectEntity {
  isOwner!: boolean;
  projectRef!: DocumentReference<ProjectEntity>;
  constructor(isOwner: boolean, projectRef: DocumentReference<ProjectEntity>) {
    this.isOwner = isOwner;
    this.projectRef = projectRef;
  }
}

export class UserInfoEntity extends BaseEntity {
  name!: string;
  isLoggingIn!: boolean;
  loggedOutAt!: Date;
}

export class TrackEntity extends BaseEntity {
  name!: string;
  regions!: RegionEntity[];
  nodes!: NodeEntity[];
  volume!: number;
}

export class RegionEntity extends BaseEntity {
  src!: string;
  startAt!: number;
  duration!: number;
  timestamp!: Date;
  metastamp!: Date;
}

export class NodeEntity extends BaseEntity {
  nodeName!: string;
  order!: number;
  value!: number;
}

export class FocusEntity extends BaseEntity {
  target!: string;
}

export class ProjectEntity extends BaseEntity {
  trackList!: TrackEntity[];
  owner!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;
  collaborator!: string[];
  bar!: number;
  bpm!: number;
}

export class FocusInfo extends BaseEntity {
  target!: string;
}

export class CollaboratorEntity extends BaseEntity {
  user!: DocumentReference<UserInfoEntity>;
  color!: string;
  focusing?: string;
  isOwner?: boolean;
  displayName?: string;
}

export function dynamicConverter<T extends object>(constructor: new (data?: object) => T, exceptThisKey?: (keyof T)[]) {
  const converter: FirestoreDataConverter<T> = {
    toFirestore(data) {
      const toPost = toObject(data) as any;
      exceptThisKey?.forEach?.((keyName) => {
        delete toPost.keyName;
      });
      return toPost;
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options)!;
      for (const [key, value] of Object.entries(data)) {
        if (value?.toDate) {
          data[key] = value.toDate()?.toJSON();
        }
      }
      return new constructor(data);
    },
  };
  return converter;
}

export const ProjectConverter: FirestoreDataConverter<ProjectEntity> = {
  toFirestore(post) {
    const toPost = toObject(post);
    delete toPost.collaborator;
    return toPost;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)!;
    return new ProjectEntity(data);
  },
};

export const UserProjectConverter: FirestoreDataConverter<UserProjectEntity> = {
  toFirestore(post) {
    return { isOwner: post.isOwner, projectRef: post.projectRef };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)!;
    return new UserProjectEntity(data.isOwner, data.projectRef);
  },
};

export const getProjectsColRef = () => {
  const db = FireBase.fireStore();
  return collection(db, "project").withConverter(ProjectConverter);
};

export const getProjectDocRef = (colRef: CollectionReference<ProjectEntity>, id: string) => {
  return doc(colRef, id);
};

export const getFocusInfoColRef = (docRef: DocumentReference<ProjectEntity>) =>
  collection(docRef, "focus").withConverter(dynamicConverter(FocusInfo));

export const getCollabColRef = (docRef: DocumentReference<ProjectEntity>) =>
  collection(docRef, "collaborator").withConverter(dynamicConverter(CollaboratorEntity));

export const getTracksColRef = (docRef: DocumentReference<ProjectEntity>) =>
  collection(docRef, "tracks").withConverter(dynamicConverter(TrackEntity));

export const getRegionColRef = (docRef: DocumentReference<TrackEntity>) =>
  collection(docRef, "regions").withConverter(dynamicConverter(RegionEntity));

export const getNodeColRef = (docRef: DocumentReference<TrackEntity>) => collection(docRef, "nodes").withConverter(dynamicConverter(NodeEntity));

export const getFocusColRef = (docRef: DocumentReference<ProjectEntity>) => collection(docRef, "focus").withConverter(dynamicConverter(FocusEntity));

export const getFocusDocRef = (colRef: CollectionReference<FocusEntity>, uid: string) => doc(colRef, uid);

export const getProjectWavsRef = (docRef: DocumentReference<ProjectEntity>) => ref(FireBase.storage(), `projects/${docRef.id}`);

export const getUserInfoColRef = () => {
  const db = FireBase.fireStore();
  return collection(db, "user").withConverter(dynamicConverter(UserInfoEntity));
};

export const getUserInfoDocRef = (uid: string) => doc(getUserInfoColRef(), uid);

export const getUserProjectColRef = (docRef: DocumentReference<UserInfoEntity>) =>
  collection(docRef, "userProject").withConverter(UserProjectConverter);
