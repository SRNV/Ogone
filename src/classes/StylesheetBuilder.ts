import CSSScoper from "./css/CSSScoper.ts";
import {
  absolute,
  join,
  fetchRemoteRessource,
} from "../../deps/deps.ts";
import type { Bundle, Component } from "../ogone.main.d.ts";
import { existsSync } from "../../utils/exists.ts";
import { Utils } from "./Utils.ts";
import keyframes from "../../utils/keyframes.ts";
import Style from './css/Style.ts';
import HMR from "./HMR.ts";
// TODO fix code duplication
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
  private static mapStyle: Map<string, string> = new Map();
  private CSSScoper: CSSScoper = new CSSScoper();
  private Style: Style = new Style();
  async read(bundle: Bundle) {
    try {
      const entries = Array.from(bundle.components.entries());
      this.trace('start component style analyze');

      for await (const [, component] of entries) {
        const { styles } = component.elements;
        this.trace('start style node analyze');

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
            this.trace('end style element analyze, start assignment');

            switch (element.attributes.lang) {
              default:
                compiledCss = styleContent as string;
                break;
            }
            if (element.attributes['--keyframes']) {
              compiledCss = `${compiledCss} \n ${this.readKeyframes(element.attributes['--keyframes'] as string)}`
            }

            this.trace('start component style transformations');
            compiledCss = await this.Style.read(compiledCss, bundle, component);

            this.trace('end component style transformations, start mapStyleBundle assignment');
            component.mapStyleBundle = this.Style.mapStyleBundle;
            const css = isGlobal ? compiledCss : this.CSSScoper.transform(compiledCss, component.uuid);
            component.style.push(css);
            // send only if there's a change
            StylesheetBuilder.sendChanges(component, css);
          }
        }
      }
    } catch (err) {
      this.error(`StylesheetBuilder: ${err.message}
${err.stack}`);
    }
  }
  public async transformAllStyleElements(bundle: Bundle) {
    try {
      const entries = Array.from(bundle.components.entries());
      this.trace('start component style analyze');

      for await (const [, component] of entries) {
        const { rootNode } = component;
        const { nodeList } = rootNode;
        const { styles } = component.elements;
        const allStyles = nodeList
          .filter((el) => !styles.includes(el) && el.tagName === 'style');
        for await (let element of allStyles) {
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
            this.trace('end style element analyze, start assignment');

            switch (element.attributes.lang) {
              default:
                compiledCss = styleContent as string;
                break;
            }
            if (element.attributes['--keyframes']) {
              compiledCss = `${compiledCss} \n ${this.readKeyframes(element.attributes['--keyframes'] as string)}`
            }

            this.trace('start component style transformations');
            compiledCss = await this.Style.read(compiledCss, bundle, component);
            compiledCss = component.elements.template?.attributes.protected
              || component.elements.template?.attributes.private
              || isGlobal || element.parentNode === component.elements.head
                ? compiledCss
                : this.CSSScoper.transform(compiledCss, component.uuid);
            element.childNodes[0].rawText = compiledCss;
          }
        }
      }
    } catch (err) {
      this.error(`StylesheetBuilder: ${err.message}
${err.stack}`);
    }
  }
  private readKeyframes(keyframesEvaluated: string) {
    try {
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
    } catch (err) {
      this.error(`StylesheetBuilder: ${err.message}
${err.stack}`);
    }
  }
  static sendChanges(component: Component, css:  string) {
    if (!this.mapStyle.has(component.uuid)) {
      this.mapStyle.set(component.uuid, css);
    } else {
      const item = this.mapStyle.get(component.uuid);
      if (item !== css) {
        HMR.postMessage({
          type: 'style',
          uuid: component.uuid,
          output: css,
        });
        this.mapStyle.set(component.uuid, css);
      }

    }
  }
}
