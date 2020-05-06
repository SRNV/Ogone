import Ogone from './index.mjs';
import oRenderDOM from './oRenderDOM.mjs';
import oRenderNodesBehavior from './oRenderNodesBehavior.mjs';
import oRenderContext from './oRenderContext.mjs';
import oRenderComponentDatas from './oRenderComponentDatas.mjs';

export default function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
    oRenderComponentDatas(component);
    oRenderContext(path);
    oRenderNodesBehavior(path, component.rootNodePure);
  });
}