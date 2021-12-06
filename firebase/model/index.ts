import { collection, CollectionReference, doc, DocumentReference, FirestoreDataConverter } from "firebase/firestore";
import { FireBase } from "..";
import { toObject } from "../../utils";

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

export class Track extends BaseEntity {
  name!: string;
}

export class Focus extends BaseEntity {
  target!: string;
}

export class Project extends BaseEntity {
  trackList!: Track[];
  owner!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;
  collaborator!: string[];
}

export class FocusInfo extends BaseEntity {
  target!: string;
}

export class Collaborator extends BaseEntity {
  color!: string;
  focusing!: string;
  isOwner!: boolean;
}

export function dynamicConverter<T extends object>(constructor: new (data?: object) => T) {
  const converter: FirestoreDataConverter<T> = {
    toFirestore(data) {
      return { ...toObject(data) };
    },
    fromFirestore(snapshot, options) {
      const data = snapshot.data(options)!;
      return new constructor(data);
    },
  };
  return converter;
}

export const ProjectConverter: FirestoreDataConverter<Project> = {
  toFirestore(post) {
    return { ...toObject(post) };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)!;
    return new Project(data);
  },
};

export const getProjectsColRef = () => {
  const db = FireBase.fireStore();
  return collection(db, "project").withConverter(ProjectConverter);
};

export const getProjectDocRef = (colRef: CollectionReference<Project>, id: string) => {
  return doc(colRef, id);
};

export const getFocusInfoColRef = (docRef: DocumentReference<Project>) => collection(docRef, "focus").withConverter(dynamicConverter(FocusInfo));

export const getCollabColRef = (docRef: DocumentReference<Project>) =>
  collection(docRef, "collaborator").withConverter(dynamicConverter(Collaborator));

export const getTracksColRef = (docRef: DocumentReference<Project>) => collection(docRef, "tracks").withConverter(dynamicConverter(Track));

export const getFocusColRef = (docRef: DocumentReference<Project>) => collection(docRef, "focus").withConverter(dynamicConverter(Focus));

export const getFocusDocRef = (colRef: CollectionReference<Focus>, uid: string) => doc(colRef, uid);
