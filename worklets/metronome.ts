export class MetronomeNode extends AudioWorkletNode {
  private _volume: number;
  constructor(context: BaseAudioContext, bpm: number) {
    super(context, "metronome", {
      processorOptions: {
        sampleRate: context.sampleRate,
        bpm,
      },
    });

    // VUMeterNodeの内部状態
    this._volume = 0;

    // vuMeterProcessor からメッセージを受け取った時のイベントコールバック
    this.port.onmessage = (event) => {
      if (event.data.volume) this._volume = event.data.volume;
    };
    this.port.start();
  }

  get bpm() {
    return this.parameters.get("bpm");
  }
}
