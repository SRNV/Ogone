import { Configuration } from "./Configuration.ts";
import { serve } from "../../deps/deps.ts";
import { existsSync } from "../../utils/exists.ts";
import EnvServer from "./EnvServer.ts";
import type { Component, OgoneConfiguration, XMLNodeDescription } from "../.d.ts";
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
type OgoneRenderFactory = (ctx: Component, pos: number[], i: number, l: number, ...args: Function[]) => XMLNodeDescription;
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
type OgoneComponentsRegistry = { [componentId: string]: Function };
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
export default class Ogone extends EnvServer {
  // usable on browser side
  static stores: OgoneStores = {};
  static clients: OgoneStoreClient[] = [];
  static render: OgoneRenderRegistry = {};
  static contexts: OgoneContexts = {};
  static components: OgoneComponentsRegistry = {};
  static classes: OgoneClassesRegistry = {};
  static errorPanel: XMLNodeDescription | null = null;
  static warnPanel: XMLNodeDescription | null = null;
  static successPanel: XMLNodeDescription | null = null;
  static infosPanel: XMLNodeDescription | null = null;
  static errors: number = 0;
  static firstErrorPerf: number | null = null;
  static mod: OgoneModules = {
    '*': []
  };
  static instances: { [componentUuid: string]: any[] } = {};
  static bindValue: any;
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
