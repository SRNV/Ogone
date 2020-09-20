import read from "../../utils/agnostic-transformer.ts";
import notParsed from "../../utils/not-parsed.ts";
import elements from "../../utils/elements.ts";
import type { SusanoOptions, FileBundle } from "../../../../.d.ts";
import {
  absolute,
  existsSync,
  fetchRemoteRessource,
} from "../../../../deps.ts";
import SusanoScopeInspector from "./memory.ts";
import modifiers from "../../utils/modifiers.ts";

export default class Susano extends SusanoScopeInspector {
  readonly fetchRemoteRessource = fetchRemoteRessource;
  public readonly console: string[][] = [];
  public start(mkSusanoDir = false): Susano {
    console.warn("%c[Susano] %cbundling...", "color: orchid", "color: grey");
    mkSusanoDir && this.mkSusanoDir();
    return this;
  }
  async release(
    opts: SusanoOptions,
    infos?: { level: number },
  ): Promise<FileBundle | null> {
    const start = performance.now();
    const newInfos = {
      start,
      level: infos && infos.level || 0,
    };
    const fileBundle = await this.getFileBundle(opts);
    console.warn(fileBundle)
    if (fileBundle) {
      this.getAllScopes(fileBundle);
      this.getAllImportsExports(fileBundle);
      await this.saveChildBundle(fileBundle, newInfos);
      // start cherry-picking
      await this.cherryPick(fileBundle, newInfos);
      await this.saveLogs(fileBundle, newInfos);
      await this.saveInSusanoDir(fileBundle);
    }
    return fileBundle;
  }
  private async saveChildBundle(
    fileBundle: FileBundle,
    infos: { level: number; start: number },
  ): Promise<void> {
    const { level } = infos;
    const entries = Array.from([
      ...fileBundle.mapImports.entries(),
      ...fileBundle.mapExports.entries(),
    ]);
    for await (let [, details] of entries) {
      // @ts-ignore
      if (details.path) {
        const child = await this.release({
          // @ts-ignore
          path: details.path,
          parent: fileBundle,
        }, {
          level: level + 1,
        });
        if (child) {
          fileBundle.dependencies.push(child.path);
        }
      }
    }
  }
  private async saveLogs(
    fileBundle: FileBundle,
    infos: { level: number; start: number },
  ): Promise<void> {
    const { start, level } = infos;
    const entries = Array.from([
      ...fileBundle.mapImports.entries(),
      ...fileBundle.mapExports.entries(),
    ]);
    const time = Math.round(performance.now() - start);
    const timeGraph = Array.from(new Array(time.toString().length)).map(() =>
      "-"
    );
    const levelGraph = Array.from(new Array(level)).map(() => "|-");
    const colors = [
      "cyan",
      "lightgreen",
      "yellow",
      "orange",
      "red",
    ];
    const timeColor = colors[timeGraph.length - 1] || "red";
    const bytesColor =
      colors[(fileBundle.code?.length.toString().length || 1) - 1] || "red";
    const title = `             ${fileBundle.path}`.slice(-20);
    const extensionColor = title.endsWith(".ts")
      ? "lightblue"
      : title.endsWith(".js")
      ? "yellow"
      : "lightgrey";
    this.console.push(
      [
        `%c${
          levelGraph.join("")
        }%c• %c ${title} %c${time}ms / %c${entries.length} dep / %c${fileBundle
          .code?.length} bytes `,
        "color: black",
        `color: ${extensionColor};`,
        "color: lightgrey",
        `color: ${timeColor}; font-style: italic`, // time
        "color: grey; font-style: italic", // dependecies
        `color: ${bytesColor}; font-style: italic`,
      ], // bytes
    );
  }
  async getFile(
    opts: SusanoOptions,
  ): Promise<
    { code: string; type: any; baseUrl: string; newPath: null | string }
  > {
    let result: {
      code: string;
      type: any;
      baseUrl: string;
      newPath: null | string;
    } = {
      code: "",
      type: "local",
      baseUrl: opts.parent?.baseUrl || opts.path,
      newPath: null,
    };
    const start = performance.now();
    const absolutePath = absolute(opts.parent?.path || opts.path, opts.path);
    switch (true) {
      case existsSync(absolutePath) && opts.parent &&
        opts.parent.type !== "remote": {
        result.type = "local";
        result.code = Deno.readTextFileSync(absolutePath);
        result.baseUrl = opts.parent?.baseUrl as string ||
          opts.parent?.path as string;
        result.newPath = absolutePath;
        break;
      }
      case opts.path.startsWith("http://") ||
        opts.path.startsWith("https://"): {
        const alreadySaved = await this.isInSusanoDir(opts.path);
        if (!alreadySaved) {
          const text = await this.fetchRemoteRessource(opts.path);
          if (text) {
            result.code = text;
          } else {
            throw new Error(`unreachable remote module. ${opts.path}`);
          }
        }
        result.type = "remote";
        result.baseUrl = opts.path.split("://")[1];
        result.newPath = opts.path;
        break;
      }
      case opts.parent && opts.parent.type === "remote": {
        const parentPath = opts.parent && opts.parent.baseUrl;
        // console.warn(parentPath, opts.path)
        if (parentPath) {
          const newPath = `${opts.parent?.path.split("://")[0]}://${
            absolute(opts.parent?.path.split("://")[1] as string, opts.path)
          }`;
          const alreadySaved = await this.isInSusanoDir(newPath);
          if (!alreadySaved) {
            const text = await this.fetchRemoteRessource(newPath);
            if (text) {
              result.code = text;
            } else {
              throw new Error(`unreachable remote module. ${opts.path}`);
            }
          }
          result.type = "remote";
          result.newPath = newPath;
        }
        break;
      }
    }
    console.warn(
      `%c[Susano] %cmodule resolution (${
        Math.round(performance.now() - start)
      }ms): %c${result.newPath || opts.path}`,
      "color: orchid",
      "color: grey",
      "color: lightgreen",
    );
    return result;
  }
  async getFileBundle(opts: Partial<FileBundle>): Promise<FileBundle | null> {
    if (!opts || !opts.path) return null;
    const file = await this.getFile({
      path: opts.path,
      parent: opts.parent as FileBundle,
    });
    if (file.newPath && this.mapFileBundle.has(file.newPath)) {
      return null;
    }
    const path = file.newPath || opts && opts.path || "";
    const susanoMod = file.type !== "local" && await this.getModFromSusanoDir(path, {
      code: opts.code || file.code,
    });
    let result: string = susanoMod && susanoMod.code || opts.code || file.code;
    if (!susanoMod) {
      result = `${result}\n`;
    }
    const fileBundle: FileBundle = {
      id: susanoMod && susanoMod.id || "k" + Math.random(),
      type: file.type,
      baseUrl: file.baseUrl,
      path,
      value: susanoMod && susanoMod.value || result,
      code: susanoMod && susanoMod.code || result,
      parent: opts.parent,
      dependencies: susanoMod && susanoMod.dependencies || [],
      root: this.getScopeBundle({
        value: susanoMod && susanoMod.code || result,
      }),
      mapScopes: new Map(),
      mapExports: new Map(),
      mapImports: new Map(),
      tokens: susanoMod && susanoMod.tokens || {
        expressions: {
          "§§endExpression0§§": "\n",
        },
        typedExpressions: {
          blocks: {},
          parentheses: {},
          imports: {},
          exports: {},
        },
      },
    };
    if (!susanoMod) {
      const topLevel = read({
        expressions: fileBundle.tokens.expressions,
        typedExpressions: fileBundle.tokens.typedExpressions,
        array: notParsed.concat(elements).concat(modifiers),
        value: result,
      });
      fileBundle.value = topLevel;
      fileBundle.root.value = topLevel;
    } else {
      fileBundle.root.value = susanoMod.code;
    }
    this.mapFileBundle.set(fileBundle.path as string, fileBundle);
    return fileBundle;
  }
}
console.warn(Deno.systemMemoryInfo());
console.warn(Deno.resources());
const susano = new Susano();
// TODO get export abstract class
const start = performance.now();
susano.start(true).release({
  path: "./deps.ts",
  code: `
    import s from 'https://deno.land/x/drake@v1.4.0/mod.ts';
    // import t from 'https://deno.land/x/denopack@0.9.0/mod.ts';
  `,
}).then(() => {
  susano.console
    .slice()
    .reverse()
    .forEach((messages) => {
      console.warn(...messages);
    });
  console.warn(performance.now() - start, "ms");
});
