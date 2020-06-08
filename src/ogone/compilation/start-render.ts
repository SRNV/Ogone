import oRenderDOM from "../inspection/render-dom.ts";
import oRenderComponentDatasMjs from "../inspection/render-component-datas.ts";
import oRenderContext from "../inspection/render-context.ts";
import oRenderNodesBehavior from "../inspection/nodes-behaviour.ts";
import { Bundle } from '../../../.d.ts';

export default function oStartRenderingDom(bundle: Bundle) {
  const entries = Array.from(bundle.components);
  entries.forEach(([path, component]) => {
    oRenderDOM(bundle, path, component.rootNode);
    oRenderComponentDatasMjs(bundle, component);
    oRenderContext(bundle, path);
    oRenderNodesBehavior(bundle, path, component.rootNode);
  });
}
