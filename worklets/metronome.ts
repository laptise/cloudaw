export class MetronomeNode extends AudioWorkletNode {
  constructor(context: BaseAudioContext, bpm: number) {
    super(context, "metronome", {
      processorOptions: {
        sampleRate: context.sampleRate,
        bpm,
      },
    });
    if (this.bpm) this.bpm.value = bpm;

    // VUMeterNodeの内部状態
    this.port.start();
  }

  get bpm() {
    const param = this.parameters.get("bpm");
    if (!param) throw new Error("bpm parameter not exist");
    return param;
  }
}
