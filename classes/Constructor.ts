import ComponentsSubscriber from "./ComponentsSubscriber.ts";
import StylesheetBuilder from "./StylesheetBuilder.ts";
import ComponentBuilder from "./ComponentBuilder.ts";
import ImportsAnalyzer from "./ImportsAnalyzer.ts";
import ScriptBuilder from "./ScriptBuilder.ts";
import ComponentTopLevelAnalyzer from "./ComponentTopLevelAnalyzer.ts";
import StoreArgumentReader from "./StoreArgumentReader.ts";
import RuntimeCompiler from "./RuntimeCompiler.ts";
import type { Bundle } from "../.d.ts";
import { Utils } from "./Utils.ts";

/**
 * @name Constructor
 * @code OC0
 * @description step 0 for the application, this create the bundle of all the components and return it
 * by using the method getBundle
 * ```ts
 *  Constructor.getBundle(entrypoint: string): Promise<Bundle>
 * ```
 * @dependency ComponentsSubscriber
 * @dependency ComponentBuilder
 * @dependency ImportsAnalyzer
 * @dependency ScriptBuilder
 * @dependency ComponentTopLevelAnalyzer
 * @dependency StoreArgumentReader
 * @dependency StylesheetBuilder
 * @dependency RuntimeCompiler
 */
export default class Constructor extends Utils {
  private StoreArgumentReader: StoreArgumentReader =
    new StoreArgumentReader();
  private RuntimeCompiler: RuntimeCompiler = new RuntimeCompiler();
  private ComponentTopLevelAnalyzer: ComponentTopLevelAnalyzer = new ComponentTopLevelAnalyzer();
  private StylesheetBuilder: StylesheetBuilder = new StylesheetBuilder();
  private ScriptBuilder: ScriptBuilder = new ScriptBuilder();
  /**
   * saves modules and imported components inside component.imports[index]: string;
   */
  private ImportsAnalyzer: ImportsAnalyzer =
    new ImportsAnalyzer();
  /**
   * instance to inspect the use statements inside the component
   */
  private ComponentsSubscriber: ComponentsSubscriber =
    new ComponentsSubscriber();
  /**
   * instance to read the components inside the bundle
   * this instance will assign the rootnode Element to the component
   */
  private ComponentBuilder: ComponentBuilder = new ComponentBuilder();
  async getBundle(entrypoint: string): Promise<Bundle> {
    const bundle: Bundle = {
      files: [],
      datas: [],
      context: [],
      classes: [],
      contexts: [],
      customElements: [],
      // @ts-ignore
      components: new Map(),
      // @ts-ignore
      mapRender: new Map(),
      // @ts-ignore
      mapClasses: new Map(),
      // @ts-ignore
      mapContexts: new Map(),
      render: [],
      remotes: [],
      repository: {},
      types: {
        component: true,
        store: false,
        async: false,
        router: false,
        controller: false,
      },
    };
    // @code OCS1
    await this.ComponentsSubscriber.inspect(entrypoint, bundle);
    // @code OCB2
    await this.ComponentBuilder.read(bundle);
    // @code OIA3
    await this.ImportsAnalyzer.inspect(bundle);
    // @code OSB4
    if (this.ScriptBuilder) await this.ScriptBuilder.read(bundle);
    if (this.ComponentTopLevelAnalyzer) {
      // @code OCTLA5
      await this.ComponentTopLevelAnalyzer.switchRootNodeToTemplateNode(bundle);
    }
    if (this.StoreArgumentReader) {
      // @code OSAR6
      this.StoreArgumentReader.read(bundle);
    }
    // @code OSB7
    if (this.StylesheetBuilder) await this.StylesheetBuilder.read(bundle);

    if (this.ComponentTopLevelAnalyzer) {
      // @code OCTLA5
      await this.ComponentTopLevelAnalyzer.cleanRoot(bundle);
    }
    // @code ORC8
    await this.RuntimeCompiler.read(bundle);
    // @code OSB4
    await this.ScriptBuilder.inspectContexts(bundle);
    return bundle;
  }
}
