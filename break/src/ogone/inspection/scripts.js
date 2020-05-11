// import BABEL from "@babel/core";
import Ogone from '../index.ts';
import jsThis from '../../../lib/js-this/switch.js';


export default function oRenderScripts() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const moduleScript = component.rootNode.childNodes.find(node => node.tagName === 'proto')?.childNodes[0];
    if (moduleScript) {
      const ogoneScript = jsThis(moduleScript.rawText, { data: true, reactivity: true, });
      component.data = ogoneScript.body.data;
      const { value } = ogoneScript;
      let script = `(function (_state) { switch(_state) { ${value} } });`;
      /*
      const { code } = BABEL.transformSync(script, {
        code: true,
        plugins: [
          // "@babel/plugin-transform-flow-strip-types",
          // "@babel/plugin-transform-modules-umd",
          ["@babel/plugin-transform-react-jsx", { pragma: Ogone.pragma }],
        ],
      });
      */
      component.scripts.runtime = script;
    }
    if (component.properties && component.data && component.properties.length) {
      component.properties.forEach(([key]) => {
        if (component.data[key]) {
          const AlreadyDefinedPropAsDatainComponentException = new Error(`${key} is already defined in datas for component ${component.file}`);
          throw AlreadyDefinedPropAsDatainComponentException;
        }
        component.data[key] = null;
      });
    }
  })
}