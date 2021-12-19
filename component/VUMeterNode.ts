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
