import read from '../../utils/agnostic-transformer.ts';
import notParsed from '../../utils/not-parsed.ts';
import elements from '../../utils/elements.ts';
import type { SusanoOptions, FileBundle, } from '../../../../.d.ts';
import { absolute, existsSync, fetchRemoteRessource } from "../../../../deps.ts";
import SusanoScopeInspector from './memory.ts';
import modifiers from '../../utils/modifiers.ts';

export default class Susano extends SusanoScopeInspector {
  readonly fetchRemoteRessource = fetchRemoteRessource;
  public readonly console: string[][] = [];
  public start(): Susano {
    console.warn('%c[Susano] %cbundling...', "color: orchid", "color: lightblue");
    return this;
  }
  async release(opts: SusanoOptions, level = 0): Promise<string | null> {
    const start = performance.now();
    const fileBundle = await this.getFileBundle(opts);
    if (fileBundle) {
      this.getAllScopes(fileBundle);
      this.getAllImportsExports(fileBundle);
      const entries = Array.from([
        ...fileBundle.mapImports.entries(),
        ...fileBundle.mapExports.entries()
      ]);
      for await (let [, details] of entries) {
        // @ts-ignore
        if (details.path) {
          const f = await this.release({
            // @ts-ignore
            path: details.path,
            parent: fileBundle,
          }, level + 1);
        }
      }
      const time = Math.round(performance.now() - start);
      const timeGraph = Array.from(new Array(time.toString().length)).map(() => '-')
      const levelGraph = Array.from(new Array(level)).map(() => '|-')
      const colors = [
        'cyan',
        'lightgreen',
        'yellow',
        'orange',
        'red',
      ];
      const timeColor = colors[timeGraph.length -1] || 'red';
      const bytesColor = colors[(fileBundle.code?.length.toString().length || 1) -1] || 'red';
      const title = `             ${fileBundle.path}`.slice(-20);
      const extensionColor = title.endsWith('.ts') ? 'lightblue' : title.endsWith('.js') ? 'yellow' : 'lightgrey';
      this.console.push([`%c${levelGraph.join('')}%c• %c ${title} %c${time}ms / %c${entries.length} dep / %c${fileBundle.code?.length} bytes `,
        "color: black",
        `color: ${extensionColor};`,
        "color: lightgrey",
        `color: ${timeColor}; font-style: italic`, // time
        "color: grey; font-style: italic", // dependecies
        `color: ${bytesColor}; font-style: italic`, // bytes
       ]);
    }
    return fileBundle ? fileBundle.value : null;
  }
  async getFile(opts: SusanoOptions): Promise<{ code: string; type: any; baseUrl: string; newPath: null | string; }> {
    let result: { code: string; type: any; baseUrl: string; newPath: null | string; } = {
      code: '',
      type: "local",
      baseUrl: opts.parent?.baseUrl || opts.path,
      newPath: null,
    };
    const absolutePath = absolute(opts.parent?.path || opts.path, opts.path);
    switch(true) {
      case existsSync(absolutePath) && opts.parent && opts.parent.type !== "remote":
        result.type = 'local';
        result.code = Deno.readTextFileSync(absolutePath);
        result.baseUrl = opts.parent?.baseUrl as string || opts.parent?.path as string;
        result.newPath = absolutePath;
        break;
      case opts.path.startsWith('http://') || opts.path.startsWith('https://'):
          const text = await this.fetchRemoteRessource(opts.path);
          result.type = 'remote';
          result.baseUrl = opts.path.split("://")[1];
          result.newPath = opts.path;
          if (text) {
            result.code = text;
          } else {
            throw new Error(`unreachable remote module. ${opts.path}`);
          }
        break;
      case opts.parent && opts.parent.type === "remote":
        const parentPath = opts.parent && opts.parent.baseUrl;
        // console.warn(parentPath, opts.path)
        if (parentPath) {
          const newPath = `${opts.parent?.path.split("://")[0]}://${absolute(opts.parent?.path.split("://")[1] as string, opts.path)}`;
          const text = await this.fetchRemoteRessource(newPath);
          result.type = 'remote';
          result.newPath = newPath;
          if (text) {
            result.code = text;
          } else {
            throw new Error(`unreachable remote module. ${opts.path}`);
          }
        }
        break;
    }
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
    let result: string = opts.code || file.code;
    result = `${result}\n`;
    const fileBundle: FileBundle = {
      id: "k" + Math.random(),
      type: file.type,
      baseUrl: file.baseUrl,
      path: file.newPath || opts && opts.path || "",
      value: result,
      code: result,
      parent: opts.parent,
      dependencies: [],
      root: this.getScopeBundle({
        value: result,
      }),
      mapScopes: new Map(),
      mapExports: new Map(),
      mapImports: new Map(),
      tokens: {
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
    const topLevel = read({
      expressions: fileBundle.tokens.expressions,
      typedExpressions: fileBundle.tokens.typedExpressions,
      value: result,
      array: notParsed.concat(elements).concat(modifiers),
    });
    fileBundle.value = topLevel;
    fileBundle.root.value = topLevel;
    this.mapFileBundle.set(file.newPath as string, fileBundle);
    return fileBundle;
  }
}
const susano = new Susano();
// TODO get export abstract class
await susano.start().release({
  path: './deps.ts',
  code: `
    import t from './mod.ts';
  `,
}).then(() => {
  susano.console
    .slice()
    .reverse()
    .forEach((messages) => {
    console.warn(...messages)
  });
});
