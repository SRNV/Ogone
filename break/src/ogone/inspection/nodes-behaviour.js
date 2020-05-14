import Ogone from "../index.ts";
import getElementExtension from "./extensions/element-extension.js";
import getWebComponent from "./extensions/get-web-component.js";

export default function oRenderNodesBehavior(
  keyComponent,
  node,
  structure = "",
  index = 0,
) {
  const component = Ogone.components.get(keyComponent);
  const isNodeComponent = component.imports[node.tagName];
  let nodeCE = !!isNodeComponent ? `${component.uuid}-${node.tagName}` : null;
  let query = "";
  if (node.tagName && node.nuuid) {
    query = `${structure} [${node.nuuid}]`.trim();
  } else {
    query = `${structure}`.trim();
  }
  if (node.tagName === null || (node.hasDirective && node.tagName)) {
    const elementExtension = getWebComponent(component, node);
    Ogone.classes.push(elementExtension);
  }
  if (node.childNodes) {
    node.childNodes.forEach((child, i) => {
      if (node.nodeType === 1) {
        oRenderNodesBehavior(keyComponent, child, query, i);
      }
    });
  }
}
