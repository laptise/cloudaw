// db.ts
import Dexie, { Table } from "dexie";

export interface FxNode {
  id: string;
  name: string;
  projectId: string;
  trackId: string;
}

export interface Wav {
  name: string;
  id: string;
  projectId: string;
  linear: Float32Array;
  duration: number;
  startAt: number;
  timestamp: Date;
  metastamp: Date;
  trackId: string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  wavs!: Table<Wav>;
  fxNodes!: Table<FxNode>;

  constructor() {
    super("cloudaw");
    this.version(1).stores({
      wavs: "id, projectId, [projectId+trackId]",
      fxNodes: "id, projectId, [projectId+trackId]",
    });
  }
}

export const db = new MySubClassedDexie();
