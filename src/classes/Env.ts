import HTMLDocument from '../enums/templateDocumentHTML.ts';
import { BoilerPlate } from '../enums/templateComponent.ts';
// TODO fix HMR
// use std websocket instead of deno.x one
// import { HCR } from "../../lib/hmr/index.ts";
import type { Bundle, Environment, Component } from "./../ogone.main.d.ts";
import { existsSync } from "../../utils/exists.ts";
import { join } from "../../deps/deps.ts";
import Constructor from "./Constructor.ts";
import { Configuration } from "./Configuration.ts";
import TSXContextCreator from "./TSXContextCreator.ts";
import Workers from "../enums/workers.ts";
import MapFile from "./MapFile.ts";
import OgoneWorkers from "./OgoneWorkers.ts";
import { Flags } from "../enums/flags.ts";
import MapOutput from "./MapOutput.ts";
import TSTranspiler from './TSTranspiler.ts';
import { WebSocketServer, WS } from "../../deps/ws.ts";
import HMR from "./HMR.ts";
import Ogone from "../main/OgoneBase.ts";
import ComponentBuilder from './ComponentBuilder.ts';
import Dependency from "./Dependency.ts";

export default class Env extends Constructor {
  protected bundle: Bundle | null = null;
  public env: Environment = "development";
  public devtool?: boolean;
  public static _devtool?: boolean;
  public static _env: Environment = "development";
  protected TSXContextCreator: TSXContextCreator = new TSXContextCreator();
  private timeoutBeforeSendingLSPRequests?: number;
  private timeoutBeforeSendingHMRMessage?: number;
  constructor() {
    super();
    this.devtool = Configuration.devtool;
    Env._devtool = Configuration.devtool;
  }
  /**
   * set the current bundle for the environment
   * @param {Bundle} bundle
   */
  public setBundle(bundle: Bundle): void {
    this.bundle = bundle;
  }
  /**
   * if the dev would like to use devtool or not
   * @param {boolean} hasdevtool
   */
  public setDevTool(hasdevtool: boolean): void {
    this.devtool = hasdevtool && this.env !== "production";
  }
  /**
 * set the current environment
 * ```ts
 *  this.setEnv("development" | "staging" | "production");
 * ```
 * @param env
 */
  public setEnv(env: Environment): void {
    this.env = env;
    Env._env = env;
  }

  /**
   * Compile your application by giving the path to the root component.
   * @param entrypoint path to root component
   * @param shouldBundle set the bundle of the component after compilation
   */
  public async compile(
    entrypoint: string,
    shouldBundle?: boolean,
  ): Promise<Bundle> {
    try {
      const bundle: Bundle = await this.getBundle(entrypoint);
      this.sendComponentsToLSP(bundle);
      if (shouldBundle) {
        this.setBundle(bundle);
        return bundle;
      }
      return bundle;
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  /**
   * @name sendComponentsToLSP
   * @param bundle {Bundle}
   * sending all the informations of all the components to the LSP
   */
  private sendComponentsToLSP(bundle: Bundle) {
    try {
      const components = Array.from(bundle.components.entries())
        .map(([p, c]: [string, Component]) => c) as Component[];
      components.forEach((component) => {
        const lightComponent = {
          file: component.file,
          imports: component.imports,
          context: component.context,
          modifiers: component.modifiers,
          uuid: component.uuid,
          isTyped: component.isTyped,
          requirements: component.requirements,
        };
        OgoneWorkers.lspWebsocketClientWorker.postMessage({
          type: Workers.LSP_SEND_COMPONENT_INFORMATIONS,
          component: lightComponent,
        });
      })
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  /**
   * @name listenLSPHSEServer
   */
  public async listenLSPHSEServer(port: number): Promise<void> {
    try {
      /**
       * open the server for LSP
       * HOT Scoped Editor for HSE
       */
      Configuration.OgoneDesignerOpened = true;
      OgoneWorkers.lspHSEServer.postMessage({
        type: Workers.INIT_MESSAGE_SERVICE_DEV,
        port,
      });
      this.trace('LSP HSE Server opened.')
      OgoneWorkers.lspHSEServer.addEventListener('message', async (event) => {
        const { data } = event;
        switch (data.type) {
          default: break;
          case Workers.LSP_UPDATE_CURRENT_COMPONENT:
            if (this.timeoutBeforeSendingLSPRequests) {
              clearTimeout(this.timeoutBeforeSendingLSPRequests);
            }
            this.timeoutBeforeSendingLSPRequests = setTimeout(() => this.updateLSPCurrentComponent(data), 50);
            break;
        }
      });
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  updateLSPCurrentComponent(data: any) {
    const filePath = data.path;
    const file = this.template(BoilerPlate.ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR, {
      filePath: filePath.replace(Deno.cwd(), '@'),
    });
    // save the content of the file to overwrite
    // this allows the live editor
    MapFile.files.set(filePath, {
      content: data.text,
      original: Deno.readTextFileSync(data.path),
      path: data.path,
    });
    const tmpFile = Deno.makeTempFileSync({ prefix: 'ogone_boilerplate_webview', suffix: '.o3' });
    Deno.writeTextFileSync(tmpFile, file);
    this.compile(tmpFile)
      .then(async (bundle) => {
        const application = await this.renderBundle(tmpFile,
          bundle
        );
        OgoneWorkers.serviceDev.postMessage({
          type: Workers.LSP_UPDATE_SERVER_COMPONENT,
          application,
        })
        OgoneWorkers.lspHSEServer.postMessage({
          type: Workers.LSP_CURRENT_COMPONENT_RENDERED,
        })
        this.success(`Hot Scoped Editor - updated`);
        await this.TSXContextCreator.read(bundle, {
          checkOnly: filePath.replace(Deno.cwd(), ''),
        });
        this.exposeSession();
      })
      .then(() => {
        Deno.remove(tmpFile);
      })
      .catch((error) => {
        Deno.remove(tmpFile);
      })
  }

  public async resolveAndReadText(path: string) {
    try {
      const isFile = path.startsWith("/") ||
        path.startsWith("./") ||
        path.startsWith("../") ||
        !path.startsWith("http://") ||
        !path.startsWith("https://");
      const isTsFile = isFile && path.endsWith(".ts");
      if (Deno.build.os !== "windows") {
        Deno.chmodSync(path, 0o777);
      }
      const text = Deno.readTextFileSync(path);
      return isTsFile
        ? // @ts-ignore
        (await Deno.transpileOnly({
          [path]: text,
        }, {
          sourceMap: false,
        }))[path].source
        : text;
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  public listenHMRWebsocket(): void {
    this.trace('setting HMR server');
    HMR.setServer(
      new WebSocketServer(HMR.port)
    );
    // start watching files and open websocket server
    OgoneWorkers.hmrContext.postMessage({
      type: Workers.WS_INIT,
    });
    try {
      OgoneWorkers.hmrContext.addEventListener('message', async (event) => {
        clearTimeout(this.timeoutBeforeSendingHMRMessage);
        // this timeout fixes all the broken pipe issue
        this.timeoutBeforeSendingHMRMessage = setTimeout(() => {
          if (event.data.isOgone) {
            console.clear();
            this.infos('HMR - running tasks...');
            if (event.data.path === Configuration.entrypoint
              || ComponentBuilder.mapUuid.get(event.data.path) === ComponentBuilder.mapUuid.get(Configuration.entrypoint)) {
              this.updateRootComponent(event);
            } else {
              this.updateWithTMPFile(event);
            }
          }
        }, 300);
      });
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  private updateWithTMPFile(event: MessageEvent) {
    const { data } = event;
    switch (data.type) {
      case Workers.WS_FILE_UPDATED:
        const filePath = data.path;
        const file = this.template(BoilerPlate.ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR, {
          filePath: filePath.replace(Deno.cwd(), '@'),
        });
        if (data.isOgone) {
          // save the content of the file to overwrite
          // this allows the live edition
          const content = Deno.readTextFileSync(data.path);
          MapFile.files.set(filePath, {
            content,
            original: content,
            path: data.path,
          });
          const tmpFile = Deno.makeTempFileSync({ prefix: 'ogone_boilerplate_hmr', suffix: '.o3' });
          Deno.writeTextFileSync(tmpFile, file);
          let startPerf = performance.now();
          this.compile(tmpFile)
            .then(async (bundle) => {
              console.clear();
              if (HMR.client) {
                this.infos(`HMR - sending output.`);
                HMR.postMessage({
                  output: bundle.output,
                  uuid: ComponentBuilder.mapUuid.get(data.path)
                });
                this.infos(`HMR - application updated. ~${Math.floor(performance.now() - startPerf)} ms`);
              } else {
                this.warn(`HMR - no connection...`);
              }
              await this.compile(Configuration.entrypoint, true)
                .then(async (completeBundle) => {
                  await this.sendNewApplicationToServer();
                  // start typechecking
                  await this.TSXContextCreator.read(completeBundle);
                  this.infos(`HMR - tasks completed. ~${Math.floor(performance.now() - startPerf)} ms`);
                  this.exposeSession();
                });
            })
            .then(() => {
              Deno.remove(tmpFile);
            })
            .catch(() => {
              Deno.remove(tmpFile);
            });
        }
        break;
    }
  }
  private updateRootComponent(event: MessageEvent) {
    const { data } = event;
    switch (data.type) {
      case Workers.WS_FILE_UPDATED:
        let startPerf = performance.now();
        this.compile(Configuration.entrypoint, true)
          .then(async (completeBundle) => {
            console.clear();
            if (HMR.client) {
              this.infos(`HMR - sending output.`);
              HMR.postMessage({
                output: completeBundle.output,
                uuid: ComponentBuilder.mapUuid.get(data.path)
              });
              this.infos(`HMR - application updated. ~${Math.floor(performance.now() - startPerf)} ms`);
            } else {
              this.warn(`HMR - no connection...`);
            }
            await this.sendNewApplicationToServer();
            // start typechecking
            await this.TSXContextCreator.read(completeBundle);
            this.infos(`HMR - tasks completed. ~${Math.floor(performance.now() - startPerf)} ms`);
            this.exposeSession();
          });
        break;
    }
  }
  async initServer(): Promise<void> {
    try {
      OgoneWorkers.serviceDev.postMessage({
        type: Workers.INIT_MESSAGE_SERVICE_DEV,
        application: await this.getApplication(),
        controllers: Ogone.controllers,
        Configuration: {
          ...Configuration
        },
      });
    } catch (err) {
      this.error(`EnvServer: ${err.message}
${err.stack}`);
    }
  }
  async sendNewApplicationToServer(): Promise<void> {
    try {
      OgoneWorkers.serviceDev.postMessage({
        type: Workers.UPDATE_APPLICATION,
        application: await this.getApplication(),
        controllers: Ogone.controllers,
        Configuration: {
          ...Configuration
        },
      });
    } catch (err) {
      this.error(`EnvServer: ${err.message}
${err.stack}`);
    }
  }
  public async renderBundle(entrypoint: string, bundle: Bundle): Promise<string> {
    try {
      const entries = Array.from(bundle.components.entries());
      const stylesDev = entries
        .map((
          entry: any,
        ) => {
          let result = "";
          if (entry[1].style.join("\n").trim().length) {
            result = `<style id="${entry[1].uuid}">${entry[1].style.join("\n")}</style>`;
          }
          return result;
        }).join("\n");
      const esm = entries.map((
        entry: any,
      ) => entry[1].dynamicImportsExpressions).join("\n");
      const style = stylesDev;
      const rootComponent = bundle.components.get(entrypoint);
      const dependencies = entries.map(([, component]) => component)
        .map((component) => {
          return component.deps.map((dep: Dependency) => dep.structuredOgoneRequire).join('\n');
        }).join('\n');
      // TODO fix runtime
      // TODO use Deno.emit to bundle Ogone's runtime
      //    and components
      if (rootComponent) {
        if (
          rootComponent &&
          ["router", "store", "async"].includes(rootComponent.type)
        ) {
          this.error(
            `the component provided in the entrypoint option has type: ${rootComponent.type}, entrypoint option only supports basic component`,
          );
        }
        const scriptDev = this.template(
          `
        const ___perfData = window.performance.timing;
        const ROOT_UUID = "${rootComponent.uuid}";
        const ROOT_IS_PRIVATE = ${!!rootComponent.elements.template?.attributes.private};
        const ROOT_IS_PROTECTED = ${!!rootComponent.elements.template?.attributes.protected};
        const _ogone_node_ = "o-node";

        ${MapOutput.runtime}
        {% dependencies %}
          {% promise %}
        `,
          {
            promise: esm.trim().length
              ? `
            Promise.all([
              ${esm}
            ]).then(() => {
              {% start %}
            });
          `
              : "{%start%}",
            start: `document.body.append(
            document.createElement(_ogone_node_)
          );`,
            render: {},
            root: bundle.components.get(entrypoint),
            destroy: {},
            nodes: {},
            dependencies,
          },
        );
        // in production DOM has to be
        // <template is="${rootComponent.uuid}-nt"></template>
        const DOMDev = ` `;
        let script = `
      <script type="module">
        ${await TSTranspiler.transpile(scriptDev.trim())}
      </script>`;
        let head = `
          ${style}
          ${Configuration.head || ""}`;
        let body = this.template(HTMLDocument.PAGE, {
          head,
          script,
          dom: DOMDev,
        });

        // start watching components
        // TODO fix HMR
        // use websocket
        // HCR(this.bundle);
        return body;
      } else {
        return "no root-component found";
      }
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  public async getApplication(): Promise<string> {
    try {
      if (!this.bundle) {
        throw this.error(
          "undefined bundle, please use setBundle method before accessing to the application",
        );
      }
      let result = await this.renderBundle(Configuration.entrypoint, this.bundle);
      return result;
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }

}
