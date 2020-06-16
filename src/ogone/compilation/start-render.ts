import oRenderDOM from "./inspection/render-dom.ts";
import oRenderComponentDatasMjs from "./inspection/render-component-datas.ts";
import oRenderContext from "./inspection/render-context.ts";
import oRenderNodesBehavior from "./inspection/nodes-behaviour.ts";
import { Bundle } from '../../../.d.ts';

export default async function oStartRenderingDom(bundle: Bundle) {
  const entries = Array.from(bundle.components);
  for await (let [path, component] of entries) {
    oRenderDOM(bundle, path, component.rootNode);
    await oRenderComponentDatasMjs(bundle, component);
    await oRenderContext(bundle, path);
    await  oRenderNodesBehavior(bundle, path, component.rootNode);
  }
}
