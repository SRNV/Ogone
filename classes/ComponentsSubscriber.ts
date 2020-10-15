import { existsSync } from "../utils/exists.ts";
import type { Bundle } from "../.d.ts";
import { Utils } from "./Utils.ts";
import AssetsParser from "./AssetsParser.ts";
import elements from "../utils/elements.ts";
import notParsedElements from "../utils/not-parsed.ts";
import getDeepTranslation from "../utils/template-recursive.ts";
import read from '../utils/agnostic-transformer.ts';
import {
  absolute,
  fetchRemoteRessource,
} from "../deps.ts";

/**
 * @name ComponentsSubscriber
 * @code OCS1
 * @code OCS1-OC0
 * @description this class will help resolve all the components used inside the application
 * to do so just pass to the inspect method 2 arguments
 * ```ts
 *    ComponentsSubscriber.inspect('file.o3', bundle);
 * ```
 * this will save inside the bundle, all the files used by the application, starting by the root component
 * a file is mentioned as remote, if the path is an url or the parent is remote
 * a file is mentioned as local, if the path is not an url or the parent is not remote (absolute import)
 * ```
 * // local file
 * use ../relative-component.o3 as 'relative-component'; // local
 * use /absolute.o3 as 'absolute-component'; // local
 * use http:/ /ogone.dev/components/index.o3 as 'remote-component'; // remote
 * ```
 *
 * @dependency AssetsParser
 */
export default class ComponentsSubscriber extends Utils {
  private AssetsParser: AssetsParser =
    new AssetsParser();
  async startRecursiveInspectionOfComponent(
    textFile: string,
    p: string,
    bundle: Bundle,
    opts: any = {
      remote: false,
      baseUrl: "",
      current: "",
      item: null,
    },
  ): Promise<void> {
    const expressions = {};
    const splitTextUseFirstPart = read({
      value: textFile,
      array: [...notParsedElements, ...elements],
      expressions,
      typedExpressions: {},
    }).split(/\<([a-zA-Z0-9]*)+/i)[0];
    const tokens = this.AssetsParser.parseUseStatement(getDeepTranslation(splitTextUseFirstPart, expressions));
    if (opts && opts.remote) {
      bundle.remotes.push({
        file: textFile,
        base: opts.base,
        path: opts.current,
        item: opts.item,
        parent: opts.parent,
      });
    } else {
      // only push if it's a local component
      bundle.files.push({
        path: p,
        file: textFile,
        item: opts.item,
        parent: opts.parent,
      });
    }
    if (tokens.body && tokens.body.use) {
      for await (let item of Object.values(tokens.body.use)) {
        const { path, type }: any = item;
        if (path === p) {
          if (opts.recursive) {
            continue;
          }
          await this.startRecursiveInspectionOfComponent(
            textFile,
            path,
            bundle,
            {
              item,
              parent: path,
              recursive: true,
            },
          );
          continue;
        }

        if (type === "remote") {
          this.warn("Downloading", path);
          const file = await fetchRemoteRessource(path);
          if (file) {
            await this.startRecursiveInspectionOfComponent(file, path, bundle, {
              remote: true,
              base: path.match(
                /(http|https|ws|wss|ftp|tcp|fttp)(\:\/{2}[^\/]+)/gi,
              )[0],
              current: path,
              item,
              parent: p,
            });
          } else {
            this.error(
              `unreachable remote component.\t\t\ninput: ${path}`,
            );
          }
        } else if (type === "absolute" && existsSync(path)) {
          // absolute  and local
          const file = Deno.readTextFileSync(path);
          await this.startRecursiveInspectionOfComponent(file, path, bundle, {
            item,
            parent: p,
          });
        } else if (opts.remote && type === "relative" && opts.base) {
          // relative and remote
          const newPath = `${opts.current.split("://")[0]}://${absolute(opts.current.split("://")[1], path)
            }`;
          this.warn(`Downloading ${newPath}`);
          const file = await fetchRemoteRessource(newPath);
          if (file) {
            await this.startRecursiveInspectionOfComponent(
              file,
              newPath,
              bundle,
              {
                ...opts,
                item,
                current: newPath,
                parent: p,
              },
            );
          } else {
            this.error(
              `unreachable remote component.\t\t\ninput: ${newPath}`,
            );
          }
        } else if (!opts.remote && type === "relative") {
          const newPath = absolute(p, path);
          if (existsSync(newPath)) {
            const file = Deno.readTextFileSync(newPath);
            await this.startRecursiveInspectionOfComponent(
              file,
              newPath,
              bundle,
              {
                item,
                parent: p,
              },
            );
          } else {
            this.error(
              `component not found. input: ${path}`,
            );
          }
        } else {
          this.error(
            `component not found. input: ${path}`,
          );
        }
      }
    }
  }
  async inspect(entrypoint: string, bundle: Bundle) {
    if (existsSync(entrypoint)) {
      const rootComponentFile = Deno.readTextFileSync(entrypoint);
      await this.startRecursiveInspectionOfComponent(
        rootComponentFile,
        entrypoint,
        bundle,
        {
          item: {
            path: entrypoint,
          },
          parent: entrypoint,
        },
      );
    } else {
      this.error(
        `entrypoint file doesn't exist \n\t${entrypoint}`,
      );
    }
  }
}
