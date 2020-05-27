import oInspect from "../inspection/inspect.js";
import oRender from "../inspection/render.js";
import oRenderImports from "../inspection/imports.js";
import oRenderScripts from "../inspection/scripts.js";
import oTopLevelTextNodeException from "../inspection/top-level-exception.js";
import oCleanPureRootNode from "../inspection/clean-root-node.js";
import oRenderStyles from "../inspection/styles.js";
import oStartRenderingDom from "./start-render.js";
import getStoreConnections from "../inspection/store-connections.js";

export default function () {
  oInspect();
  oRender();
  oRenderScripts();
  oRenderImports();
  getStoreConnections();
  oRenderStyles();
  oTopLevelTextNodeException();
  oCleanPureRootNode();
  oStartRenderingDom();
}
