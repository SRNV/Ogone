// @ts-nocheck
import { BCE } from "./component.ts";
import { OnodeComponent } from "./component.ts";
import { NestedOgoneParameters } from "./template.ts";
export interface RouterBrowser {
  react: Function[];
  actualRoute: null | string;
  go: (url: string, state: any) => void;
  openDevTool?: (opts: any) => void;
}
export type BranchConstructor<T> = (
  klass: typeof HTMLElement | typeof HTMLTemplateElement,
) => T;
export interface OgoneBrowser {
  run: {
    [k: string]: OnodeComponent[];
  };
  mod: {
    [k: string]: Function[];
  };
  root: boolean;
  error: (
    title: string,
    description: string,
    error: Error | TypeError | SyntaxError | { message: string },
  ) => void;
  stores: { [k: string]: { [k: string]: any } };
  clients: [
    string,
    (namespace: string, dependency: string, overwrite?: boolean) => any,
  ][];
  render: { [k: string]: NestedOgoneParameters["render"] };
  contexts: { [k: string]: Function };
  components: { [k: string]: FunctionConstructor };
  classes: {
    extends?: BranchConstructor<
      (typeof HTMLElement | typeof HTMLTemplateElement) & BCE
    >;
    component?: BranchConstructor<OgoneBrowser["classes"]["extends"]>;
    async?: BranchConstructor<OgoneBrowser["classes"]["component"]>;
    store?: BranchConstructor<OgoneBrowser["classes"]["component"]>;
    router?: BranchConstructor<OgoneBrowser["classes"]["component"]>;
  };
  errorPanel: any;
  warnPanel: any;
  successPanel: any;
  infosPanel: any;
  historyError: any;
  errors: number;
  firstErrorPerf: any;
  oscillator?: any | null;
  sound: ((opts: any) => void) | null;
  router: RouterBrowser | null;
  DevTool?: any;
  ComponentCollectionManager?: any;
}
