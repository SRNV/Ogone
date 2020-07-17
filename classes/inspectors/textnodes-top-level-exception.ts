import { Bundle } from "../../.d.ts";
import { Utils } from "../utils/index.ts";

export default class extends Utils {
  read(bundle: Bundle) {
    bundle.components.forEach((c) => {
      c.rootNode.childNodes.filter((node, id) => id !== 0).forEach(
        (node) => {
          if (
            node.nodeType === 3 && node.rawText && node.rawText.trim().length
          ) {
            this.error(
              `Top level text are not allowed, excepted for the first lines, these will serve for the imports, services.\nplease wrap this text into an element:\t${node.rawText.trim()}\n\tcomponent: ${c.file}`,
            );
          }
        },
      );
    });
  }
  cleanRoot(bundle: Bundle) {
    bundle.components.forEach((c) => {
      c.rootNode.childNodes = c.rootNode.childNodes.filter((node, id) => {
        return node.tagName !== "style" &&
            node.tagName !== "script" &&
            node.tagName !== "proto" &&
            node.nodeType !== 8 ||
          (node.nodeType === 3 && node.rawText &&
            !node.rawText.trim().length) ||
          (id === 0 && node.nodeType !== 3);
      });
    });
  }
}
