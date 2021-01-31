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

export default class Env extends Constructor {
  protected bundle: Bundle | null = null;
  public env: Environment = "development";
  public devtool?: boolean;
  public static _devtool?: boolean;
  public static _env: Environment = "development";
  protected TSXContextCreator: TSXContextCreator = new TSXContextCreator();
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
   * @name listenLSPWebsocket
   * takes no argument, this method add an event listener on the LSP websocket worker
   * connected to the IDE
   * it sends two messages
   */
  public listenLSPWebsocket(): void {
    try {
      let timeoutBeforeSendingRequests: number;
      // send open designer message to the LSP
      if (Deno.args.includes(Flags.DESIGNER)) {
        Configuration.OgoneDesignerOpened = true;
        OgoneWorkers.lspWebsocketClientWorker.postMessage({
          type: Workers.LSP_OPEN_WEBVIEW,
        })
      }
      OgoneWorkers.lspWebsocketClientWorker.addEventListener('message', (event) => {
        if (timeoutBeforeSendingRequests !== undefined) {
          clearTimeout(timeoutBeforeSendingRequests);
        }
        // this timeout fixes all the broken pipe issue
        timeoutBeforeSendingRequests = setTimeout(() => {
          const { data } = event;
          switch (data.type) {
            case Workers.LSP_UPDATE_CURRENT_COMPONENT:
              const filePath = data.data.path;
              const file = this.template(BoilerPlate.ROOT_COMPONENT_PREVENT_COMPONENT_TYPE_ERROR, {
                filePath: filePath.replace(Deno.cwd(), '@'),
              });
              // save the content of the file to overwrite
              // this allows the live edition
              MapFile.files.set(filePath, {
                content: data.data.text,
                original: Deno.readTextFileSync(data.data.path),
                path: data.data.path,
              });
              const tmpFile = Deno.makeTempFileSync({ prefix: 'ogone_boilerplate_webview', suffix: '.o3' });
              Deno.writeTextFileSync(tmpFile, file);
              this.compile(tmpFile)
                .then(async (bundle) => {
                  const application = this.renderBundle(tmpFile,
                    bundle
                  );
                  OgoneWorkers.serviceDev.postMessage({
                    type: Workers.LSP_UPDATE_SERVER_COMPONENT,
                    application,
                  })
                  OgoneWorkers.lspWebsocketClientWorker.postMessage({
                    type: Workers.LSP_CURRENT_COMPONENT_RENDERED,
                    application,
                  });
                  await this.TSXContextCreator.read(bundle, {
                    checkOnly: filePath.replace(Deno.cwd(), ''),
                  });
                })
                .then(() => {
                  Deno.remove(tmpFile);
                })
                .catch(() => {
                  Deno.remove(tmpFile);
                })
              break;
          }
        }, 50);
      });
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  public async renderBundle(entrypoint: string, bundle: Bundle): Promise<string> {
    try {
      const stylesDev = Array.from(bundle.components.entries())
        .map((
          entry: any,
        ) => {
          let result = "";
          if (entry[1].style.join("\n").trim().length) {
            result = `<style id="${entry[1].uuid}">${entry[1].style.join("\n")}</style>`;
          }
          return result;
        }).join("\n");
      const esm = Array.from(bundle.components.entries()).map((
        entry: any,
      ) => entry[1].dynamicImportsExpressions).join("\n");
      const style = stylesDev;
      const rootComponent = bundle.components.get(entrypoint);
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
        ${MapOutput.runtime}
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
            document.createElement('ogone-node')
          );`,
            render: {},
            root: bundle.components.get(entrypoint),
            destroy: {},
            nodes: {},
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
      return await this.renderBundle(Configuration.entrypoint, this.bundle);
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
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
  private recursiveRead(
    opts: { entrypoint: string; onContent: Function },
  ): void {
    try {
      if (!existsSync(opts.entrypoint)) {
        this.error("can't find entrypoint for this.recursiveRead");
      }
      if (Deno.build.os !== "windows") {
        Deno.chmodSync(opts.entrypoint, 0o777);
      }
      const stats = Deno.statSync(opts.entrypoint);
      if (stats.isFile) {
        if (Deno.build.os !== "windows") {
          Deno.chmodSync(opts.entrypoint, 0o777);
        }
        const content = Deno.readTextFileSync(opts.entrypoint);
        opts.onContent(opts.entrypoint, content);
      } else if (stats.isDirectory) {
        if (Deno.build.os !== "windows") {
          Deno.chmodSync(opts.entrypoint, 0o777);
        }
        const dir = Deno.readDirSync(opts.entrypoint);
        for (let p of dir) {
          const path = join(opts.entrypoint, p.name);
          this.recursiveRead({
            entrypoint: path,
            onContent: opts.onContent,
          });
        }
      }
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  /**
   * get the output of the application
   * including HTML CSS and JS
   */
  public async getBuild() {
    // TODO use worker instead
    this.error(`\nbuild is not yet ready.\nwaiting for a fix on the ts compiler\nplease check this issue: https://github.com/denoland/deno/issues/7054`);
  }
}
