const Ogone = require('./');

module.exports = function() {
  Ogone.components.forEach((c) => {
    c.rootNodePure.childNodes.forEach((node, id) => {
      if (node.nodeType === 1 && node.getAttribute('o-for')) {
        const TopLevelOForException = new Error(`[Ogone] Top level o-for directive are not allowed.\n\tcomponent: ${c.file}`)
        throw TopLevelOForException;
      }
    });
  });
}