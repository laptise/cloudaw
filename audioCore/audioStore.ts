import { QueryDocumentSnapshot, startAfter } from "@firebase/firestore";
import { db } from "../db";
import { RegionEntity, TrackEntity } from "../firebase/firestore";

export default class VUMeterNode extends AudioWorkletNode {
  private _updateIntervalInMS: number;
  private _volume: number;
  constructor(context: BaseAudioContext, updateIntervalInMS: number) {
    super(context, "vumeter", {
      numberOfInputs: 1, // 受け付ける入力の数
      numberOfOutputs: 0, // 出力の数
      channelCount: 1, // 出力のチャンネル数。今回、出力はないので0以外なら何でもよい。
      processorOptions: {
        updateIntervalInMS: updateIntervalInMS || 16.67, // vuMeterProcessor に引き渡すユーザー任意のカスタムオプション
      },
    });

    // VUMeterNodeの内部状態
    this._updateIntervalInMS = updateIntervalInMS;
    this._volume = 0;

    // vuMeterProcessor からメッセージを受け取った時のイベントコールバック
    this.port.onmessage = (event) => {
      if (event.data.volume) this._volume = event.data.volume;
    };
    this.port.start();
  }

  get updateInterval() {
    return this._updateIntervalInMS;
  }

  set updateInterval(updateIntervalInMS) {
    this._updateIntervalInMS = updateIntervalInMS;
    this.port.postMessage({ updateIntervalInMS: updateIntervalInMS }); // メッセージの送信
  }

  volume() {
    // 現在の音量を dBu 単位に変換して返す関数。ゲッターでも良かった。
    return 20 * Math.log10(this._volume) + 18;
  }
}

export class AudioManager {
  public tracks: TrackInfo = new TrackInfo(this);
  public processor: Processor = new Processor(this);
  private sourceNodes!: AudioBufferSourceNode[];
  private metronomeNode!: OscillatorNode;
  public projectId: string;
  get sampleRate() {
    return this.ctx.sampleRate;
  }
  public ctx: AudioContext;
  public bpm: number;
  constructor(projectId: string, bpm: number, sampleRate: number) {
    this.projectId = projectId;
    this.bpm = bpm;
    this.ctx = new AudioContext({ sampleRate });
  }
  public resetTracks() {
    this.tracks = new TrackInfo(this);
  }
  public async prepare(projectId: string, trackIds: string[]) {
    this.tracks = new TrackInfo(this);
    await Promise.all(
      trackIds.map(async (trackId) => {
        const newTrack = new SingleTrack(this, this.tracks, trackId);
        this.tracks.addTrack(trackId, newTrack);
        // return trackNode;
      })
    );
    await Promise.all(this.tracks.allTracks.map((track) => track.prepare()));
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
    this.tracks.allTracks.forEach((x) => x.play());
  }
  public stop() {
    this.metronomeNode.stop();
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
    const channelAudioBuffer = this.ctx.createBuffer(1, this.processor.samplePerMilliSecond * 600000, this.ctx.sampleRate);
    const channel = channelAudioBuffer.getChannelData(0);
    const res = await db.wavs
      .where({ projectId, trackId })
      .toArray()
      .then((res) => res);
    await Promise.all(
      res.map(async (wav) => {
        const duration = wav.duration * this.processor.samplePerMilliSecond;
        const start = wav.startAt === 0 ? wav.startAt : Math.round(this.processor.samplePerMilliSecond * wav.startAt);
        const end = start + duration;
        const srcChannel = wav.linear.slice(start, end);
        srcChannel.forEach((_, index) => (channel[index + start] = srcChannel[index]));
      })
    );
    this.trackBuffer.buffer = channelAudioBuffer;
    //
    const processorPath = "/audioWorklet/vuMeterProcessor.js";
    await this.ctx.audioWorklet.addModule(processorPath);
  }
  public onMeter(e: MessageEvent<any>) {}
  public play() {
    this.vuMeterNode = new VUMeterNode(this.ctx, 50);
    this.vuMeterNode.port.onmessage = (e) => this.onMeter(e);
    this.trackBuffer.connect(this.vuMeterNode);
    this.trackBuffer.connect(this.ctx.destination);
    this.trackBuffer?.start();
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
