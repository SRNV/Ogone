import Ogone from "../index.ts";
import oRenderDOM from "../inspection/render-dom.js";
import oRenderComponentDatasMjs from "../inspection/render-component-datas.js";
import oRenderContext from "../inspection/render-context.js";
import oRenderNodesBehavior from "../inspection/nodes-behaviour.js";

export default function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
    oRenderComponentDatasMjs(component);
    oRenderContext(path);
    oRenderNodesBehavior(path, component.rootNodePure);
  });
}
