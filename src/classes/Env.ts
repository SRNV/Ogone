import HTMLDocument from '../enums/templateDocumentHTML.ts';
import { getHeaderContentTypeOf } from "../../utils/extensions-resolution.ts";
import { BoilerPlate } from '../enums/templateComponent.ts';
import type {
  Bundle,
  Environment,
  Component,
  ProductionFiles,
  ProductionFile,
} from "./../ogone.main.d.ts";
import { join, colors } from "../../deps/deps.ts";
import { existsSync } from "../../deps/deps.ts";
import { copy } from "../../deps/fs.ts";
import { walkSync } from '../../deps/walk.ts';
import Constructor from "./Constructor.ts";
import { Configuration } from "./Configuration.ts";
import TSXContextCreator from "./TSXContextCreator.ts";
import Workers from "../enums/workers.ts";
import MapFile from "./MapFile.ts";
import MapOutput from "./MapOutput.ts";
import TSTranspiler from './TSTranspiler.ts';
import { WebSocketServer } from "../../lib/websocket/index.ts";
import HMR from "./HMR.ts";
import Ogone from "../main/OgoneBase.ts";
import ComponentBuilder from './ComponentBuilder.ts';
import Dependency from "./Dependency.ts";
import Deployer from "../enums/deployer.ts";
import WebviewEngine from './WebviewEngine.ts';

export default class Env extends Constructor {
  protected bundle: Bundle | null = null;
  public env: Environment = "development";
  public devtool?: boolean;
  public static _devtool?: boolean;
  public static _env: Environment = "development";
  protected TSXContextCreator: TSXContextCreator = new TSXContextCreator();
  private timeoutBeforeSendingLSPRequests?: number;
  /**
   * the worker to run the dev server
   */
  public serviceDev = new Worker(new URL("../workers/server-dev.ts", import.meta.url).href, {
    type: "module",
    deno: true,
  });
  /**
   * the worker to watch modules for HMR
   */
  public hmrContext = new Worker(new URL("../workers/hmr-context.ts", import.meta.url).href, {
    type: "module",
    deno: true,
  });
  /**
   * the worker for
   */
  public lspWebsocketClientWorker = new Worker(new URL("../workers/lsp-websocket-client.ts", import.meta.url).href, {
    type: "module",
    deno: true,
  });
  /**
   * the worker for Otone's Hot Scoped Editor
   */
  public lspHSEServer = new Worker(new URL("../workers/lsp-hse-server.ts", import.meta.url).href, {
    type: "module",
    deno: true,
  });
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
        this.lspWebsocketClientWorker.postMessage({
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
  public async listenLSPHSEServer(): Promise<void> {
    try {
      /**
       * open the server for LSP
       * HOT Scoped Editor for HSE
       */
      Configuration.OgoneDesignerOpened = true;
      WebviewEngine.subscribe('update LSP current Component', (content: string) => {
        const data = JSON.parse(content);
        console.warn(3);
        this.updateLSPCurrentComponent(data);
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
        this.serviceDev.postMessage({
          type: Workers.LSP_UPDATE_SERVER_COMPONENT,
          application,
        });
        WebviewEngine.updateDevServerApplicationFile(application);
        this.success(`Hot Scoped Editor - updated`);
        this.exposeSession();
        await this.TSXContextCreator.read(bundle, {
          checkOnly: filePath.replace(Deno.cwd(), ''),
        });
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
    this.hmrContext.postMessage({
      type: Workers.WS_INIT,
    });
    try {
      this.hmrContext.addEventListener('message', async (event) => {
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
              if (HMR.clients.size) {
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
                  this.infos(`HMR - tasks completed. ~${Math.floor(performance.now() - startPerf)} ms`);
                  this.exposeSession();
                  // start typechecking
                  await this.TSXContextCreator.read(completeBundle);
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
            this.infos(`HMR - tasks completed. ~${Math.floor(performance.now() - startPerf)} ms`);
            this.exposeSession();
            // start typechecking
            await this.TSXContextCreator.read(completeBundle);
          });
        break;
    }
  }
  async initServer(): Promise<void> {
    try {
      this.serviceDev.postMessage({
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
      this.serviceDev.postMessage({
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
      const style = stylesDev;
      const rootComponent = bundle.components.get(entrypoint);
      const dependencies = entries.map(([, component]) => component)
        .map((component) => {
          return component.deps.map((dep: Dependency) => dep.structuredOgoneRequire).join('\n');
        }).join('\n');
      if (rootComponent) {
        const scriptDev = this.template(
          `
        const ___perfData = window.performance.timing;
        const ROOT_UUID = "${rootComponent.uuid}";
        const ROOT_IS_PRIVATE = ${!!rootComponent.elements.template?.attributes.private};
        const ROOT_IS_PROTECTED = ${!!rootComponent.elements.template?.attributes.protected};
        const _ogone_node_ = "o-node";

        ${MapOutput.runtime}
        {% dependencies %}
        {%start%}
        `,
          {
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
          <base href="/${Configuration.static}" />
          ${style}
          ${Configuration.head || ""}
          `;
        let body = this.template(HTMLDocument.PAGE, {
          head,
          script,
          dom: DOMDev,
        });
        return body;
      } else {
        return "no root-component found";
      }
    } catch (err) {
      this.error(`Env: ${err.message}
${err.stack}`);
    }
  }
  /***
   * get production files
   */
  public async renderBundleAndBuildForProduction(
    entrypoint: string,
    bundle: Bundle,
    buildPath: string): Promise<ProductionFiles> {
    try {
      const entries = Array.from(bundle.components.entries());
      const rootComponent = bundle.components.get(entrypoint);
      const cssPath = './style.css';
      const jsPath = './app.js';
      if (rootComponent) {
        /**
         * CSS File for production
         */
        const css: ProductionFile = {
          path: join(buildPath, cssPath),
          source: entries.map(([, component]: [string, Component],) => component.style.join("\n")).join(""),
        };
        const dependencies = entries.map(([, component]) => component)
        .map((component) => {
          return component.deps.map((dep: Dependency) => dep.structuredOgoneRequire).join('\n');
        }).join('\n');
        /**
         * Javascript File for production
         */
        const js: ProductionFile = {
          path: join(buildPath, jsPath),
          source: await TSTranspiler.bundleText(this.template(`
          const ROOT_UUID = "${rootComponent.uuid}";
          const ROOT_IS_PRIVATE = ${!!rootComponent.elements.template?.attributes.private};
          const ROOT_IS_PROTECTED = ${!!rootComponent.elements.template?.attributes.protected};
          const _ogone_node_ = "o-node";
          ${MapOutput.runtime}
          {% dependencies %}
          `,
            {
              render: {},
              root: bundle.components.get(entrypoint),
              destroy: {},
              nodes: {},
              dependencies,
            },
          ).trim()),
        };
        /**
         * HTML File for production
         */
        const html: ProductionFile = {
          path: join(buildPath, './index.html'),
          source: this.template(HTMLDocument.PAGE_BUILD, {
            head: `
            <link rel="stylesheet" href="${cssPath}" />
            <script src="${jsPath}" ></script>
            <base href="./static/" />
            ${Configuration.head || ""}`,
            script: ``,
            dom: `<o-node></o-node>`,
          }),
        };

        return {
          css,
          html,
          js,
          ressources: [],
        };
      } else {
        Deno.exit(1);
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
  public async build(app: ProductionFiles): Promise<void> {
    const { css, html, js, ressources } = app;
    const { blue, cyan, gray } = colors;
    let perf = performance.now();
    const start = perf;
    /**
     * copy static folder with configuration
     */
    await this.copyStaticFolder(app);
    /**
     * all the minifications
     */
    await this.minifyJS(js);
    await this.minifyCSS(css);
    /**
     * create Deno Deploy Project
     */
    if (Configuration.deploySPA) {
      await this.deploySPA(app);
    }
    /**
     * end of the minifications
     */
    await Deno.writeTextFile(html.path, html.source, { create: true });
    await Deno.writeTextFile(css.path, css.source, { create: true });
    await Deno.writeTextFile(js.path, js.source, { create: true });
    /**
     * get files stats
     */
    const statHTML = Deno.statSync(html.path);
    const statCSS = Deno.statSync(css.path);
    const statJS = Deno.statSync(js.path);
    perf = performance.now() - perf;
    const versions = gray(`
\t\t\tdeno:\t\t${Deno.version.deno}
\t\t\ttypescript:\t${Deno.version.typescript}`);
// now show the message
    this.success(`
${versions}
\t\t\thtml:\t\t${cyan(html.path)}\t${gray(`${statHTML.size} bytes`)}
\t\t\tjs:\t\t${cyan(js.path)}\t${gray(`${statJS.size} bytes`)}
\t\t\tcss:\t\t${cyan(css.path)}\t${gray(`${statCSS.size} bytes`)}`);
  }
  public async minifyCSS(css: ProductionFile): Promise<void> {
    const { blue, cyan, gray } = colors;
    let perf = performance.now();
    let message = '';
    this.infos(gray(`Loading csso from esm.sh/csso`));
    try {
      perf = performance.now();
      const csso = await import("https://esm.sh/csso");
      if (csso) {
        const { minify } = csso;
        css.source = (await minify(css.source, { restructure: false })).css;
        message = gray(` \ttook ${(performance.now() - perf).toFixed(4)} ms`);
        this.success(`style minified.${message}`);
      }
    } catch(err) {
      this.warn('Couldn\'t load csso from esm.sh/csso or something went wrong');
    }
  }
  public async minifyJS(js: ProductionFile): Promise<void> {
    const { blue, cyan, gray } = colors;
    let perf = performance.now();
    let message = '';
    this.infos(gray(`Loading terser from esm.sh/terser`));
    try {
      perf = performance.now();
      const terser = await import("https://esm.sh/terser");
      if (terser) {
        const { minify } = terser;
        js.source = (await minify(js.source, { mangle: { toplevel: true } })).code!;
        message = gray(` \ttook ${(performance.now() - perf).toFixed(4)} ms`);
        this.success(`script minified.${message}`);
      }
    } catch(err) {
      this.warn('Couldn\'t load terser from esm.sh/terser or something went wrong');
    }
  }
  private async copyStaticFolder(app: ProductionFiles): Promise<void> {
    const dest = join(Configuration.build!, 'static');
    await copy(Configuration.static!, dest);
    const files = walkSync(dest, {
      includeFiles: true,
      includeDirs: false,
    });
    for (let file of files) {
      if (!file.path.endsWith('.ts')) {
        app.ressources.push({
          path: file.path,
          source: Deno.readTextFileSync(file.path),
        });
        continue;
      }
      Deno.removeSync(file.path);
    }
  }
  public async deploySPA(app: ProductionFiles) {
    const { blue, cyan, gray } = colors;
    const dest = join(Configuration.build!, 'static')
    let perf = performance.now();
    const project = this.template(Deployer.App, {
      ressources: app.ressources,
      static: dest,
      requests: app.ressources.map((file: ProductionFile) => {
        const candidateURL = file.path.replace(Configuration.build!, '');
        return `
        case PATHNAME === '${candidateURL}':
          files['${candidateURL}'] = await (await (await fetch(new URL(".${candidateURL}", import.meta.url).href)).blob()).text();
          return new Response(files['${candidateURL}'], {
            headers: {
              "content-type": "${getHeaderContentTypeOf(file.path)[1]}; charset=UTF-8",
            },
          });
        `;
      }),
    });
    const projectPath = join(Configuration.build!, 'deploy.ts')
    await Deno.writeTextFile(projectPath, project, { create: true });
    const stats = Deno.statSync(projectPath);
    let message = gray(` \ttook ${(performance.now() - perf).toFixed(4)} ms`);
    this.success(`Deno deploy file is ready.${message}

    \t\t\tdeploy file:\t${cyan(projectPath)} ${gray(`${stats.size} bytes`)}
`);
  }
}
