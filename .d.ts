export type Environment = "development" | "production" | "staging";
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
  flags: [];
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
  file: string;
  uuid: string;
  reactive: {};
  flags: [];
  style: string[];
  routes: null | [];
  modules: string[][];
  esmExpressions: string;
  namespace: null | string;
  exportsExpressions: string;
  rootNode: XMLNodeDescription;
  imports: { [key: string]: string };
  type: "router" | "component" | "store" | "async" | "controller";
}

export interface XMLNodeDescription {
  dna: string;
  type?: string;
  nodeType: 1 | 3;
  rawText?: string;
  rawAttrs?: string;
  hasFlag?: boolean;
  autoclosing?: boolean;
  tagName: null | string;
  id: null | number | string;
  nodeList: XMLNodeDescription[];
  flags: ParseFlagsOutput | null;
  childNodes: XMLNodeDescription[];
  attributes: XMLAttrsNodeDescription;
  parentNode: null | XMLNodeDescription;
  pragma: null | DOMParserPragmaDescription;
  nextElementSibling: null | XMLNodeDescription;
  previousElementSibling: null | XMLNodeDescription;
}

/**
 * Definition for attrs
  ```ts
  [key: string]: string;
  ```
 */
export interface XMLAttrsNodeDescription {
  [key: string]: string | boolean;
}

export type DOMParserPragmaDescription = (idComponent: string, isRoot?: boolean | undefined, imports?: string[] | undefined, getId?: ((id: string) => string | null) | undefined) => string;

/**
 * can be passed as an option of a method
 * describes a <XMLNodeDescription>
 */
export interface XMLNodeDescriberDescription {
  isAsync?: boolean;
  isStore?: boolean;
  isRouter?: boolean;
  isTemplate?: boolean;
  isImported?: boolean;
  isAsyncNode?: boolean;
  isExtension?: boolean;
  nodeIsDynamic?: boolean;
}

export interface ParseFlagsOutput {
  if: string;
  then: string;
  catch: string;
  defer: string;
  style: string;
  class: string;
  else: boolean;
  elseIf: string;
  finally: string;
  await: string | boolean;
  events: ParseFlagDescription[],
}
export interface ParseFlagDescription {
  name: string;
  type: string;
  case?: string;
  filter?: null | string;
  target?: null | string;
  eval?: string | boolean;
}