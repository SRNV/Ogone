import type { OgoneInterface } from './../ogone.main.d.ts';
export const Ogone: OgoneInterface = {
  // usable on browser side
  root: false,
  stores: {},
  clients: [],
  render: {},
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
  websocketPort: 3434,
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
  get isDeno() {
    return typeof Deno !== "undefined"
      && !!Deno.chmod
  }
}
export default Ogone;