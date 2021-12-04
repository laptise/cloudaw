import { collection, DocumentData, getFirestore, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";

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

// function setValue(ref: any, props: [any, any]) {
//   const [key, value] = props;
//   if (Array.isArray(value)) {
//     ref[key] = new Array(value.length);
//     ref[key].forEach((newRef: any) => setValue(newRef, [key, value[key]]));
//   } else if (typeof value === "object") {
//     ref[key] = {};
//     setObject(ref[key], value[key]);
//   } else if (isJsonTime(value)) ref[key] = new Date(value) as any;
//   else (ref as any)[key] = value;
// }

// export function setObject(ref: any, from: object) {
//   for (const props of Object.entries(from)) {
//     setValue(ref, props);
//   }
// }

export class Project {
  constructor(data: object) {
    if (arguments.length === 1) {
      clone(data, this);
    }
  }
}

const ProjectCvt = {
  toFirestore(post: Project): DocumentData {
    return {};
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Project {
    const data = snapshot.data(options)!;
    return new Project(data);
  },
};

const projectRef = collection(getFirestore(), "project").withConverter(ProjectCvt);
