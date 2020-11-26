import CSSScoper from "./css/CSSScoper.ts";
import {
  absolute,
  join,
  fetchRemoteRessource,
} from "../deps.ts";
import type { Bundle } from "../.d.ts";
import { existsSync } from "../utils/exists.ts";
import { Utils } from "./Utils.ts";
import keyframes from "../utils/keyframes.ts";
import Style from './css/Style.ts';

/**
 * @name StylesheetBuilder
 * @code OSB7
 * @code OSB7-OC0
 * @description style step of the components
 * this class will use the style elements of the component
 * pass the textnode to the Style module and scope all the rules after it with the CSSScoper
 * then the style is saved like following:
 * ```ts
 *   component.style.push(css);
 * ```
 * all style are scoped to the component's uuid
 * excepted if the style tag has a global attribute
 * @dependency CSSScoper
 * @dependency Style
 */
export default class StylesheetBuilder extends Utils {
  private CSSScoper: CSSScoper = new CSSScoper();
  private Style: Style = new Style();
  private readKeyframes(keyframesEvaluated: string) {
    const fn = new Function('get', `return (${keyframesEvaluated});`)
    const get = (name: string, opts: any) => {
      switch (true) {
        case typeof name !== 'string':
          this.error('using keyframes fade: argument one has to be a string.')
          break;
      }
      return `
        .${name} {
          animation-name: ${name};
          animation-duration: ${opts.time || 1}s;
          animation-iteration-count: ${opts.iteration || 1};
          animation-fill-mode: ${opts.iteration || 'forwards'};
          animation-timing-function: ${opts.style || 'linear'};
        }
        ${keyframes[name]}
      `;
    };
    const k = fn(get);
    return Array.isArray(k) ? k.join('\n') : k;
  }
  async read(bundle: Bundle) {
    const entries = Array.from(bundle.components.entries());
    for await (const [, component] of entries) {
      const { styles } = component.elements;
      for await (const element of styles) {
        let styleContent = element.getInnerHTML ? element.getInnerHTML() : null;
        const isGlobal = element.attributes.global;
        if (styleContent) {
          let compiledCss: string = "";
          const src = element.attributes.src
            ? (element.attributes.src as string).trim()
            : "";
          const relativePath = join(component.file, src);
          const remoteRelativePath = absolute(component.file, src);
          const isAbsoluteRemote = ["http", "ws", "https", "ftp"].includes(
            src.split("://")[0],
          );
          const lang = (element.attributes.lang || "css") as string;
          // allows <syle src="path/to/style.css"
          if (src.length && !component.remote) {
            const p = existsSync(src)
              ? src
              : existsSync(relativePath)
                ? isAbsoluteRemote
                  ? await fetchRemoteRessource(src)
                  : relativePath
                : null;
            switch (true && !!p) {
              case !p:
                this.error(
                  `style's src attribute is not found. \ncomponent${component.file}\ninput: ${src}`,
                );
              default:
                this.error(
                  `style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`,
                );
            }
          } else if (src.length && component.remote) {
            this.warn(
              `Downloading style: ${isAbsoluteRemote ? src : remoteRelativePath
              }`,
            );
            const p = isAbsoluteRemote
              ? await fetchRemoteRessource(src)
              : await fetchRemoteRessource(remoteRelativePath);
            switch (true) {
              case !p:
                this.error(
                  `style's src attribute is not reachable. \ncomponent${component.file}\ninput: ${src}`,
                );
              default:
                this.error(
                  `style's src attribute and lang attribute has to be on the same language. \ncomponent${component.file}\ninput: ${src}`,
                );
            }
          }
          switch (element.attributes.lang) {
            default:
              compiledCss = styleContent as string;
              break;
          }
          if (element.attributes['--keyframes']) {
            compiledCss = `${compiledCss} \n ${this.readKeyframes(element.attributes['--keyframes'] as string)}`
          }
          compiledCss = await this.Style.read(compiledCss, bundle, component);
          component.mapStyleBundle = this.Style.mapStyleBundle;
          const css = isGlobal ? compiledCss : this.CSSScoper.transform(compiledCss, component.uuid);
          component.style.push(css);
        }
      }
    }
  }
}
