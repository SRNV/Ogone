import { OnodeComponent } from "./component.ts";
export interface NestedOgoneParameters {
  key: string;
  parentNodeKey: string;
  name?: string;
  tree?: string | string[];
  index: number;
  originalNode: boolean;
  level: number;
  position: number[];
  flags: any;
  orinal: Template;
  component: OnodeComponent;
  props: any;
  params: any;
  parentComponent: OnodeComponent;
  parentCTXId: string;
  positionInParentComponent: number[];
  levelInParentComponent: number;
  nodes: any[];
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
  insertElement(
    position: "afterend" | "beforeend" | "afterbegin" | "beforebegin",
    node: any,
  ): void;
}
