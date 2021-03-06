import { existsSync } from "../../utils/exists.ts";
import type { Bundle } from "../ogone.main.d.ts";
import { Utils } from "./Utils.ts";
import AssetsParser from "./AssetsParser.ts";
import {
  absolute,
  fetchRemoteRessource,
} from "../../deps/deps.ts";

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
 * import RelativeComponent from '../relative-component.o3'; // local
 * import AbsoluteComponent from '/absolute.o3'; // local
 * import RemoteComponent from 'http:/ /ogone.dev/components/index.o3'; // remote
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
    try {
      const splitTextUseFirstPart = textFile.split(/\<([a-zA-Z0-9]*)+/i)[0];
      const tokens = this.AssetsParser.parseImportStatement(splitTextUseFirstPart);
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
      if (tokens.body && tokens.body.imports) {
        for await (let item of Object.values(tokens.body.imports)) {
          const { path: inputPath, type, isComponent }: any = item;
          if (!isComponent) return;
          const path = inputPath.replace(/^@\//, '');
          if (path === p) {
            if (opts.recursive) {
              this.error(`${path}
                Cannot import the same component inside the component.
                please use the tag 'Self' like following:
                  <Self />
              `);
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
            if (Deno.build.os !== "windows") {
              Deno.chmodSync(path, 0o777);
            }
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
              if (Deno.build.os !== "windows") {
                Deno.chmodSync(newPath, 0o777);
              }
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
    } catch (err) {
      this.error(`ComponentSubscriber: ${err.message}
${err.stack}`);
    }
  }
  async inspect(entrypoint: string, bundle: Bundle) {
    try {
      if (existsSync(entrypoint)) {
        if (Deno.build.os !== "windows") {
          Deno.chmodSync(entrypoint, 0o777);
        }
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
    } catch (err) {
      this.error(`ComponentSubscriber: ${err.message}
${err.stack}`);
    }
  }
}
