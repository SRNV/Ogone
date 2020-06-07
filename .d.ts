/**
 * Definition of a bundle
  ```ts
  files: string[];
  datas: string[];
  render: string[];
  context: string[];
  classes: string[];
  contexts: string[];
  customElements: string[];
  components: Map<string, Component>;
  ```
 */
export interface Bundle {
  files: string[];
  datas: string[];
  render: string[];
  context: string[];
  classes: string[];
  contexts: string[];
  customElements: string[];
  components: Map<string, Component>;
}

/**
 * Definition of a component.
 * ```ts
  for: {};
  refs: {};
  data: {};
  scripts: {};
  imports: {};
  file: string;
  uuid: string;
  reactive: {};
  directives: [];
  style: string[];
  routes: null | [];
  modules: string[][];
  rootNode: string;
  esmExpressions: string;
  namespace: null | string;
  exportsExpressions: string;
 * ```
 */
export interface Component {
  for: {};
  refs: {};
  data: {};
  scripts: {};
  imports: {};
  file: string;
  uuid: string;
  reactive: {};
  directives: [];
  style: string[];
  routes: null | [];
  modules: string[][];
  esmExpressions: string;
  namespace: null | string;
  exportsExpressions: string;
  rootNode: XMLNodeDescription;
  type: "router" | "component" | "store" | "async" | "controller";
}

export interface XMLNodeDescription {
  dna: string;
  pragma: DOMParserPragmaDescription | null;
  nodeType: 1 | 3;
  rawText?: string;
  rawAttrs?: string;
  tagName: null | string;
  id: null | number | string;
  nodeList: XMLNodeDescription[];
  childNodes: XMLNodeDescription[];
  parentNode: null | XMLNodeDescription;
  previousElementSibling: null | XMLNodeDescription;
  nextElementSibling: null | XMLNodeDescription;
  autoclosing?: boolean;
  attributes: XMLAttrsNodeDescription;
  type?: string;
}

/**
 * Definition for attrs
  ```ts
  [key: string]: string;
  ```
 */
export interface XMLAttrsNodeDescription {
  [key: string]: string;
}

export type DOMParserPragmaDescription = (idComponent: string, isRoot?: boolean | undefined, imports?: string[] | undefined, getId?: ((id: string) => string) | undefined) => string;