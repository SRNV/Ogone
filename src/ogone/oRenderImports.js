const path = require('path');
const Ogone = require('./');
const jsThis = require('../../js-this/switch');

module.exports = function oRenderImports() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const firstNode = component.rootNodePure.childNodes.find((node) => node.nodeType !== 3);
    const index = component.rootNodePure.childNodes.indexOf(firstNode);
    const textNodes = component.rootNodePure.childNodes.filter((node, id) => node.nodeType === 3 && id < index);
    let declarations = ``;
    textNodes.forEach((node) => {
      declarations += node.rawText;
    });
    if (declarations.length) {
      const tokens = jsThis(declarations, {
        onlyDeclarations: true,
      });
      if (tokens.body && tokens.body.use) {
        Object.values(tokens.body.use).forEach((item) => {
          const { src } = Ogone.config;
          const pathToSrc = path.join(process.cwd(), src);
          const pathComponent = path.join(pathToSrc, item.path);
          component.imports[item.as.replace(/['"`]/gi, '')] = pathComponent;
        });
      }
      component.properties = tokens.body.properties;
    }
  })
};
