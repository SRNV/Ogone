import UseStatementsInspector from "../inspectors/use-statements.ts";
import StyleInspector from "../inspectors/styles-inspector.ts";
import ComponentReader from "../readers/components.ts";
import ImportedComponentsInpector from "../inspectors/imported-components-inspector.ts";
import ScriptInspector from "../inspectors/script-inspector.ts";
import NodeManager from "../inspectors/textnodes-top-level-exception.ts";
import oStartRenderingDom from "../../src/ogone/compilation/start-render.ts";
import StoreConnectionsInspector from "../inspectors/store-connections-inspector.ts";
import { Bundle } from "../../.d.ts";
import { Configuration } from "../config/index.ts";

export default class Constructor extends Configuration {
  private StoreConnectionsInspector: StoreConnectionsInspector;
  private NodeManager: NodeManager;
  private StyleInspector: StyleInspector;
  private ScriptInspector: ScriptInspector;
  /**
   * saves modules and imported components inside component.imports[index]: string;
   */
  private ImportedComponentsInpector: ImportedComponentsInpector =
    new ImportedComponentsInpector();
  /**
   * instance to inspect the use statements inside the component
   */
  private UseStatementsInspector: UseStatementsInspector =
    new UseStatementsInspector();
  /**
   * instance to read the components inside the bundle
   * this instance will assign the rootnode Element to the component
   */
  private ComponentReader: ComponentReader = new ComponentReader();
  constructor(opts: Configuration) {
    super(opts);
    this.ScriptInspector = new ScriptInspector(opts);
    this.StoreConnectionsInspector = new StoreConnectionsInspector(opts);
    this.StyleInspector = new StyleInspector(opts);
    this.NodeManager = new NodeManager(opts);
  }
  async getBundle(): Promise<Bundle> {
    const bundle: Bundle = {
      files: [],
      datas: [],
      context: [],
      classes: [],
      contexts: [],
      customElements: [],
      components: new Map(),
      render: [],
      remotes: [],
      repository: {},
    };
    await this.UseStatementsInspector.inspect(this.entrypoint, bundle);
    await this.ComponentReader.read(bundle);
    await this.ImportedComponentsInpector.inspect(bundle);
    if (this.ScriptInspector) this.ScriptInspector.read(bundle);
    if (this.StoreConnectionsInspector) {
      this.StoreConnectionsInspector.read(bundle);
    }
    if (this.StyleInspector) await this.StyleInspector.read(bundle);
    if (this.NodeManager) {
      await this.NodeManager.read(bundle);
      await this.NodeManager.cleanRoot(bundle);
    }
    await oStartRenderingDom(bundle);
    return bundle;
  }
}
