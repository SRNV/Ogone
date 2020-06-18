import { browserBuild, template } from "./../../src/browser/readfiles.ts";
import { HCR } from "../hmr/index.ts";
import Ogone from "./../../src/ogone/index.ts";
import compile from "./../../src/ogone/compilation/index.ts";
import { Bundle, Environment } from "./../../.d.ts";
export default abstract class Env {
  private static bundle: Bundle;
  public static env: Environment = "development";
  constructor(opts: any) {
    Env.bundle = opts.bundle;
  }

  /**
   * set the current bundle for the environment
   * @param bundle
   */
  public static setBundle(bundle: Bundle): void {
    Env.bundle = bundle;
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
  public static async compile(entrypoint: string, shouldBundle?: boolean): Promise<any> {
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
        let result = '';
        if (entry[1].style.join("\n").trim().length) {
          result = `<style id="${entry[1].uuid}">
            ${entry[1].style.join("\n")}
          </style>`
        }
        return result;
      }).join("\n");
    const stylesProd = Array.from(Env.bundle.components.entries()).map((
      entry: any,
    ) => entry[1].style.join("\n")).join("\n");
    const esm = Array.from(Env.bundle.components.entries()).map((
      entry: any,
    ) => entry[1].esmExpressions).join("\n");

    const style = Env.env === "development"
      ? stylesDev
      : `<style>${(stylesProd)}</style>`;
    const rootComponent = Env.bundle.components.get(Ogone.config.entrypoint);
    if (rootComponent) {
      if (
        rootComponent && ["router", "store", "async"].includes(rootComponent.type)
      ) {
        const RootNodeTypeErrorException = new TypeError(
          `[Ogone] the component provided in the entrypoint option has type: ${rootComponent.type}, entrypoint option only supports normal component`,
        );
        throw RootNodeTypeErrorException;
      }
      const scriptDev = `
        const ___perfData = window.performance.timing;

        ${browserBuild}
        ${Env.bundle.datas.join("\n")}
        ${Env.bundle.render.join("\n")}
        ${Env.bundle.contexts.reverse().join("\n")}
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
      const scriptProd = `
        ${browserBuild}
        ${esm}
        ${Env.bundle.datas.join("\n")}
        ${Env.bundle.render.join("\n")}
        ${Env.bundle.contexts.reverse().join("\n")}
        ${Env.bundle.classes.reverse().join("\n")}
        ${Env.bundle.customElements.join("\n")}
        `;
      // in production DOM has to be
      // <template is="${rootComponent.uuid}-nt"></template>
      const DOMDev = ` `;
      const DOMProd = `<template is="${rootComponent.uuid}-nt"></template>;`;
      let head = `
          ${style}
          ${Ogone.config.head || ''}
          <script type="module">
            ${(Env.env === "development" ? scriptDev : scriptProd).trim()}
          </script>`;
      let body = template
        .replace(/%%head%%/, head)
        .replace(/%%dom%%/, (Env.env === "development" ? DOMDev : DOMProd));

      // start watching components
      HCR(Env.bundle);
      return body;
    } else {
      return 'no root-component found';
    }
  }

  public static async resolveAndReadText(path: string) {
    const isFile = path.startsWith('/')
      || path.startsWith('./')
      || path.startsWith('../')
      || !path.startsWith('http://')
      || !path.startsWith('https://');
    const isTsFile = isFile && path.endsWith('.ts');
    const text = Deno.readTextFileSync(path);
    return isTsFile ? (await Deno.transpileOnly({
      [path]: text,
    }, {
      sourceMap: false,
    }))[path].source : text;
  }
}
