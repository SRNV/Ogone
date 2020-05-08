import Ogone from './index.js';
import oRenderDOM from './oRenderDOM.js';
import oRenderNodesBehavior from './oRenderNodesBehavior.js';
import oRenderContext from './oRenderContext.js';
import oRenderComponentDatas from './oRenderComponentDatas.js';

export default function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
    oRenderComponentDatas(component);
    oRenderContext(path);
    oRenderNodesBehavior(path, component.rootNodePure);
  });
}