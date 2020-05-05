import Ogone from './';

export default function oCleanPureRootNode() {
  Ogone.components.forEach((c) => {
    c.rootNodePure.childNodes = c.rootNodePure.childNodes.filter((node) => {
      return node.tagName !== 'style' &&
      node.tagName !== 'script' &&
      node.tagName !== 'module' &&
      node.nodeType !== 8 ||
      (node.nodeType === 3 && !node.rawText.trim().length)
    })
  });
}