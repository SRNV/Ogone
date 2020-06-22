import { Bundle } from '../../../../.d.ts';

export default function oCleanPureRootNode(bundle: Bundle) {
  bundle.components.forEach((c) => {
    c.rootNode.childNodes = c.rootNode.childNodes.filter((node, id) => {
      return node.tagName !== "style" &&
          node.tagName !== "script" &&
          node.tagName !== "proto" &&
          node.nodeType !== 8 ||
        (node.nodeType === 3 && node.rawText && !node.rawText.trim().length) ||
        (id === 0 && node.nodeType !== 3);
    });
  });
}