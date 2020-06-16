import oInspect from "./inspection/inspect.ts";
import oRender from "./inspection/render.ts";
import oRenderImports from "./inspection/imports.ts";
import oRenderScripts from "./inspection/scripts.ts";
import oTopLevelTextNodeException from "./inspection/top-level-exception.ts";
import oCleanPureRootNode from "./inspection/clean-root-node.ts";
import oRenderStyles from "./inspection/styles.ts";
import oStartRenderingDom from "./start-render.ts";
import getStoreConnections from "./inspection/store-connections.ts";
import { Bundle } from '../../../.d.ts';

export default async function (path: string) {
  const bundle: Bundle = {
    files: [],
    datas: [],
    context: [],
    classes: [],
    contexts: [],
    customElements: [],
    components: new Map(),
    render: [],
  };
  await oInspect(path, bundle);
  oRender(bundle);
  await oRenderImports(bundle);
  await oRenderScripts(bundle);
  getStoreConnections(bundle);
  oRenderStyles(bundle);
  oTopLevelTextNodeException(bundle);
  oCleanPureRootNode(bundle);
  await oStartRenderingDom(bundle);
  return bundle;
}
