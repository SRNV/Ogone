import { join } from 'https://deno.land/std@v0.42.0/path/win32.ts';
import Ogone from '../index.ts';
import jsThis from '../../../lib/js-this/switch.js';

export default function oRenderImports() {
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
      const importBody = jsThis(declarations, {
        esm: true,
      });
      if (importBody.body && importBody.body.imports) {
        const { imports } = importBody.body;
        component.esmExpressions = Object.values(imports).map(imp => imp.expression).join('\n')
        component.exportsExpressions = Object.values(imports).map(imp => imp.exports).join('\n')
      }
      if (tokens.body && tokens.body.use) {
        Object.values(tokens.body.use).forEach((item) => {
          const pathComponent = item.path;
          component.imports[item.as.replace(/['"`]/gi, '')] = pathComponent;
        });
      }
      textNodes.forEach((node) => {
        node.rawText = '';
      });
      component.properties = tokens.body.properties;
    }
  })
};
