import { Utils } from "./Utils.ts";

export default class TSTranspiler extends Utils {
  static transpileCompilerOptions = { sourceMap: false, };
  static async transpile(text: string): Promise<string> {
    return (await Deno.emit('/transpiled.ts', {
      check: false,
      sources: {
        "/transpiled.ts": text,
      },
      compilerOptions: this.transpileCompilerOptions,
    })).files["file:///transpiled.ts.js"]
  }
}