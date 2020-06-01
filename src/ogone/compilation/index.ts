import oInspect from "../inspection/inspect.js";
import oRender from "../inspection/render.js";
import oRenderImports from "../inspection/imports.js";
import oRenderScripts from "../inspection/scripts.js";
import oTopLevelTextNodeException from "../inspection/top-level-exception.js";
import oCleanPureRootNode from "../inspection/clean-root-node.js";
import oRenderStyles from "../inspection/styles.js";
import oStartRenderingDom from "./start-render.js";
import getStoreConnections from "../inspection/store-connections.js";

export default async function (path: string) {
  await oInspect(path);
  await oRender();
  await oRenderImports();
  await oRenderScripts();
  await getStoreConnections();
  await oRenderStyles();
  await oTopLevelTextNodeException();
  await oCleanPureRootNode();
  await oStartRenderingDom();
}
