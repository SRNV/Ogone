export type Environment = "development" | "production" | "staging";
export type MapIndexable = { [key: string]: string };
interface Remote {
  base: string;
  path: string;
  file: string;
  item: any | null;
  parent: string;
}
interface Local {
  path: string;
  file: string;
  item: any | null;
  parent: string;
}
export interface Bundle {
  files: Local[];
  remotes: Remote[];
  datas: string[];
  render: string[];
  context: string[];
  classes: string[];
  contexts: string[];
  customElements: string[];
  components: Map<string, Component>;
  repository: { [k: string]: { [s: string]: string } };
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
  remote: Remote | null;
  for: any;
  refs: {};
  flags: [];
  file: string;
  uuid: string;
  reactive: {};
  style: string[];
  hasStore: boolean;
  modules: string[][];
  routes: null | Route[];
  esmExpressions: string;
  namespace: null | string;
  scripts: ComponentScript;
  exportsExpressions: string;
  data: { [key: string]: any };
  rootNode: XMLNodeDescription;
  imports: MapIndexable;
  requirements: [string, [string]][] | null;
  type: "router" | "component" | "store" | "async" | "controller";
  protocol: null | string;
}

interface ComponentScript {
  runtime: string;
}
export interface XMLNodeDescription {
  dna: string;
  type?: string;
  nodeType: 1 | 3 | 8;
  rawText?: string;
  rawAttrs?: string;
  hasFlag?: boolean;
  autoclosing?: boolean;
  tagName: null | string;
  dependencies: string[];
  id: null | number | string;
  nodeList: XMLNodeDescription[];
  flags: ParseFlagsOutput | null;
  childNodes: XMLNodeDescription[];
  attributes: XMLAttrsNodeDescription;
  parentNode: null | XMLNodeDescription;
  pragma: null | DOMParserPragmaDescription;
  nextElementSibling: null | XMLNodeDescription;
  previousElementSibling: null | XMLNodeDescription;
  ifelseBlock?: {
    ifFlag: MapIndexable;
    elseFlag: MapIndexable;
    elseIf: MapIndexable;
    main: string;
  };
  getInnerHTML?: () => string;
  getOuterHTML?: () => string;
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

export type DOMParserPragmaDescription = (
  idComponent: string,
  isRoot?: boolean | undefined,
  imports?: string[] | undefined,
  getId?: ((id: string) => string | null) | undefined,
) => string | any;

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
  events: ParseFlagDescription[];
  bind?: string;
}
export interface ParseFlagDescription {
  name: string;
  type: string;
  case?: string;
  filter?: null | string;
  target?: null | string;
  eval?: string | boolean;
}
export interface RouteRedirection {
  name: string;
}
export interface Route {
  path: string;
  redirect: string | RouteRedirection;
  component: string;
  name: string;
  children: Route[];
  title: string;
  once: boolean;
}
export interface LegacyDescription {
  ctx?: any;
  script?: any;
  limit?: number;
  getLength?: (opts: any) => string;
  arrayName?: string;
  callbackDeclaration?: "";
  declarationScript?: string[];
  getLengthDeclarationAfterArrayEvaluation?: "";
}

export interface TypedExpressions {
  blocks: MapIndexable;
  parentheses: MapIndexable;
  setters: MapIndexable;
  imports: { [k: string]: { [s: string]: null | string | string[] } };
  exports: { [k: string]: { [s: string]: null | string | string[] } };
  require: [];
  use: { [k: string]: { [s: string]: null | string | string[] } };
  properties: ([string, string[]])[];
  data: {};
  switch: {
    before: {
      each: null | string;
      cases: MapIndexable;
    };
    cases: string[];
    default: boolean;
  };
  reflections: string[];
}
export type Expressions = MapIndexable;
export interface CustomScriptRegExpItem {
  name?: string;
  close?: string | boolean;
  open?: string | boolean;
  reg?: RegExp;
  split?: [string, string];
  splittedId?: (value: any, expressions: any) => string;
  id?: (
    value: any,
    matches?: RegExpMatchArray,
    typedExpressions?: TypedExpressions,
    expressions?: Expressions,
  ) => string;
}
export type CustomScriptRegExpProtocol = CustomScriptRegExpItem[];

interface DOMParserIterator {
  value: number;
  node: number;
  text: number;
}
interface DOMParserExp {
  id: number | null | string;
  type: string;
  key?: string;
  nodeType: number;
  value?: string;
  rawText: string;
  rawAttrs: string;
  closing?: boolean;
  expression: string;
  autoclosing?: boolean;
  dependencies: string[];
  childNodes: DOMParserExp[];
  closingTag?: null | string;
  flags: ParseFlagsOutput | null;
  tagName: string | null | undefined;
  attributes: XMLAttrsNodeDescription;
  parentNode: null | DOMParserExpressions;
  pragma: DOMParserPragmaDescription | null;
}
interface DOMParserExpressions {
  [key: string]: DOMParserExp;
}
