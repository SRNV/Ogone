// @ts-nocheck
import { OnodeComponent } from "./component.ts";
import { Route } from "../.d.ts";
export interface NestedOgoneParameters {
  uuid: string;
  promise?: null | Promise<void>;
  actualRouteName?: null | string;
  actualRoute?: null | any;
  routeChanged?: boolean | null;
  locationPath?: string | null;
  historyState?: { query: Map<unknown, unknown> } | null;
  actualTemplate?: (HTMLElement | Template)[] | null;
  replacer?: HTMLElement | Template | null;
  getContext?:
    | null
    | ((opt: {
      position: NestedOgoneParameters["position"];
      getLength?: boolean;
      getText?: string;
    }) => number | { [k: string]: any })
    | any;
  type?:
    | "store"
    | "component"
    | "router"
    | "async"
    | "controller";

  isTemplate: boolean;
  isAsync: boolean;
  isAsyncNode: boolean;
  isStore: boolean;
  isRouter: boolean;
  isRoot?: boolean;
  isRemote?: boolean;
  isImported?: boolean;

  extends: string;
  key?: string;
  parentNodeKey?: string;
  name?: string;
  tree?: string;

  index: number;
  originalNode: boolean;
  level: number;
  position: number[];
  flags: any;
  original?: Template;
  component?: OnodeComponent | null;
  props: any;
  params?: any;
  parentComponent?: OnodeComponent | null;
  parentCTXId: string;
  positionInParentComponent?: number[];
  levelInParentComponent?: number;
  nodes?: (HTMLTemplateElement | Template | HTMLElement)[];
  namespace?: string;
  requirements: any;
  dependencies: any;
  routes: null | Route[];
  render?: (
    ctx: OnodeComponent,
    position?: number[],
    index?: number,
    level?: number,
  ) => HTMLTemplateElement | HTMLElement;
}
export interface Template {
  isConnected: boolean;
  isRecursiveConnected: boolean;
  parentNode: null | any;
  ogone: NestedOgoneParameters;
  firstNode: Template | any;
  lastNode: Template | any;
  context: any;
  replaceWith: any;
  nextElementSibling: any;
  insertAdjacentElement(
    position: "afterend" | "beforeend" | "afterbegin" | "beforebegin",
    node: any,
  ): void;
  removeNodes<T>(): T;
  insertElement(
    position: "afterend" | "beforeend" | "afterbegin" | "beforebegin",
    node: any,
  ): void;
}
