import { Bundle, Component } from '../ogone.main.d.ts';
import { colors, existsSync, } from '../../deps/deps.ts';
import { walkSync } from '../../deps/walk.ts';
import { ModuleErrors } from './ModuleErrors.ts';
import { Utils } from "./Utils.ts";
/**
 * this class should create for each component
 * a new tsx file, it should expose the diagnostics to the end-user
 */
let i = 0;
export default class TSXContextCreator extends Utils {
  static subdistFolderURL = new URL('./.ogone', `file:/${Deno.cwd()}`);
  static createsubdistFolderURL = new URL('./.ogone', `file:/${Deno.cwd()}`);
  static globalAppContextURL = new URL('./tsx_context.ts', TSXContextCreator.subdistFolderURL);
  static globalAppContextFile: string = '';
  static mapCreatedFiles: URL[] = [];
  public static cleanDistFolder() {
    const files = walkSync(TSXContextCreator.subdistFolderURL.pathname, {
      includeFiles: true,
      includeDirs: false,
    });
    for (let file of files) {
      Deno.removeSync(file.path);
    }
  }
  async read(bundle: Bundle, opts: { checkOnly?: string } = {}) {
    const startPerf = performance.now();
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
      const diagnosticError = await this.readContext(bundle);
      TSXContextCreator.cleanFiles();
      if (diagnosticError) {
        hasError = diagnosticError;
      }
      if (!hasError) {
        this.infos(`Type checking took ~${Math.floor(performance.now() - startPerf)} ms`);
        this.success('no type error found.');
      }
    } catch (err) {
      this.error(`TSXContextCreator: ${err.message}
${err.stack}`);
    }
  }
  public static createDistFolder() {
    if(!existsSync(this.subdistFolderURL.pathname)) {
      Deno.mkdirSync(this.createsubdistFolderURL.pathname, { recursive: true, mode: 0o777});
    }
  }
  private static async cleanFiles() {
    TSXContextCreator.mapCreatedFiles.forEach((file) => {
      Deno.removeSync(file);
    })
  }
  private async createContext(bundle: Bundle, component: Component): Promise<void> {
    const { green, gray } = colors;
    const baseUrl = new URL(import.meta.url);
    baseUrl.pathname = component.file;
    const newpath = new URL(`./${component.uuid}.tsx`, TSXContextCreator.subdistFolderURL);
    const { protocol } = component.context;
    Deno.writeTextFileSync(newpath, protocol);
    TSXContextCreator.mapCreatedFiles.push(newpath);
    TSXContextCreator.globalAppContextFile += `
    /**
     * Context of ${component.file}
     * */
      import comp${i++} from '${newpath}';`;
  }
  private async readContext(bundle: Bundle): Promise<boolean> {
    try {
      const { green, gray } = colors;
      Deno.writeTextFileSync(TSXContextCreator.globalAppContextURL,
        TSXContextCreator.globalAppContextFile);
      TSXContextCreator.mapCreatedFiles.push(TSXContextCreator.globalAppContextURL);

      const resultEmit = await Deno.emit(TSXContextCreator.globalAppContextURL, {
        compilerOptions: {
          module: "esnext",
          target: "esnext",
          noImplicitThis: false,
          noFallthroughCasesInSwitch: false,
          allowJs: false,
          removeComments: false,
          experimentalDecorators: true,
          noImplicitAny: false,
          allowUnreachableCode: false,
          jsx: "react",
          jsxFactory: "h",
          // @ts-ignore
          jsxFragmentFactory: "hf",
          lib: ["dom", "esnext", "es2019"],
          inlineSourceMap: false,
          inlineSources: false,
          alwaysStrict: false,
          sourceMap: false,
          strictFunctionTypes: true,
        }
      });
      const { diagnostics: diags } = resultEmit;
      ModuleErrors.checkDiagnostics(bundle, diags as unknown[]);
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
