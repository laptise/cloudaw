import { QueryDocumentSnapshot } from "@firebase/firestore";
import { db } from "../db";
import { RegionEntity, TrackEntity } from "../firebase/model";

export class AudioManager {
  public tracks: TrackInfo = new TrackInfo();
  public processor: Processor = new Processor(this);
  private sourceNodes!: AudioBufferSourceNode[];
  private metronomeNode!: OscillatorNode;
  get sampleRate() {
    return this.ctx.sampleRate;
  }
  private ctx: AudioContext;
  public bpm: number;
  constructor(bpm: number, sampleRate: number) {
    this.bpm = bpm;
    this.ctx = new AudioContext({ sampleRate });
  }
  public resetTracks() {
    this.tracks = new TrackInfo();
  }
  public addTrack(trackRef: QueryDocumentSnapshot<TrackEntity>) {
    const newTrack = new SingleTrack();
    this.tracks[trackRef.id] = newTrack;
    return newTrack;
  }
  public async prepare(projectId: string, trackIds: string[]) {
    const nodesByTracks = await Promise.all(
      trackIds.map(async (trackId) => {
        const res = await db.wavs
          .where({ projectId, trackId })
          .toArray()
          .then((res) => res);
        const sources = await Promise.all(
          res.map(async (wav) => {
            const source = this.ctx.createBufferSource();
            const duration = (wav.duration / 1000) * this.sampleRate;
            const offsetSamples = wav.startAt === 0 ? wav.startAt : Math.round(this.processor.samplePerMilliSecond * wav.startAt);
            const buffer = this.ctx.createBuffer(1, duration + offsetSamples, this.ctx.sampleRate);
            const decoded = await new AudioContext().decodeAudioData(wav.buffer);
            const targetChannel = buffer.getChannelData(0);
            const srcChannel = decoded.getChannelData(0);
            targetChannel.forEach((_, index) => (targetChannel[index + offsetSamples] = srcChannel[index]));
            source.buffer = buffer;
            return source;
          })
        );
        sources.forEach((x) => x.connect(this.ctx.destination));
        return sources;
      })
    );
    this.sourceNodes = nodesByTracks.reduce((nodes, nodesByTrack) => [...nodes, ...nodesByTrack], []);
  }
  private makeMetronome() {
    const osc = this.ctx.createOscillator();
    osc.frequency.value = 1000;
    this.metronomeNode = osc;
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.value = 0;
    return gain;
  }
  public play() {
    const metronomeVolume = this.makeMetronome();
    this.metronomeNode.start();
    setInterval(() => {
      metronomeVolume.gain.value = 0.5;
      setTimeout(() => {
        metronomeVolume.gain.value = 0;
      }, 1);
    }, this.processor.milliSecondPerBeat);
    this.sourceNodes.forEach((src) => src.start());
  }
  public stop() {
    this.metronomeNode.stop();
    this.sourceNodes.forEach((src) => src.stop());
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
