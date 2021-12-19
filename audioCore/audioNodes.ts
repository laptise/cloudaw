import { NodeEntity } from "../firebase/firestore";

function constructNodeController(v: AudioNode) {
  if (v instanceof GainNode) return new GainNodeContext(v);
  else if (v instanceof DelayNode) return new DelayNodeContext(v);
  else throw new Error("invalid AudioNode");
}

export abstract class NodeContext {
  node: AudioNode;
  id!: string;
  get ctx() {
    return this.node.context;
  }
  constructor(node: AudioNode) {
    this.node = node;
    console.log(18);
  }
  abstract get value1();
  abstract set value1(v: number);
}

class GainNodeContext extends NodeContext {
  node!: GainNode;

  get value1() {
    return this.node.gain.value;
  }
  set value1(v) {
    this.node.gain.value = v;
  }
}

class DelayNodeContext extends NodeContext {
  node!: DelayNode;

  get value1() {
    return this.node.delayTime.value;
  }
  set value1(v) {
    this.node.delayTime.value = v;
  }
}

export namespace AudioNodeGenerator {
  export class Mapper {
    connected: AudioNode[] = [];
    ctx: AudioContext;
    lastNode!: AudioNode;
    constructor(ctx: AudioContext, src: AudioNode) {
      this.ctx = ctx;
      this.lastNode = src;
    }
    connectAll(nodeEnties: NodeEntity[]) {
      return nodeEnties.map((node) => this.connect(node));
    }
    chainAll(nodeEnties: NodeEntity[]) {
      const entities = nodeEnties.map((node) => this.connect(node));
      console.log(entities);
      return entities.map(constructNodeController);
    }
    connect(nodeEntity: NodeEntity): AudioNode {
      switch (nodeEntity.nodeName) {
        case "Gain":
          return this.connectAsGain(nodeEntity);
        case "Delay":
          return this.connectAsDelay(nodeEntity);
        default:
          throw new Error("invalid node");
      }
    }
    private connectAsDelay(nodeEntity: NodeEntity) {
      const node = this.ctx.createDelay();
      node.delayTime.value = nodeEntity.value;
      this.lastNode.connect(node);
      this.lastNode = node;
      return node;
    }
    private connectAsGain(nodeEntity: NodeEntity) {
      const node = this.ctx.createGain();
      node.gain.value = nodeEntity.value;
      this.lastNode.connect(node);
      this.lastNode = node;
      return node;
    }
  }

  export abstract class Generator {
    abstract instance(ctx: AudioContext): AudioNode;
    abstract nodeName: string;
    abstract toEntity(): NodeEntity;
  }

  export class Gain extends Generator {
    nodeName = "Gain";
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
    toEntity() {
      const entity = new NodeEntity();
      entity.nodeName = this.nodeName;
      entity.value = this.gain;
      return entity;
    }
  }

  export class Delay extends Generator {
    nodeName = "Delay";
    private _delay!: number;
    get delay() {
      return this._delay;
    }
    set delay(v) {
      this._delay = v;
    }
    instance(ctx: AudioContext) {
      const gainNode = ctx.createDelay();
      const split = ctx.createChannelSplitter(2);
      // gainNode.delayTime.value = this.gain;
      return gainNode;
    }
    toEntity() {
      const entity = new NodeEntity();
      entity.nodeName = this.nodeName;
      // entity.value = this.gain;
      return entity;
    }
  }
}

export async function getSource(buffer: AudioBuffer) {}
