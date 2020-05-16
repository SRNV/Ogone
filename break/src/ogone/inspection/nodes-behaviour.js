import Ogone from "../index.ts";
import getWebComponent from "./extensions/get-web-component.js";

export default function oRenderNodesBehavior(
  keyComponent,
  node,
) {
  const component = Ogone.components.get(keyComponent);
  if (node.tagName === null || (node.hasDirective && node.tagName)) {
    const elementExtension = getWebComponent(component, node);
    Ogone.classes.push(elementExtension);
  }
  if (node.childNodes) {
    node.childNodes.forEach((child) => {
      if (node.nodeType === 1) {
        oRenderNodesBehavior(keyComponent, child);
      }
    });
  }
}
