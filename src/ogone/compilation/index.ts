import oInspect from "../inspection/inspect.js";
import oRender from "../inspection/render.ts";
import oRenderImports from "../inspection/imports.js";
import oRenderScripts from "../inspection/scripts.js";
import oTopLevelTextNodeException from "../inspection/top-level-exception.js";
import oCleanPureRootNode from "../inspection/clean-root-node.js";
import oRenderStyles from "../inspection/styles.js";
import oStartRenderingDom from "./start-render.js";
import getStoreConnections from "../inspection/store-connections.js";
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
  await oRender(bundle);
  await oRenderImports(bundle);
  await oRenderScripts(bundle);
  await getStoreConnections(bundle);
  await oRenderStyles(bundle);
  await oTopLevelTextNodeException(bundle);
  await oCleanPureRootNode(bundle);
  await oStartRenderingDom(bundle);
  return bundle;
}
