import read from '../../utils/agnostic-transformer.ts';
import notParsed from '../../utils/not-parsed.ts';
import elements from '../../utils/elements.ts';
import { SusanoOptions, FileBundle, } from '../../../../.d.ts';
import { existsSync } from "../../../../deps.ts";
import SusanoScopeInspector from './memory.ts';
import modifiers from '../../utils/modifiers.ts';

export default class Susano extends SusanoScopeInspector {
  release(opts: SusanoOptions): string | null {
    const fileBundle = this.getFileBundle(opts);
    if (fileBundle) {
      this.getAllScopes(fileBundle);
      this.getAllImportsExports(fileBundle);
    }
    return fileBundle ? fileBundle.value : null;
  }
  getFileBundle(opts: Partial<FileBundle>): FileBundle | null {
    if (!opts || !opts.path || !existsSync(opts.path) && !opts.code) return null;
    let result: string = opts.code || Deno.readTextFileSync(opts.path);
    result = `${result}\n`;
    const fileBundle: FileBundle = {
      id: "k" + Math.random(),
      type: "",
      baseUrl: "",
      path: opts && opts.path || "",
      value: result,
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
    return fileBundle;
  }
}
const susano = new Susano();
// TODO get export abstract class
susano.release({
  path: './deps.ts',
});