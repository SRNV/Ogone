import type Style from "./classes/css/Style.ts";


export type Environment = "development" | "production" | "staging";
export type MapIndexable = { [key: string]: string };
export interface OgoneConfiguration {
  /**
   * @property entrypoint
   * @description path to the root component, this one has to be an untyped component
   */
  entrypoint: string;

  /**
   * @property port
   * @description which port to use for development
   */
  port: number;

  /**
   * @property static
   * @description allow user to serve files to client
   */
  static?: string;

  /**
   * @property modules
   * @description path to all modules, this is usefull for the hmr
   */
  modules: string;
  /**
   * @property head
   * @description insert tags in the <head> of the html
   */
  head?: string;
  /**
   * @property build
   * @description output destination for production
   */
  build?: string;
  /**
   * @property serve
   * @description should ogone serve after building the application
   */
  serve?: boolean;
  /**
   * @property compileCSS
   * @description should ogone compile the css inside the static folder
   * requires static folder to be provided
   */
  compileCSS?: boolean;
  /**
   * @property minifyCSS
   * @description should ogone minify the CSS ? including multiple spaces, tabs erased, and new lines erased
   */
  minifyCSS?: boolean;
  /**
   * @property devtool
   * @description if you want to use devtool.
   */
  devtool?: boolean;
  /**
   * @property controllers
   * @description paths to the controllers
   */
  controllers?: string[];
  /**
   * paths to the types for tsc
   */
  types?: string[];
}
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
  mapRender: Map<string, any>;
  mapClasses: Map<string, any>;
  mapContexts: Map<string, any>;
  repository: { [k: string]: { [s: string]: string } };
  types: {
    store: boolean;
    router: boolean;
    async: boolean;
    controller: boolean;
    component: true;
  };
}

export interface Component {
  remote: Remote | null;
  isTyped: boolean;
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
  dynamicImportsExpressions: string;
  esmExpressions: string;
  namespace: null | string;
  scripts: ComponentScript;
  exportsExpressions: string;
  data: { [key: string]: any };
  rootNode: XMLNodeDescription;
  imports: MapIndexable;
  savedModuleDependencies: any;
  requirements: [string, [string]][] | null;
  type: "router" | "component" | "store" | "async" | "controller";
  protocol: null | string;
  mapStyleBundle?: Style["mapStyleBundle"];
  elements: {
    styles: XMLNodeDescription[];
    proto: XMLNodeDescription[];
    template?: XMLNodeDescription;
  };
  context: {
    data: string;
    props: string;
    protocol: string;
    protocolClass: string;
    /**
     * the tagName of the component that the component is extending
     */
    reuse: string | null;
    /**
     * engine is the end-user's configuration
     */
    engine: string[];
  };
  modifiers: {
    beforeEach: string;
    compute: string;
    /** all cases of the protocol compiled */
    cases: ModifierContext[];
    /** initial part of the script */
    default: string;
    /** all modifiers compiled */
    build?: string;
  };
}
export type ModifierContext = {
  /** the code following the token */
  value: string;
  /** the current token */
  token: string;
  /** the argument following the token */
  argument: null | string;
  /** if the modifier ends with a break statement */
  endsWithBreak: boolean;
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
  id?: null | number | string;
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
  getOuterTSX?: () => string;
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
  bundle: Bundle,
  component: Component,
  isRoot: boolean,
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
  spread: string;
  html: string;
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
  uuid: string;
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

export type hmrModuleSystemOptions = {
  variable: string;
  registry: string;
  isDefault: boolean;
  isAllAs: boolean;
  isMember: boolean;
  path: string;
};
export interface TypedExpressions {
  blocks: MapIndexable;
  parentheses: MapIndexable;
  setters: MapIndexable;
  imports: {
    [k: string]: {
      key: string;
      default: boolean;
      isComponent?: boolean;
      defaultName: string | null;
      ambient: boolean;
      allAs: boolean;
      allAsName: string | null;
      path: string;
      type?: string;
      object: boolean;
      members: ({ name: string, alias: string })[];
      value: string;
      static: (namespace: string) => string;
      dynamic: (importFn: string, namespace: string) => string;
      getHmrModuleSystem: (opts: hmrModuleSystemOptions) => string;
    }
  };
  exports: {
    [k: string]: {
      key: string;
      member: boolean;
      default: boolean;
      defaultName: string | null;
      members: ({ name: string, alias: string })[];
      path: string;
      type: "object"
      | "class"
      | "function"
      | "interface"
      | "namespace"
      | "type"
      | "all"
      | "member"
      | "default"
      value: string;
    }
  };
  require: string[];
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
  protocol?: string;
}
export type Expressions = MapIndexable;
export interface ProtocolScriptRegExpItem {
  name?: string;
  close?: string | boolean;
  open?: string | boolean;
  reg?: RegExp;
  split?: [string, string];
  pair?: boolean;
  splittedId?: (value: any, expressions: any) => string;
  id?: (
    value: any,
    matches?: RegExpMatchArray,
    typedExpressions?: TypedExpressions,
    expressions?: Expressions,
  ) => string;
}
export type ProtocolScriptRegExpList = ProtocolScriptRegExpItem[];

interface DOMParserIterator {
  value: number;
  node: number;
  text: number;
}
interface DOMParserExp {
  id: number | null | string;
  type?: string;
  key?: string;
  nodeType: number;
  value?: string;
  rawText: string;
  rawAttrs: string;
  closing?: boolean;
  expression?: string;
  autoclosing?: boolean;
  dependencies: string[];
  childNodes: DOMParserExp[];
  closingTag?: null | string;
  flags: ParseFlagsOutput | null;
  tagName: string | null | undefined;
  attributes: XMLAttrsNodeDescription;
  parentNode: null | DOMParserExp;
  pragma: DOMParserPragmaDescription | null;
  isTSX?: boolean;
  isAttrSpreadTSX?: boolean;
}
interface DOMParserExpressions {
  [key: string]: DOMParserExp;
}
export interface ProtocolScriptParserReturnType {
  value: any;
  body: any;
}
export interface ProtocolScriptParserOptions {
  data?: boolean;
  parseCases?: boolean;
  befores?: boolean;
  cjs?: boolean;
  esm?: boolean;
  reactivity?: boolean;
  onlyDeclarations?: boolean;
  casesAreLinkables?: boolean;
  beforeCases?: boolean;
  declare?: boolean;
}
export interface ForCtxDescription<T> {
  index: string;
  item: string;
  array: string;
  content: T;
  destructured?: string[];
}
export type StyleBundle = {
  value: string;
  input: string;
  mapImports: Map<string, any>;
  mapSelectors: Map<string, any>;
  mapVars: Map<string, any>;
  mapMedia: Map<string, any>;
  mapDocument: Map<string, any>;
  mapSupports: Map<string, any>;
  mapKeyframes: Map<string, any>;
  mapPreservedRules: Map<string, any>;
  tokens: any;
  component: Component;
}

interface Variable {
  name: string;
  id: string;
  value: string;
}

interface ScopeBundle {
  id: string;
  index: number;
  type: "object"
  | "class"
  | "argument-variable"
  | "argument-value"
  | "function"
  | "arrow-function"
  | "import"
  | "export"
  | "top-level"
  | "";
  key: string,
  parent: ScopeBundle | null;
  children: ScopeBundle[];
  variablesMembers: Variable[];
  dependencies: string[];
  value: string;
  file: FileBundle | null;
}

interface ModuleTransfert {
  index: number;
  type: "default" | "members";
  value: string;
  parent: ScopeBundle;
  target: ScopeBundle;
}

interface FileBundle {
  path: string;
  id: string;
  code?: string;
  root: ScopeBundle;
  mapScopes: Map<string, ScopeBundle>;
  mapExports: Map<string, ModuleTransfert>;
  mapImports: Map<string, ModuleTransfert>;
  dependencies: string[];
  type: "local" | "remote" | "";
  baseUrl: string;
  value: string;
  parent: FileBundle | null | undefined;
  tokens: {
    expressions: { [k: string]: string };
    typedExpressions: Pick<TypedExpressions, 'imports' | 'exports' | 'blocks' | 'parentheses'>;

  }
}

type SusanoOptions = { path: string; parent?: FileBundle } | { code: string, path: string; parent?: FileBundle };