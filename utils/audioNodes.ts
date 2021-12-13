export namespace AudioNodeGenerator {
  export abstract class Generator {
    abstract instance(ctx: AudioContext): AudioNode;
  }
  export class Gain extends Generator {
    private _gain!: number;
    get gain() {
      return this._gain;
    }
    set gain(v) {
      this._gain = v;
    }
    instance(ctx: AudioContext) {
      const gainNode = ctx.createGain();
      gainNode.gain.value = this.gain;
      return gainNode;
    }
  }
}
