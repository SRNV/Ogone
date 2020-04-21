const Ogone = require('.');
const oRenderDOM = require('./oRenderDOM');

module.exports = function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
  });
}