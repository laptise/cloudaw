import { QueryDocumentSnapshot } from "@firebase/firestore";
import dynamic from "next/dynamic";

export default class VUMeterNode extends AudioWorkletNode {
  _updateIntervalInMS: any;
  _volume: any;
  constructor(context: BaseAudioContext, updateIntervalInMS: any) {
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

// import VUMeterNode from "../component/VUMeterNode";
import { db } from "../db";
import { RegionEntity, TrackEntity } from "../firebase/model";
export class AudioManager {
  public tracks: TrackInfo = new TrackInfo(this);
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
    this.tracks = new TrackInfo(this);
  }
  public async prepare(projectId: string, trackIds: string[]) {
    this.tracks = new TrackInfo(this);
    await Promise.all(
      trackIds.map(async (trackId) => {
        const newTrack = new SingleTrack(this, this.tracks);
        const trackNode = this.ctx.createBufferSource();
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
            trackNode.buffer = channelAudioBuffer;
          })
        );
        //
        if (process.browser) {
          const processorPass = "/audioWorklet/vuMeterProcessor.js";
          await this.ctx.audioWorklet.addModule(processorPass);
          const node = new VUMeterNode(this.ctx, 25);
          trackNode.connect(node);
          node.port.onmessage = (e) => {
            console.log(e.data.volume);
          };
        }
        //
        trackNode.connect(this.ctx.destination);
        newTrack.trackBuffer = trackNode;
        this.tracks.addTrack(trackId, newTrack);
        return trackNode;
      })
    );
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
  constructor(manager: AudioManager, parent: TrackInfo) {
    this.manager = manager;
    this.parent = parent;
  }
  public play() {
    this.trackBuffer?.start();
  }
  public stop() {
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
