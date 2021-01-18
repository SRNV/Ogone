import { Bundle, Component } from '../ogone.main.d.ts';
import { colors, join } from '../../deps/deps.ts';
import { ModuleErrors } from './ModuleErrors.ts';
import { Utils } from "./Utils.ts";
/**
 * this class should create for each component
 * a new tsx file, it should expose the diagnostics to the end-user
 */
export default class TSXContextCreator extends Utils {
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
          const diagnosticError = await this.createContext(bundle, component);
          if (diagnosticError) {
            hasError = diagnosticError;
          }
        } else if (!checkOnly && component.isTyped) {
          const diagnosticError = await this.createContext(bundle, component);
          if (diagnosticError) {
            hasError = diagnosticError;
          }
        }
      }
      if (!hasError) {
        this.success('no type error found.');
      }
    } catch (err) {
      this.error(`TSXContextCreator: ${err.message}
${err.stack}`);
    }
  }
  private async createContext(bundle: Bundle, component: Component): Promise<boolean> {
    try {
      const { green, gray } = colors;
      const baseUrl = new URL(import.meta.url);
      baseUrl.pathname = component.file;
      const p = new URL(`/${component.file}.tsx`, baseUrl).pathname;
      const newpath = join(Deno.cwd(), `.${p}`);
      const startPerf = performance.now();
      const { protocol } = component.context;
      Deno.writeTextFileSync(newpath, protocol);
      const { diagnostics: diags } = await Deno.emit(newpath, {
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
      Deno.removeSync(newpath);
      ModuleErrors.checkDiagnostics(component, diags as unknown[]);
      if (diags && diags.length) {
        return true;
      } else {
        this.success(
          `${green(component.file)} - ${gray(Math.round(performance.now() - startPerf) + ' ms')}`,
        );
        return false;
      }
    } catch (err) {
      this.error(`TSXContextCreator: ${err.message}
${err.stack}`);
    }
  }
}
