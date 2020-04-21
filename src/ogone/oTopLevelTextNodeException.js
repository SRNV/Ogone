const Ogone = require('./');

module.exports = function oTopLevelTextNodeException() {
  Ogone.components.forEach((c) => {
    c.rootNodePure.childNodes.forEach((node, id) => {
      if (node.nodeType === 3 && node.rawText.trim().length) {
        const TopLevelTextNodeException = new Error(`[Ogone] Top level text are not allowed, please wrap this text into an element:\t${node.rawText.trim()}\n\tcomponent: ${c.file}`)
        throw TopLevelTextNodeException;
      }
    });
  });
}