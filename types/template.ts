import { OnodeComponent } from './component.ts';
export interface NestedOgoneParameters {
  key: string;
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
  parentCTXId: number;
  positionInParentComponent: number[];
  levelInParentComponent: number;
  nodes: any[];
}
export interface Template {
  isConnected: boolean;
  parentNode: null | any;
  ogone: NestedOgoneParameters;
  context: any;
  insertAdjacentElement(position: 'afterend' | 'beforeend' | 'afterbegin' | 'beforebegin', node: any): void;
}