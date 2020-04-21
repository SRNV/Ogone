const Ogone = require('./');

module.exports = function oRenderImports() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const comments = component.rootNode.childNodes.filter(node => node.nodeType === 8);
    const reg = /([a-zA-Z0-9\-]*)+(\s)(from)(\s)([\.\/a-zA-Z0-9]*)+/gi;
    comments
      .filter(comment => comment.rawText.match(reg))
      .forEach((imported) => {
        const instruction = imported.rawText;
        const importSyntax =  /([a-zA-Z0-9\-]*)+(\s)(from)(\s)([\.\/a-zA-Z0-9]*)+/gi.exec(instruction);
        if (!importSyntax) return;
        const pathComponent = path.join(pathToComponent, importSyntax[5]);
        component.imports[pathComponent] = importSyntax[1];
      });
  })
};