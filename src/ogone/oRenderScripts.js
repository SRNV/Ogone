const BABEL = require("@babel/core");
const Ogone = require('./');
const scriptType = [
  'o-init',
  'o-created',
  'o-before-insert',
  'o-close',
  'o-inserted'
];

module.exports = function oRenderScripts() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const scripts = component.rootNode.childNodes.filter(node => node.tagName === 'script');
    scripts.forEach((element) => {
      const { code } = BABEL.transformSync(element.rawText, {
        code: true,
        plugins: [
          // "@babel/plugin-transform-flow-strip-types",
          // "@babel/plugin-transform-modules-umd",
          ["@babel/plugin-transform-react-jsx", { pragma: Ogone.pragma }],
        ],
      });
      const anonymousFunction = `try {\n ${code}\n} catch(AnonymousFunctionException) {\n  console.error(AnonymousFunctionException);\n}`;
      scriptType.forEach((t) => {
        if (element.hasAttribute(t)) {
          component.scripts[t] = anonymousFunction;
        }
      })
    });
  })
}