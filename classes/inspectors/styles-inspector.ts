import CSSScoper from "../parsers/css/scope.ts";
import {
  sassCompiler,
  denolusCompiler,
  absolute,
  join,
  fetchRemoteRessource,
} from "../../deps.ts";
import { Bundle } from "../../.d.ts";
import { existsSync } from "../../utils/exists.ts";
import { Configuration } from '../config/index.ts';

export default class StyleInspector extends Configuration {
  private CSSScoper: CSSScoper = new CSSScoper();

  async read(bundle: Bundle) {
    const entries = Array.from(bundle.components.entries());
    for await (const [, component] of entries) {
      const styles = component.rootNode.childNodes.filter((node) =>
        node.tagName === "style"
      );
      for await (const element of styles) {
        let styleContent = element.getInnerHTML ? element.getInnerHTML() : null;
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
                ? isAbsoluteRemote ? await fetchRemoteRessource(src) : relativePath
                : null;
            switch (true && !!p) {
              case p &&
                ((["scss", "sass"].includes(lang) || !lang) &&
                  (p.endsWith(".sass") || p.endsWith(".scss")) ||
                  ((["denolus"].includes(lang) || !lang) &&
                    (p.endsWith(".lus") || p.endsWith(".yml") ||
                      p.endsWith(".yaml"))) ||
                  (["css"].includes(lang) && p.endsWith(".css"))):
                styleContent = Deno.readTextFileSync(p as string) + styleContent;
                break;
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
              `Downloading style: ${isAbsoluteRemote ? src : remoteRelativePath}`,
            );
            const p = isAbsoluteRemote
              ? await fetchRemoteRessource(src)
              : await fetchRemoteRessource(remoteRelativePath);
            switch (true) {
              case p &&
                ((["scss", "sass"].includes(lang) || !lang) &&
                  (p.endsWith(".sass") || p.endsWith(".scss")) ||
                  ((["denolus"].includes(lang) || !lang) &&
                    (p.endsWith(".lus") || p.endsWith(".yml") ||
                      p.endsWith(".yaml"))) ||
                  (["css"].includes(lang) && p.endsWith(".css"))):
                styleContent = p + styleContent;
                break;
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
            case "scss":
            case "sass":
              compiledCss = sassCompiler(styleContent as string, {
                output_style: "compressed",
                precision: 5,
                indented_syntax: false,
                include_paths: [],
              }).result;
              break;
            case "denolus":
              compiledCss = denolusCompiler(styleContent as string);
              break;
            default:
              compiledCss = styleContent as string;
              break;
          }
          const css = this.CSSScoper.transform(compiledCss, component.uuid);
          component.style.push(css);
        }
      }
    }
  }

}