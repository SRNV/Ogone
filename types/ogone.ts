export interface RouterBrowser {
  react: Function[];
  actualRoute: null | string;
  go: (url: string, state: any) => void;
  openDevTool?: (opts: any) => void;
}
export interface OgoneBrowser {
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
  render: { [k: string]: Function };
  contexts: { [k: string]: Function };
  components: { [k: string]: Function };
  classes: { [k: string]: any };
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
