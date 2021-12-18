import { QueryDocumentSnapshot } from "@firebase/firestore";
import { RegionEntity, TrackEntity } from "../firebase/model";
import { AudioNodeGenerator } from "./audioNodes";

export class AudioStore {
  public tracks: TrackInfo = new TrackInfo();
  private ctx!: AudioContext;
  constructor() {}
  public resetTracks() {
    this.tracks = new TrackInfo();
  }
  public addTrack(trackRef: QueryDocumentSnapshot<TrackEntity>) {
    const newTrack = new SingleTrack();
    this.tracks[trackRef.id] = newTrack;
    return newTrack;
  }
  public async prepare() {
    this.ctx = new AudioContext();
    const buffers = Object.entries(this.tracks).map(([name, track]) => {});
  }
}

class TrackInfo {
  [key: string]: SingleTrack;
}
class SingleTrack {
  private _regions: QueryDocumentSnapshot<RegionEntity>[] = [];
  set regions(v: QueryDocumentSnapshot<RegionEntity>[]) {
    this._regions = v;
  }
  private _nodes: AudioNode[] = [];
  set nodes(v: AudioNode[]) {
    this._nodes = v;
  }
  chain() {}
}
