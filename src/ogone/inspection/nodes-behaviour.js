import Ogone from "../index.ts";
import getWebComponent from "./extensions/get-web-component.js";

export default function oRenderNodesBehavior(
  keyComponent,
  node,
) {
  const component = Ogone.components.get(keyComponent);
  const isImported = component.imports[node.tagName];
  const subcomp = Ogone.components.get(isImported);
  if (node.tagName === null || (node.hasDirective && node.tagName)) {
    const elementExtension = getWebComponent(component, node);
    Ogone.classes.push(elementExtension);
  }
  if (node.attributes && node.attributes['--await'] && component.type !== 'async') {
    const BadUseOfAwaitInSyncComponentException = `[Ogone] --await must be used in an async component. define type="async" to the proto.\n Error in component: ${component.file}\n node: ${node.tagName}`;
    throw BadUseOfAwaitInSyncComponentException;
  }
  if (node.attributes && node.attributes['--await'] && isImported && subcomp.type !== "async") {
    const BadUseOfAwaitInSyncComponentException = `[Ogone] --await must be called only on async components. change type of <${node.tagName} --await /> or erase --await.\n Error in component: ${component.file}\n node: ${node.tagName}`;
    throw BadUseOfAwaitInSyncComponentException;
  }
  if (node.attributes && node.attributes['--defer'] && !isImported) {
    const BadUseDeferFeatureException = `[Ogone] --defer must be called only on async components. discard <${node.tagName} --defer="${node.attributes['--defer']}" />.\n Error in component: ${component.file}\n node: ${node.tagName}`;
    throw BadUseDeferFeatureException;
  }
  if (node.attributes && node.attributes['--defer'] && isImported && subcomp.type !== "async") {
    const BadUseDeferFeatureException = `[Ogone] --defer must be called only on async components. change type of <${node.tagName} --defer="${node.attributes['--defer']}" /> or delete it.\n Error in component: ${component.file}\n node: ${node.tagName}`;
    throw BadUseDeferFeatureException;
  }
  if (node.childNodes) {
    node.childNodes.forEach((child) => {
      if (node.nodeType === 1) {
        oRenderNodesBehavior(keyComponent, child);
      }
    });
  }
}
