import {
  HTMLDivElement,
} from '../../ogone.dom.d.ts';
import type {
  RouterBrowser,
  OgoneStores,
  OgoneStoreClient,
  OgoneRenderRegistry,
  OgoneContexts,
  OgoneComponentsRegistry,
  OgoneClassesRegistry,
  OgoneModules,
} from "../../ogone.main.d.ts";
export default class OgoneBase {
  // usable on browser side
  static root: boolean;
  static stores: OgoneStores = {};
  static clients: OgoneStoreClient[] = [];
  static render: OgoneRenderRegistry = {};
  static contexts: OgoneContexts = {};
  static components: OgoneComponentsRegistry = {};
  static classes: OgoneClassesRegistry = {};
  static errorPanel: HTMLDivElement | null = null;
  static warnPanel: HTMLDivElement | null = null;
  static successPanel: HTMLDivElement | null = null;
  static infosPanel: HTMLDivElement | null = null;
  static errors: number = 0;
  static firstErrorPerf: number | null = null;
  static router: RouterBrowser;
  static mod: OgoneModules = {
    '*': []
  };
  static ComponentCollectionManager: any;
  static instances: { [componentUuid: string]: any[] } = {};
  static routerReactions: Function[] = [];
  static actualRoute: string | null = null;
  // usable on Deno side
  static files: string[] = [];
  static directories: string[] = [];
  static controllers: { [key: string]: any } = {};
  static main: string = "";
  static readonly allowedTypes = [
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
  ];
  static get isDeno() {
    return typeof Deno !== "undefined"
      && Deno.chmod
  }
}
