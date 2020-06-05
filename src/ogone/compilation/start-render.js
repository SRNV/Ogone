import oRenderDOM from "../inspection/render-dom.js";
import oRenderComponentDatasMjs from "../inspection/render-component-datas.js";
import oRenderContext from "../inspection/render-context.js";
import oRenderNodesBehavior from "../inspection/nodes-behaviour.js";

export default function oStartRenderingDom(bundle) {
  const entries = Array.from(bundle.components);
  entries.forEach(([path, component]) => {
    oRenderDOM(bundle, path, component.rootNodePure);
    oRenderComponentDatasMjs(bundle, component);
    oRenderContext(bundle, path);
    oRenderNodesBehavior(bundle, path, component.rootNodePure);
  });
}
