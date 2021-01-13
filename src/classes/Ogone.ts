import { Configuration } from "./Configuration.ts";
import { existsSync } from "../../utils/exists.ts";
import EnvServer from "./EnvServer.ts";
import type {
  Component,
  Route,
  OgoneConfiguration,
  XMLNodeDescription,
  HTMLOgoneElement,
  OgoneParameters,
  OnodeComponent,
  RouterBrowser,
} from "../.d.ts";
import messages from "../../docs/chore/messages.ts";
import { Flags } from "../enums/flags.ts";

type OgoneStoreClientReaction = (namespace: string, key: string, overwrite?: boolean) => boolean;
/**
 * All the reactions related to a store,
 * the first key is the namespace of the store.
 *
 */
type OgoneStoreClient = [string, OgoneStoreClientReaction];
/**
 * namespaced stores
 * saved with the namespace
 */
type OgoneStores = { [namespace: string]: {
  [data: string]: any
}};
/**
 * the ouput factory rendered by Ogone foreach dynamic elements or components
 */
type OgoneRenderFactory = (ctx: OnodeComponent, pos?: number[], i?: number, l?: number, ...args: Function[]) => HTMLOgoneElement;
/**
 * where the factories are saved with the id of the customElement
 */
type OgoneRenderRegistry = {
  [componentId: string]: OgoneRenderFactory;
}
/**
 * a function that evaluate what the end user put in a prop or a dynamic attribute or a flag
 * can return also the length of node that should be rendered if the user uses the flag --for
 */
type OgoneContext = (opts: { getText: string, position: number[], getLength: boolean }) => any;
/**
 * all the contexts available in the runtime
 */
type OgoneContexts = { [componentId: string]: OgoneContext };
/**
 * all the components available in the runtime
 * all the values of the registry are a function that should construct the runtime of the component,
 * this function is built by the compiler
 */
type OgoneComponentsRegistry = { [componentId: string]: FunctionConstructor };
/**
 * those functions will help for the extension of the customElement's constructor
 */
type OgoneClassesRegistry = Partial<Record<"app" | "async" | "store" | "controller" | "component" | "router", (construct: FunctionConstructor) => FunctionConstructor>>
/**
 * @deprecated
 * all the modules saved with their path
 * this is used for the first implementation of the hmr
 */
type OgoneModules = {
  '*': [];
  [moduleName: string]: any;
};

export type OgoneRecycleOptions = {
  injectionStyle: 'append' | 'prepend';
  id: string;
  name: string;
  component: any;
  isSync: boolean;
  extends?: string;
}
export default class Ogone extends EnvServer {
  // usable on browser side
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
  static instances: { [componentUuid: string]: any[] } = {};
  static setReactivity: (target: Object, updateFunction: Function, parentKey?: string) => Object;
  static displayError: (message: string, errorType: string, errorObject: { message: string }) => void;
  /**
   * for the flag --bind
   */
  static bindValue: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --class
   */
  static bindClass: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --html
   */
  static bindHTML: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --style
   */
  static bindStyle: (Onode: HTMLOgoneElement) => void;
  /**
   * for the flag --spread
   */
  static useSpread: (Onode: HTMLOgoneElement) => void;
  /**
   * will set the position of the node
   * using the level, assigned during the creation of the template, depending on how many ancestors has the element
   * and an index which will increase if needed into a loop
   * each element in the rendered loop has it's own index
   */
  static setPosition: (Onode: HTMLOgoneElement) => void;
  /**
   * use the dedicated render function inside Ogone.render
   * which returns all the template of the component or the dynamic node
   */
  static setNodes: (Onode: HTMLOgoneElement) => void;
  /**
   * adds a reaction to the parent component or the component
   * to keep up to data the nodes
   * renderContext is used for the updates
   */
  static setDeps: (Onode: HTMLOgoneElement) => void;
  /**
   * adds Listeners on nodes
   */
  static setEvents: (Onode: HTMLOgoneElement) => void;
  /**
   * set the context when the user uses the flags: then, catch, finally
   * the context is saved into OComponent.async
   */
  static setAsyncContext: (Onode: HTMLOgoneElement) => void;
  /**
   * to any element that has the flag --await
   */
  static setNodeAsyncContext: (Onode: HTMLOgoneElement) => void;
  /**
   * returns the new webcomponent, the instance of OComponent will save this webcomponent and synchronize itself with the webcomponent.
   */
  static recycleWebComponent: (Onode: HTMLOgoneElement, opts: OgoneRecycleOptions) => HTMLElement;
  /**
   * used inside a reaction, this will create a new component each time the route is updated, via Ogone.router.go(...)
   */
  static setActualRouterTemplate: (Onode: HTMLOgoneElement) => void;
  /**
   * this function is used inside an array.find this is why it returns a boolean.
   * true if the route matches
   */
  static routerSearch: (Onode: HTMLOgoneElement, route: Route, locationPath: string) => boolean;
  /**
   * for all RouterComponents, this function will force the use of the default modifier.
   * and save a reaction in the component. this reaction will use the functions Ogone.setActualRouterTemplate && Ogone.renderRouter
   */
  static triggerLoad: (Onode: HTMLOgoneElement) => void;
  /**
   * function called right after Ogone.setOgone
   * Ogone.setOgone is called when the customElement is created by document.createElement
   */
  static construct: (Onode: HTMLOgoneElement) => void;
  /**
   * function that will add the ogone parameters into the customElement
   * those parameters are passed right after the creation of the customElement
   * in Ogone.render
   */
  static setOgone: (Onode: HTMLOgoneElement, def: OgoneParameters) => void;
  /**
   * this function saves another function into OgoneParameters of the HTMLOgoneElement
   * ```typescript
   * Onode.ogone.methodsCandidate.push(f);
   * ```
   * the saved function will trigger when everything is ready in the HTMLOgoneElement
   */
  static saveUntilRender: (Onode: HTMLOgoneElement, f: Function) => void;
  /**
   * fake slot replacement inside the component
   * // TODO use native slot implementation
   */
  static renderSlots: (Onode: HTMLOgoneElement) => void;
  /**
   * this function call the render function of the component if it's only a basic node
   * or of the parent component if it's already a component
   * the component render function will duplicate the element using the user's --for flag
   */
  static renderContext: (Onode: HTMLOgoneElement) => boolean;
  /**
   * all the instructions involved in the rendering of the components or dynamic nodes
   */
  static renderingProcess: (Onode: HTMLOgoneElement) => void;
  /**
   * all the instructions involved in the implementation of the router.
   * this will use a HTMLSectionElement and alays replace it's innerHTML
   */
  static renderRouter: (Onode: HTMLOgoneElement) => void;
  /**
   * start the store component's lifeCycle and remove all nodes of the store component
   * ends by removing the HTMLOgoneElement
   * throws if the namespace doesn't match with the namespace inside the store component
   */
  static renderStore: (Onode: HTMLOgoneElement) => void;
  /**
   * instructions for the async components
   */
  static renderAsync: (Onode: HTMLOgoneElement, shouldReportToParent: boolean) => void;
  /**
   * rendering instructions for the basic components inside an async component context
   */
  static renderComponent: (Onode: HTMLOgoneElement) => void;
  /**
   * rendering instructions for the router components inside an async component context
   */
  static renderAsyncRouter: (Onode: HTMLOgoneElement) => void;
  /**
   * rendering instructions for the store components inside an async component context
   */
  static renderAsyncStores: (Onode: HTMLOgoneElement) => void;
  /**
   * rendering instructions for async components inside an async component context
   */
  static renderAsyncComponent: (Onode: HTMLOgoneElement) => void;
  /**
   * global instructions for the rendering of the HTMLOgoneElement
   * will render all the dynamic textnodes and replace all the slots elements
   */
  static renderNode: (Onode: HTMLOgoneElement) => void;
  /**
   * recursive insertion, this function is involved into the loops rendering
   */
  static insertElement: (Onode: HTMLOgoneElement, position: "beforebegin" | "afterbegin" | "beforeend" | "afterend", el: HTMLElement) => void;
  /**
   * will remove all nodes of the component
   */
  static removeNodes: (Onode: HTMLOgoneElement) => void;
  /**
   * will destroy the component and use the case 'destroy'
   */
  static destroy: (Onode: HTMLOgoneElement) => void;

  // usable on Deno side
  static files: string[] = [];
  static directories: string[] = [];
  static controllers: { [key: string]: any } = {};
  static main: string = "";
  public readonly contributorMessage: { [k: string]: string } = messages;
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
  constructor(opts: OgoneConfiguration) {
    super();
    try {
      if (!opts) {
        this.error("run method is expecting for 1 argument, got 0.");
      }
      Configuration.setConfig(opts);
      Ogone.main = `${Deno.cwd()}${Configuration.entrypoint}`;
      // message for contributions, ideas, issues and any help.
      if (Deno.args.includes(Flags.RELEASE)) {
        Object.entries(this.contributorMessage)
          .map(([version, message]: any) => this.message(`[${version}] ${message}`))
      }

      if (opts.build) {
        if (!existsSync(opts.build)) {
          Deno.mkdirSync(opts.build);
        }
        if (Deno.build.os !== "windows") {
          Deno.chmodSync(opts.build, 0o777);
        }
        const stats = Deno.statSync(opts.build);
        if (stats.isFile) {
          this.error(
            `build: build destination should be a directory. \n\tinput: ${opts.build}`,
          );
        }
        //start compilation of o3 files
        this.setEnv("production");
        this.setDevTool(false);
        this.compile(Configuration.entrypoint, true)
          .then(async () => {
            //start compilation of o3 files
            const b = await this.getBuild();
            /*
            TODO use workers for build
            const application = `${opts.build}/index.html`;
            Deno.writeTextFileSync(application, b as string);
            this.success(
              `your application successfully rendered. ${application}`,
            );
            if (opts.serve) {
              this.runService(application, server, opts.port);
            } else {
              server.close();
              Deno.exit();
            }
            */
          }).then(() => {
            // message for any interested developer.
            this.infos('Love Ogone\'s project ? Join the discord here: https://discord.gg/gCnGzh2wMc');
          });
      } else {
        //start compilation of o3 files
        this.setDevTool(Configuration.devtool as boolean);
        this.listenLSPWebsocket();
        this.compile(Configuration.entrypoint, true)
          .then(() => {
            // Ogone is now ready to serve
            this.startDevelopment();
          }).then(() => {
            // message for any interested developer.
            this.infos('Love Ogone\'s project ? Join the discord here: https://discord.gg/gCnGzh2wMc');
          });
      }
    } catch (err) {
      this.error(`Ogone: ${err.message}`);
    }
  }
}
