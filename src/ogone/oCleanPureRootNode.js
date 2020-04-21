const Ogone = require('./');

module.exports = function oCleanPureRootNode() {
  Ogone.components.forEach((c) => {
    c.rootNodePure.childNodes = c.rootNodePure.childNodes.filter((node) => {
      return node.tagName !== 'style' &&
      node.tagName !== 'script' &&
      node.nodeType !== 8 ||
      (node.nodeType === 3 && !node.rawText.trim().length)
    })
  });
}