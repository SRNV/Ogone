import type { OgoneInterface } from './../ogone.main.d.ts';

declare function routerGo(...args: any[]): void;
export const Ogone: OgoneInterface = {
  // usable on browser side
  types: {},
  root: false,
  require: {},
  stores: {},
  clients: [],
  arrays: {},
  render: {},
  protocols: {},
  contexts: {},
  components: {},
  classes: {},
  errorPanel: null,
  warnPanel: null,
  successPanel: null,
  infosPanel: null,
  errors: 0,
  firstErrorPerf: null,
  mod: {
    '*': []
  },
  ComponentCollectionManager: null,
  instances: {},
  routerReactions: [],
  actualRoute: null,
  // usable on Deno side
  files: [],
  directories: [],
  controllers: {},
  main: '',
  allowedTypes: [
    // first component (root component)
    "app",
    // controls the location of the web page
    "router",
    // controls data of the application
    "store",
    // controls the request to the gateway
    "controller",
    // to use promise to rule the component
    "async",
    "component",
  ],
  router: {
    react: [],
    actualRoute: null,
    go: (...args) => {
      routerGo(...args);
    },
  },
  get isDeno() {
    return "Deno" in globalThis
      && !!Deno.chmod
  },
  runSync(Onode, state) {},
  async run(Onode, state): Promise<any> {},
}
export default Ogone;
