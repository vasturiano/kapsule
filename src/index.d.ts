type InitOptions = object;

type PropVal = any;
type StateVal = any;

interface State {
  _rerender: () => void;
  [stateItem: string]: StateVal;
}

interface PropCfg {
  default?: PropVal;
  onChange?(newVal: PropVal, state: State, prevVal: PropVal): void;
  triggerUpdate?: boolean;
}

type MethodCfg = (state: State, ...args: any[]) => any;

export interface KapsuleCfg {
  props?: { [prop: string]: PropCfg };
  methods?: { [method: string]: MethodCfg };
  aliases?: { [propOrMethod: string]: string };
  stateInit?: (initOptions?: InitOptions) => Partial<State>;
  init?: (
    contructorItem?: any,
    state?: State,
    initOptions?: InitOptions
  ) => void;
  update: (state?: State, changedProps?: { [prop: string]: PropVal }) => void;
}

type PropGetter = () => PropVal;
type PropSetter = (val: PropVal) => KapsuleClass;
type KapsuleMethod = (...args: any[]) => any;

export declare class KapsuleClass {
  constructor(element: HTMLElement, initOptions?: InitOptions);
  resetProps(): KapsuleClass;
  [propOrMethod: string]: PropGetter | PropSetter | KapsuleMethod;
}

declare function Kapsule(cfg?: KapsuleCfg): KapsuleClass;

export default Kapsule;