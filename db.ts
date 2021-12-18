// db.ts
import Dexie, { Table } from "dexie";

export interface Wav {
  name: string;
  id: string;
  projectId: string;
  buffer: ArrayBuffer;
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

  constructor() {
    super("wavs");
    this.version(1).stores({
      wavs: "id, projectId, [projectId+trackId]", // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
