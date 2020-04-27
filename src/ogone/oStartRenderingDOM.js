const Ogone = require('.');
const oRenderDOM = require('./oRenderDOM');
const oRenderNodesBehavior = require('./oRenderNodesBehavior');
const oRenderContext = require('./oRenderContext');
const oRenderComponentDatas = require('./oRenderComponentDatas');

module.exports = function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
    oRenderComponentDatas(component);
    oRenderContext(path);
    oRenderNodesBehavior(path, component.rootNodePure);
  });
}