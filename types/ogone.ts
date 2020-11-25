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
export type ComponentClassExtender<T> = (
  klass: typeof HTMLElement | typeof HTMLTemplateElement,
) => T;
export interface OgoneBrowser {
  setReactivity(target: Object, updateFunction: Function, parentKey?: string): Object;
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
    extends?: ComponentClassExtender<
      (typeof HTMLElement | typeof HTMLTemplateElement) & BCE
    >;
    component?: ComponentClassExtender<OgoneBrowser["classes"]["extends"]>;
    async?: ComponentClassExtender<OgoneBrowser["classes"]["component"]>;
    store?: ComponentClassExtender<OgoneBrowser["classes"]["component"]>;
    router?: ComponentClassExtender<OgoneBrowser["classes"]["component"]>;
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
