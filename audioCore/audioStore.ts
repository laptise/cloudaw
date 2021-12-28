import { QueryDocumentSnapshot, startAfter } from "@firebase/firestore";
import { db } from "../db";
import { RegionEntity, TrackEntity } from "../firebase/firestore";
import { MetronomeNode } from "../worklets/metronome";
import { VUMeterNode } from "../worklets/vuMeter";

class WorkletCaller {
  parent: AudioManager;
  private path = "/audioWorklet/";
  private getPath(fileName: string) {
    return `${this.path}${fileName}.js`;
  }
  get ctx() {
    return this.parent.ctx;
  }
  constructor(parent: AudioManager) {
    this.parent = parent;
  }
  public async call(fileName: string) {
    if (process.browser) await this.ctx.audioWorklet.addModule(this.getPath(fileName));
  }
  public async vuMeter() {
    await this.call("vuMeterProcessor");
  }
  public async metronome() {
    await this.call("metronomeProcessor");
  }
}

export class AudioManager {
  public tracks = new TrackInfo(this);
  public processor = new Processor(this);
  public workletCaller = new WorkletCaller(this);
  public projectId: string;
  get sampleRate() {
    return this.ctx.sampleRate;
  }
  public ctx: AudioContext;
  public bpm: number;
  private metronomeNode!: MetronomeNode;
  constructor(projectId: string, bpm: number, sampleRate: number) {
    this.projectId = projectId;
    this.bpm = bpm;
    this.ctx = new AudioContext({ sampleRate });
  }
  public resetTracks() {
    this.tracks = new TrackInfo(this);
  }
  public async prepare(projectId: string, trackIds: string[]) {
    await Promise.all([this.workletCaller.metronome(), this.workletCaller.vuMeter()]);
    this.tracks = new TrackInfo(this);
    await Promise.all(
      trackIds.map(async (trackId) => {
        const newTrack = new SingleTrack(this, this.tracks, trackId);
        this.tracks.addTrack(trackId, newTrack);
        // return trackNode;
      })
    );
    await Promise.all(this.tracks.allTracks.map((track) => track.prepare()));
    this.metronomeNode = new MetronomeNode(this.ctx, this.bpm);
  }
  public play() {
    this.metronomeNode.connect(this.ctx.destination);
    this.tracks.allTracks.forEach((x) => x.play());
  }
  public stop() {
    this.metronomeNode.disconnect();
    this.tracks.allTracks.forEach((track) => track.stop());
  }
}

class Processor {
  parent: AudioManager;
  private get bpm() {
    return this.parent.bpm;
  }
  private get sampleRate() {
    return this.parent.sampleRate;
  }
  get samplesBySecond() {
    return this.parent.sampleRate;
  }
  get secondPerBeat() {
    return 60 / this.bpm;
  }
  get milliSecondPerBeat() {
    return 60000 / this.bpm;
  }
  get samplePerSecond() {
    return this.sampleRate;
  }
  get samplePerMilliSecond() {
    return this.sampleRate / 1000;
  }
  constructor(parent: AudioManager) {
    this.parent = parent;
  }
  getSampleCountByBarLength(beatLength: number) {
    const totalMilliSeconds = this.milliSecondPerBeat * beatLength;
    return this.samplePerMilliSecond * totalMilliSeconds;
  }
}

interface TrackTable {
  [key: string]: SingleTrack;
}

class TrackInfo {
  parent!: AudioManager;
  private trackTable: TrackTable = {};
  constructor(parent: AudioManager) {
    this.parent = parent;
  }
  getTrack(key: string) {
    if (this.trackTable[key] instanceof SingleTrack) return this.trackTable[key];
  }
  addTrack(trackId: string, track: SingleTrack) {
    this.trackTable[trackId] = track;
  }
  get allTracks() {
    return Object.entries(this.trackTable).reduce((tracks: SingleTrack[], [_, track]) => [...tracks, track], []);
  }
}

class SingleTrack {
  parent: TrackInfo;
  manager: AudioManager;
  trackBuffer!: AudioBufferSourceNode;
  vuMeterNode!: VUMeterNode;
  volumeNode!: GainNode;
  get workletCaller() {
    return this.manager.workletCaller;
  }
  id: string;
  get ctx() {
    return this.manager.ctx;
  }
  get processor() {
    return this.manager.processor;
  }
  constructor(manager: AudioManager, parent: TrackInfo, id: string) {
    this.manager = manager;
    this.parent = parent;
    this.id = id;
  }
  async prepare() {
    const projectId = this.manager.projectId;
    const trackId = this.id;
    this.trackBuffer = this.ctx.createBufferSource();
    const channelAudioBuffer = this.ctx.createBuffer(1, 100000000, this.ctx.sampleRate);
    const channel = channelAudioBuffer.getChannelData(0);
    const res = await db.wavs
      .where({ projectId, trackId })
      .toArray()
      .then((res) => res);
    await Promise.all(
      res.map(async (wav) => {
        const duration = wav.duration * this.processor.samplePerMilliSecond;
        const start = wav.startAt === 0 ? wav.startAt : Math.round(this.processor.samplePerMilliSecond * wav.startAt);
        const srcChannel = wav.linear;
        channelAudioBuffer.copyToChannel(srcChannel, 0, start);
      })
    );
    this.trackBuffer.buffer = channelAudioBuffer;
    this.vuMeterNode = new VUMeterNode(this.ctx, 50);
    this.volumeNode = this.ctx.createGain();
    this.trackBuffer.connect(this.volumeNode).connect(this.vuMeterNode).connect(this.ctx.destination);
    this.vuMeterNode.port.onmessage = (e) => this.onMeter(e);
  }
  set volume(v: number) {
    if (v !== undefined) this.volumeNode.gain.value = v / 1000;
  }
  public onMeter(e: MessageEvent<any>) {}
  public play() {
    this.trackBuffer.start();
  }
  public stop() {
    this.trackBuffer.disconnect();
    this.trackBuffer?.stop();
  }
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
