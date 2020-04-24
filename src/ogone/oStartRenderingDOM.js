const Ogone = require('.');
const oRenderDOM = require('./oRenderDOM');
const oRenderNodesBehavior = require('./oRenderNodesBehavior');

module.exports = function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
    const render = oRenderNodesBehavior(path, component.rootNodePure);
  });
}