import { Bundle, Component } from '../ogone.main.d.ts';
import { colors, join } from '../../deps/deps.ts';
import { ModuleErrors } from './ModuleErrors.ts';
import { Utils } from "./Utils.ts";
/**
 * this class should create for each component
 * a new tsx file, it should expose the diagnostics to the end-user
 */
let i = 0;
export default class TSXContextCreator extends Utils {
  static subdistFolderURL = new URL('../main/dist/', import.meta.url);
  static globalAppContextURL = new URL('./tsx_context.ts', TSXContextCreator.subdistFolderURL);
  static globalAppContextFile: string = '';
  async read(bundle: Bundle, opts: { checkOnly?: string } = {}) {
    try {
      const { checkOnly } = opts;
      let hasError = false;
      this.warn(`Type checking.`);
      const entries = Array.from(bundle.components.entries());
      for await (const [key, component] of entries) {
        if (checkOnly && component.isTyped && (component.file === checkOnly
          || component.file.endsWith(checkOnly)
          || checkOnly && checkOnly.endsWith(component.file))) {
          await this.createContext(bundle, component);
        } else if (!checkOnly && component.isTyped) {
          await this.createContext(bundle, component);
        }
      }
      const diagnosticError = await this.readContext();
      if (diagnosticError) {
        hasError = diagnosticError;
      }
      if (!hasError) {
        this.success('no type error found.');
      }
    } catch (err) {
      this.error(`TSXContextCreator: ${err.message}
${err.stack}`);
    }
  }
  private async createContext(bundle: Bundle, component: Component): Promise<void> {
    const { green, gray } = colors;
    const baseUrl = new URL(import.meta.url);
    baseUrl.pathname = component.file;
    const newpath = new URL(`./${component.uuid}.tsx`, TSXContextCreator.subdistFolderURL);
    const { protocol } = component.context;
    console.warn(newpath, TSXContextCreator.subdistFolderURL.pathname)
    Deno.writeTextFileSync(newpath, protocol);
    TSXContextCreator.globalAppContextFile += `
    /**
     * Context of ${component.file}
     * */
      import comp${i++} from '${newpath}';`;
  }
  private async readContext(): Promise<boolean> {
    try {
      const { green, gray } = colors;
      const startPerf = performance.now();
      console.warn(TSXContextCreator.globalAppContextFile)
      Deno.writeTextFileSync(TSXContextCreator.globalAppContextURL,
        TSXContextCreator.globalAppContextFile);
      const resultEmit = await Deno.emit(TSXContextCreator.globalAppContextURL, {
        compilerOptions: {
          module: "esnext",
          target: "esnext",
          noImplicitThis: false,
          noFallthroughCasesInSwitch: false,
          allowJs: false,
          removeComments: false,
          experimentalDecorators: true,
          noImplicitAny: true,
          allowUnreachableCode: false,
          jsx: "react",
          jsxFactory: "h",
          // @ts-ignore
          jsxFragmentFactory: "hf",
          lib: ["dom", "esnext"],
          inlineSourceMap: false,
          inlineSources: false,
          alwaysStrict: false,
          sourceMap: false,
          strictFunctionTypes: true,
        }
      });
      const { diagnostics: diags } = resultEmit;
      ModuleErrors.checkDiagnostics(diags as unknown[]);
      if (diags && diags.length) {
        return true;
      }
      return false;
    } catch (err) {
      this.error(`TSXContextCreator: ${err.message}
${err.stack}`);
    }
  }
}
