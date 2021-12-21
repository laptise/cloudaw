const SMOOTHING_FACTOR = 0.9; // 急激な音量変化の抑制のために利用
const MINIMUM_VALUE = 0.00001; // 音量の最小値を指定

// 音量計算処理を web audio api に登録する
registerProcessor(
  "vumeter", // 登録名
  class extends AudioWorkletProcessor {
    constructor(options) {
      super();
      // 音声処理に利用する変数を定義
      this._volume = 0;
      this._updateIntervalInMS = options.processorOptions.updateIntervalInMS; // VUMeterNode クラスで指定できるユーザー任意のカスタムオプション
      this._nextUpdateFrame = this._updateIntervalInMS;

      // VUMeterNode クラスのオブジェクトからメッセージを受け取った時のイベントコールバック
      this.port.onmessage = (event) => {
        if (event.data.updateIntervalInMS) this._updateIntervalInMS = event.data.updateIntervalInMS; // 音量の更新頻度を変更
      };
    }

    get intervalInFrames() {
      return (this._updateIntervalInMS / 1000) * sampleRate;
    }

    process(inputs, outputs, parameters) {
      const input = inputs[0]; // 入力される音声（ソースノード）は１つだけと想定する
      const output = outputs[0];
      if (input.length > 0) {
        const samples = input[0]; // 入力される音声のチャンネル数も１つだけ（モノラル）と想定する
        let sum = 0;
        let rms = 0;

        // 再生中のサンプルの平均を計算する
        // 一度に取得するサンプル数は128個
        for (let i = 0; i < samples.length; ++i) sum += samples[i] * samples[i];
        for (let channel = 0; channel < input.length; ++channel) {
          output[channel].set(input[channel]);
        }
        rms = Math.sqrt(sum / samples.length);
        this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR); // 急激な音量変化を抑制する

        // 音量の更新を VUMeterNode クラスに伝える
        this._nextUpdateFrame -= samples.length;
        if (this._nextUpdateFrame < 0) {
          this._nextUpdateFrame += this.intervalInFrames;
          this.port.postMessage({ volume: this._volume }); // メッセージの送信
        }
      }
      // outputs[0].set(inputs[0]);
      //VUMeterNode クラスのオブジェクトのライフタイム制御
      return true;
    }
  }
);
