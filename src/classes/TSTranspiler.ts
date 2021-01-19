import { Utils } from "./Utils.ts";
import MapOutput from './MapOutput.ts';
import { Bundle } from "../ogone.main.d.ts";

export default class TSTranspiler extends Utils {
  static browserBundlePatternURL = new URL('../bundle/browser_pattern.ts', import.meta.url);
  static runtimeURL = new URL('../main/Ogone.ts', import.meta.url);
  static transpileCompilerOptions = { sourceMap: false, };
  static async transpile(text: string): Promise<string> {
    try {
      return (await Deno.emit('/transpiled.ts', {
        check: false,
        sources: {
          "/transpiled.ts": text,
        },
        compilerOptions: this.transpileCompilerOptions,
      })).files["file:///transpiled.ts.js"]
    } catch {
      return text;
    }
  }
  static async bundle(url: URL | string): Promise<string> {
    let result = (await Deno.emit(url, {
      bundle: 'esm',
      check: false,
    }));
    const file = result.files['deno:///bundle.js'];
    return file;
  }
  /**
   * saves Ogone's runtime, which is bundled, into MapOutput.runtime
   */
  static async getRuntime(bundle: Bundle) {
    MapOutput.runtime = await this.bundle(this.runtimeURL);
    MapOutput.runtime += bundle.output;
  }
}