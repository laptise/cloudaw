/**プレインオブジェクトにする
 * @param src 対象
 */
export function toObject<T>(src: T): T {
  return JSON.parse(JSON.stringify(src));
}

export class TimeContext {
  countsPerBar: number;
  bar: number;
  private time: Date;
  private _count!: number;
  private _bpm!: number;
  private _milliSecond!: number;
  public milliSecondsPerBeat!: number;
  public secondsPerBeat!: number;
  constructor(countsPerBar: number, bpm: number) {
    this.countsPerBar = countsPerBar;
    this.time = new Date(0);
    this.bpm = bpm;
    this.bar = 0;
    this.count = 0;
    this.isPaused = false;
    this.milliSecond = 0;
  }
  private getNotes() {
    const value = this.time.valueOf();
    const mspb = this.milliSecondsPerBeat;
    const bar = value / mspb;
    const barRest = Number("0." + (bar.toString().split(".")[1] || "0"));
    const count = Math.floor(bar);
    const beatValue = barRest * 4;
    const beat = Math.floor(beatValue);
    const beatRest = Number("0." + (beatValue.toString().split(".")[1] || "0"));
    const milliSec = Math.floor(beatRest * 1000);
    return [count, beat, milliSec];
  }
  get bpm() {
    return this._bpm;
  }
  set bpm(v) {
    this._bpm = v;
    this.milliSecondsPerBeat = this.getCountIncreasePer();
    this.secondsPerBeat = this.milliSecondsPerBeat / 1000;
  }
  get count() {
    return this._count;
  }
  set count(v) {
    this._count = v;
    if (this.count === this.countsPerBar) {
      this._count = 0;
      this.bar++;
    }
  }
  /**何ミリ秒ごとにカウント一回か
   * @returns ミリ秒 */
  getCountIncreasePer() {
    return 60000 / this.bpm;
  }
  get milliSecond() {
    return this._milliSecond;
  }
  set milliSecond(v) {
    this._milliSecond = v;
    if (this.milliSecond >= this.milliSecondsPerBeat) {
      this._milliSecond = 0;
      this.count++;
    }
  }
  isPaused: boolean;
  reset() {
    this.bar = 0;
    this.count = 0;
    this.milliSecond = 0;
  }
  interval!: NodeJS.Timer;
  go() {
    this.interval = setInterval(() => {
      this.time = new Date(this.time.valueOf() + 10);
      const [bar, count, ms] = this.getNotes();
      this.onTick(bar, count, ms, this.time);
      // this.onTick(this.bar, this.count, this.milliSecond);
    }, 10);
  }
  puase() {
    this.isPaused = true;
    clearInterval(this.interval);
  }
  onTick(bar: number, count: number, ms: number, time: Date) {}
}
