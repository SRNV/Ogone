import Ogone from '../index.ts';

export default function oTopLevelTextNodeException() {
  Ogone.components.forEach((c) => {
    c.rootNodePure.childNodes.filter((node, id) => id !== 0).forEach((node, id) => {
      if (node.nodeType === 3 && node.rawText.trim().length) {
        const TopLevelTextNodeException = new Error(`[Ogone] Top level text are not allowed, excepted for the first lines, these will serve for the imports, services.\nplease wrap this text into an element:\t${node.rawText.trim()}\n\tcomponent: ${c.file}`)
        throw TopLevelTextNodeException;
      }
    });
  });
}