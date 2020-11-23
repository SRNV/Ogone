import { Bundle, Component } from '../.d.ts';
import { ModuleErrors } from './ModuleErrors.ts';
import { Utils } from "./Utils.ts";
/**
 * this class should create for each component
 * a new tsx file, it should expose the diagnostics to the end-user
 */
export default class TSXContextCreator extends Utils {
  async read(bundle: Bundle) {
    const entries = Array.from(bundle.components.entries());
    await setTimeout(async () => {
      entries.forEach(async ([key, component]) => {
        await this.createContext(bundle, component);
      })
    }, 0);
  }
  private async createContext(bundle: Bundle, component: Component): Promise<void> {
    const newpath = '/comp.tsx';
    const startPerf = performance.now();
    const [diags, emit] = await Deno.compile(newpath, {
      [newpath]: component.context.protocol,
    }, {
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
    });
    this.warn(
      `TSC: ${component.file} - ${Math.round(performance.now() - startPerf)
      } ms`,
    );
    ModuleErrors.checkDiagnostics(diags as unknown[]);
  }
}
