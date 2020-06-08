import { Bundle } from '../../../.d.ts';

export default function oTopLevelTextNodeException(bundle: Bundle) {
  bundle.components.forEach((c) => {
    c.rootNode.childNodes.filter((node, id) => id !== 0).forEach(
      (node) => {
        if (node.nodeType === 3 && node.rawText && node.rawText.trim().length) {
          const TopLevelTextNodeException = new Error(
            `[Ogone] Top level text are not allowed, excepted for the first lines, these will serve for the imports, services.\nplease wrap this text into an element:\t${node.rawText.trim()}\n\tcomponent: ${c.file}`,
          );
          throw TopLevelTextNodeException;
        }
      },
    );
  });
}
