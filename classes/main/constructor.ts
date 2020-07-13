import UseStatementsInspector from "../inspectors/use-statements.ts";
import ComponentReader from "../readers/components.ts";
import oRenderImports from "../../src/ogone/compilation/inspection/imports.ts";
import oRenderScripts from "../../src/ogone/compilation/inspection/scripts.ts";
import oTopLevelTextNodeException from "../../src/ogone/compilation/inspection/top-level-exception.ts";
import oCleanPureRootNode from "../../src/ogone/compilation/inspection/clean-root-node.ts";
import oRenderStyles from "../../src/ogone/compilation/inspection/styles.ts";
import oStartRenderingDom from "../../src/ogone/compilation/start-render.ts";
import getStoreConnections from "../../src/ogone/compilation/inspection/store-connections.ts";
import { Bundle } from "../../.d.ts";
import { Configuration } from "../config/index.ts";

export default class Constructor extends Configuration {
  /**
     * instance to inspect the use statements inside the component
     */
  private UseStatementsInspector: UseStatementsInspector =
    new UseStatementsInspector();
  /**
     * instance to read the components inside the bundle
     * this instance will assign the components's rootnode
     */
  private ComponentReader: ComponentReader = new ComponentReader();
  constructor(opts: Configuration) {
    super(opts);
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
    await oRenderImports(bundle);
    await oRenderScripts(bundle);
    getStoreConnections(bundle);
    await oRenderStyles(bundle);
    oTopLevelTextNodeException(bundle);
    oCleanPureRootNode(bundle);
    await oStartRenderingDom(bundle);
    return bundle;
  }
}
