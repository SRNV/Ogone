import { Bundle, Component } from '../.d.ts';
import { colors } from '../deps.ts';
import { ModuleErrors } from './ModuleErrors.ts';
import { Utils } from "./Utils.ts";
/**
 * this class should create for each component
 * a new tsx file, it should expose the diagnostics to the end-user
 */
export default class TSXContextCreator extends Utils {
  async read(bundle: Bundle) {
    this.warn(`Type checking.`);
    const entries = Array.from(bundle.components.entries());
    for await (const [key, component] of entries) {
      if (component.isTyped) {
        await this.createContext(bundle, component);
      }
    }
  }
  private async createContext(bundle: Bundle, component: Component): Promise<void> {
    const { green, gray } = colors;
    const newpath = '/comp.tsx';
    const startPerf = performance.now();
    const { protocol } = component.context;
    const sources = {
      [newpath]: protocol,
    };
    // TODO use component.sources
    // TODO create OgoneSandBox
    component.savedModuleDependencies.forEach((item: any) => {
      const [key, imp] = item;
      // @ts-ignore
      souces[imp.absolutePath] = imp.textFile;
    });
    console.warn(protocol, component.modules);
    const [diags] = await Deno.compile(newpath, sources, {
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
    ModuleErrors.checkDiagnostics(component, diags as unknown[]);
    this.success(
      `${green(component.file)} - ${gray(Math.round(performance.now() - startPerf) + ' ms')}`,
    );
  }
}
