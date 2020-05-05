import Ogone from '.';
import oRenderDOM from './oRenderDOM';
import oRenderNodesBehavior from './oRenderNodesBehavior';
import oRenderContext from './oRenderContext';
import oRenderComponentDatas from './oRenderComponentDatas';

export default function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
    oRenderComponentDatas(component);
    oRenderContext(path);
    oRenderNodesBehavior(path, component.rootNodePure);
  });
}