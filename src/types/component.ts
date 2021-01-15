// @ts-nocheck
import { Template } from "./template.ts";
import type { XMLNodeDescription } from "../ogone.main.d.ts";
import { NestedOgoneParameters } from "./template.ts";
export type OnodeComponentRenderOptions = {
  callingNewComponent?: boolean;
  length: number;
};
export interface OnodeComponent {
  key: string | null;
  data: { [s: string]: any } | null;
  type: "store" | "async" | "component" | "router" | "controller";
  dependencies: null | string[];
  state: number;
  activated: boolean;
  namespace: null | string;
  store: any;
  contexts: any;
  promises: Promise<any>[];
  async: {
    then: null | any;
    catch: null | any;
    finally: null | any;
  };
  promiseResolved: boolean;
  texts: (() => any)[];
  childs: OnodeComponent[];
  parent: OnodeComponent | null;
  requirements: any;
  positionInParentComponent: number[];
  props: [string, string, ...any[]][];
  pluggedWebComponent?: any;
  pluggedWebComponentIsSync: boolean;
  startLifecycle: (params?: any, event?: Event) => any;
  initStore(): any;
  runtime(_state: number | string, ctx?: any, event?: Event): any;
  update(dependency?: string, ctx?: any): void;
  updateStore(dependency?: string): void;
  react: Function[];
  updateProps(dependency?: string): void;
  updateService(dependency?: string, value: unknown, force?: boolean): void;
  resolve: Function | null;
  dispatchAwait: Function | null;
  render(Onode: Template, opts: OnodeComponentRenderOptions): void;
  reactTo(dependency: string): void;
  renderTexts(dependency: string | boolean): void;
  parentContext(ctx: any): any;
  plugWebComponent(webcomponent: any, isSync: boolean): any;
  destroyPluggedWebcomponent(): void;
}
export interface ComponentItem {
  name: string;
  key: string;
  parentNodeKey: string;
  tree?: string[];
  isRoot: boolean;
  parent?: ComponentItem;
  ctx: OnodeComponent;
  parentCTX: OnodeComponent | null;
  type: "root" | "component" | "element" | "async" | "router" | "store";
  node?: {
    figure: XMLNodeDescription;
    element: XMLNodeDescription;
    setPosition(coord?: ComponentItem["position"]): void;
    lineToParent?: any;
  };
  position: { x: number; y: number; delta?: number };
  childs: ComponentItem[];
  getSize(): number;
}

declare class BrowserClassExtends extends HTMLElement {
  ogone: NestedOgoneParameters;
  dependencies: NestedOgoneParameters["dependencies"];
  positionInParentComponent?: number[];
  get firstNode(): Template | HTMLElement;
  get lastNode(): Template | HTMLElement;
  get extends(): string;
  get name(): string;
  get isComponent(): boolean;
  get isRecursiveConnected(): boolean;
  get isConnected(): boolean;
  get context(): {
    list: [Template];
    placeholder: HTMLTemplateElement;
    parentNode: HTMLElement;
    name: string;
  };
}
export interface BCE extends BrowserClassExtends {}
