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
  repository: { [k: string]: {[s: string]: string } };
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
  imports: { [key: string]: string };
  requirements: [string, [string]][] | null;
  type: "router" | "component" | "store" | "async" | "controller";
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
    ifFlag: {
      [k: string]: string;
    };
    elseFlag: {
      [k: string]: string;
    };
    elseIf: {
      [k: string]: string;
    };
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
) => string;

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
  blocks: { [key: string]: string };
  parentheses: { [key: string]: string };
  setters: { [key: string]: string };
  imports: {};
  exports: {};
  require: [];
  use: {};
  properties: [];
  data: {};
  switch: {
    before: {
      each: null;
      cases: {};
    };
    cases: [];
    default: false;
  };
  reflections: [];
}
