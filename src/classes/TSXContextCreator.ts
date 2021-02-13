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
  static subdistFolderURL = './.ogone';
  static createsubdistFolderURL = './.ogone';
  static globalAppContextURL = './.ogone/ts_context.ts';
  static globalAppContextFile: string = '';
  static mapCreatedFiles: string[] = [];
  public static cleanDistFolder() {
    const files = walkSync(TSXContextCreator.subdistFolderURL, {
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
    if(!existsSync('.ogone')) {
      Deno.mkdirSync('.ogone');
    }
  }
  private static async cleanFiles() {
    TSXContextCreator.mapCreatedFiles.forEach((file) => {
      if (existsSync(file)) Deno.removeSync(file);
    });
    TSXContextCreator.mapCreatedFiles.splice(0);
  }
  private async createContext(bundle: Bundle, component: Component): Promise<void> {
    const newpath = `./.ogone/${component.uuid}.tsx`;
    const { protocol } = component.context;
    Deno.writeTextFileSync(newpath, protocol);
    TSXContextCreator.mapCreatedFiles.push(newpath);
    const componentName = `comp${i++}`
    TSXContextCreator.globalAppContextFile += `
    /**
     * Context of ${component.file}
     * */
      import ${componentName} from './${component.uuid}.tsx';
      ${componentName}['set'] = 0;
      `;
  }
  private async readContext(bundle: Bundle): Promise<boolean> {
    try {
      const { green, gray } = colors;
      Deno.writeTextFileSync(TSXContextCreator.globalAppContextURL,
        TSXContextCreator.globalAppContextFile);
      TSXContextCreator.mapCreatedFiles.push(TSXContextCreator.globalAppContextURL);

      const resultEmit = await Deno.emit(TSXContextCreator.globalAppContextURL, {
        bundle: 'esm',
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
