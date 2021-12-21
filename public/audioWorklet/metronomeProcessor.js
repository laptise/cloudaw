const SMOOTHING_FACTOR = 0.9; // 急激な音量変化の抑制のために利用
const MINIMUM_VALUE = 0.00001; // 音量の最小値を指定

// 音量計算処理を web audio api に登録する
registerProcessor(
  "metronome", // 登録名
  class extends AudioWorkletProcessor {
    constructor(option) {
      super();
      const { bpm } = option.processorOptions;
      this.samplePerBeat = (60 / bpm) * sampleRate;
    }
    prevCounted = 0;
    prevFreq = 1000;
    d = 0;
    static get parameterDescriptors() {
      return [
        {
          name: "frequency",
          defaultValue: 440,
          minValue: 0,
          maxValue: 0.5 * sampleRate,
          automationRate: "a-rate",
        },
        { name: "bpm", defaultValue: 100, minValue: 1, maxValue: 350 },
      ];
    }
    count() {
      const toCount = currentFrame > this.prevCounted + this.samplePerBeat;
      if (toCount) {
        this.prevCounted = currentFrame;
        return true;
      } else return false;
    }
    process(inputs, outputs, parameters) {
      const [output] = outputs;
      const freqs = parameters.frequency;
      const [channel] = output;
      for (let sample = 0; sample < channel.length; sample++) {
        const freq = freqs.length > 1 ? freqs[sample] : freqs[0];
        const globTime = currentTime + sample / sampleRate;
        this.d += globTime * (this.prevFreq - freq);
        this.prevFreq = freq;
        const time = globTime * freq + this.d;
        const vibrato = 0; // Math.sin(globTime * 2 * Math.PI * 7) * 2
        channel[sample] = Math.sin(2 * Math.PI * time + vibrato);
      }
      return this.count();
    }
  }
);
