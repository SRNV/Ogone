import { browserBuild, template } from "./../../src/browser/readfiles.ts";
import { HCR } from "../hmr/index.ts";
import Ogone from "./../../src/ogone/index.ts";
import compile from "./../../src/ogone/compilation/index.ts";
import { Bundle, Environment } from "./../../.d.ts";
import { existsSync } from "../../utils/exists.ts";
import { join } from 'https://raw.githubusercontent.com/denoland/deno/master/std/path/mod.ts';
export default abstract class Env {
  private static bundle: Bundle;
  public static env: Environment = "development";
  public static devtool: boolean = Ogone.config.devtool;
  constructor(opts: any) {
    Env.bundle = opts.bundle;
  }

  /**
   * set the current bundle for the environment
   * @param {Bundle} bundle
   */
  public static setBundle(bundle: Bundle): void {
    Env.bundle = bundle;
  }
  /**
   * if the dev would like to use devtool or not
   * @param {boolean} hasdevtool
   */
  public static setDevTool(hasdevtool: boolean): void {
    Env.devtool = hasdevtool && Env.env !== 'production';
  }
  /**
 * set the current environment
 * ```ts
 *  Env.setEnv("development" | "staging" | "production");
 * ```
 * @param env
 */
  public static setEnv(env: Environment): void {
    Env.env = env;
  }

  /**
   * Compile your application by giving the path to the root component.
   * @param entrypoint path to root component
   * @param shouldBundle set the bundle of the component after compilation
   */
  public static async compile(
    entrypoint: string,
    shouldBundle?: boolean,
  ): Promise<any> {
    const bundle: Bundle = await compile(entrypoint);
    if (shouldBundle) {
      Env.setBundle(bundle);
      return bundle;
    } else {
      return bundle;
    }
  }
  public static get application(): string {
    const stylesDev = Array.from(Env.bundle.components.entries())
      .map((
        entry: any,
      ) => {
        let result = "";
        if (entry[1].style.join("\n").trim().length) {
          result = `<style id="${entry[1].uuid}">
            ${entry[1].style.join("\n")}
          </style>`;
        }
        return result;
      }).join("\n");
    const esm = Array.from(Env.bundle.components.entries()).map((
      entry: any,
    ) => entry[1].esmExpressions).join("\n");

    const style = stylesDev;
    const rootComponent = Env.bundle.components.get(Ogone.config.entrypoint);
    if (rootComponent) {
      if (
        rootComponent &&
        ["router", "store", "async"].includes(rootComponent.type)
      ) {
        const RootNodeTypeErrorException = new TypeError(
          `[Ogone] the component provided in the entrypoint option has type: ${rootComponent.type}, entrypoint option only supports normal component`,
        );
        throw RootNodeTypeErrorException;
      }
      const scriptDev = `
        const ___perfData = window.performance.timing;

        ${browserBuild(Env.env === 'production', {
        hasDevtool: Env.devtool,
      })}
        ${Env.bundle.datas.join("\n")}
        ${Env.bundle.contexts.reverse().join("\n")}
        ${Env.bundle.render.join("\n")}
        ${Env.bundle.classes.reverse().join("\n")}
        ${Env.bundle.customElements.join("\n")}
        Promise.all([
          ${esm}
        ]).then(() => {
          document.body.append(
            document.createElement("template", {
              is: "${rootComponent.uuid}-nt",
            })
          );

          // debug tools
          const ___connectTime = ___perfData.responseEnd - ___perfData.requestStart;
          const ___renderTime = ___perfData.domComplete - ___perfData.domLoading;
          const ___pageLoadTime = ___perfData.loadEventEnd - ___perfData.navigationStart;
          console.log('[Ogone] server response', ___connectTime, 'ms');
          console.log('[Ogone] app render time', ___renderTime, 'ms');
          console.log('[Ogone] page load time', ___pageLoadTime, 'ms');
        });
        `;
      // in production DOM has to be
      // <template is="${rootComponent.uuid}-nt"></template>
      const DOMDev = ` `;
      let head = `
          ${style}
          ${Ogone.config.head || ""}
          <script type="module">
            ${scriptDev.trim()}
          </script>`;
      let body = template
        .replace(/%%head%%/, head)
        .replace(/%%dom%%/, DOMDev);

      // start watching components
      HCR(Env.bundle);
      return body;
    } else {
      return "no root-component found";
    }
  }

  public static async resolveAndReadText(path: string) {
    const isFile = path.startsWith("/") ||
      path.startsWith("./") ||
      path.startsWith("../") ||
      !path.startsWith("http://") ||
      !path.startsWith("https://");
    const isTsFile = isFile && path.endsWith(".ts");
    const text = Deno.readTextFileSync(path);
    return isTsFile
      ? (await Deno.transpileOnly({
        [path]: text,
      }, {
        sourceMap: false,
      }))[path].source
      : text;
  }
  private static recursiveRead(opts: { entrypoint: string, onContent: Function }): void {
    if (!existsSync(opts.entrypoint)) {
      throw new Error('[Ogone] can\'t find entrypoint for Env.recursiveRead');
    }
    const stats = Deno.statSync(opts.entrypoint);
    if (stats.isFile) {
      const content = Deno.readTextFileSync(opts.entrypoint);
      opts.onContent(opts.entrypoint, content);
    } else if (stats.isDirectory) {
      const dir = Deno.readDirSync(opts.entrypoint);
      for (let p of dir) {
        const path = join(opts.entrypoint, p.name);
        Env.recursiveRead({
          entrypoint: path,
          onContent: opts.onContent,
        });
      }
    }
  }
  /**
   * get the output of the application
   * including HTML CSS and JS
   */
  public static async getBuild() {
    throw new Error('[Ogone: 0.16.0-rc.5] build is not ready yet, until Deno\'s compiler isn\'t fixed.\nplease check this issue > https://github.com/denoland/deno/issues/6423');
    /*
    let staticStyle = '';
    // TODO WAIT FOR A FIX OF COMPILER API
    if (Ogone.config.static && Ogone.config.compileCSS) {
      Env.recursiveRead({
        entrypoint: Ogone.config.static,
        onContent: (file: string, content: string) => {
          if (file.endsWith('.css')) {
            console.warn('[Ogone] loading css: ', file);
            staticStyle += content;
          }
        }
      });
    }
    const stylesProd = Array.from(Env.bundle.components.entries()).map((
      entry: any,
    ) => entry[1].style.join("\n")).join("\n");
    const compiledStyle = Ogone.config.minifyCSS ? (staticStyle + stylesProd).replace(/(\n|\s+|\t)/gi, ' ') : (staticStyle + stylesProd);
    const style = `<style>${(compiledStyle)}</style>`;
    const esmProd = Array.from(Env.bundle.components.entries()).map((
      entry: any,
    ) => entry[1].esmExpressionsProd).join("\n");
    const rootComponent = Env.bundle.components.get(Ogone.config.entrypoint);
    if (rootComponent) {
      if (
        rootComponent &&
        ["router", "store", "async"].includes(rootComponent.type)
      ) {
        const RootNodeTypeErrorException = new TypeError(
          `[Ogone] the component provided in the entrypoint option has type: ${rootComponent.type}, entrypoint option only supports normal component`,
        );
        throw RootNodeTypeErrorException;
      }
      const [, scriptProd] = await Deno.compile("index.ts", {
        "index.ts": `import test from '/test.js'`,
        "test.js": 'export default 10;',
      }, {
        module: "esnext",
        target: "esnext",
        resolveJsonModule: false,
        experimentalDecorators: true,
        allowUnreachableCode: false,
        jsx: "preserve",
        jsxFactory: "Ogone.r(",
        inlineSourceMap: false,
        inlineSources: false,
        alwaysStrict: false,
        sourceMap: false,
        strictFunctionTypes: true,
        lib: ["dom", "esnext"],
      });
      // in production DOM has to be
      // <template is="${rootComponent.uuid}-nt"></template>
      const DOMProd = `<template is="${rootComponent.uuid}-nt"></template>`;
      let head = `
          ${style}
          ${Ogone.config.head || ""}
          <script>
            ${scriptProd["index.js"].trim()}
          </script>`;
      let body = template
        .replace(/%%head%%/, head)
        .replace(/%%dom%%/, DOMProd);
      return body;
    } else {
      throw new Error("[Ogone] no root-component found");
    }
    */
  }
}
