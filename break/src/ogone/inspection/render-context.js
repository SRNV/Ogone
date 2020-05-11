import Ogone from '../index.ts';

export default function oRenderContext(keyComponent) {
  const component = Ogone.components.get(keyComponent);
  Object.entries(component.for).reverse().forEach(([nId, directive]) => {
    const { script } = directive;
    const { node } = script;
    const contextScript = node.hasDirective || !node.tagName && node.nodeType === 1 ? `
    Ogone.contexts['${component.uuid}-${nId}'] = function(opts) {
        const {
          getText: GET_TEXT,
          getLength: GET_LENGTH,
          position: POSITION,
        } = opts;
        ${
            component.data instanceof Object ?
            Object.keys(component.data).map((prop) => `const ${prop} = this.${prop};`).join('\n')
            : ''
        }
        ${script.value || ''}
        if (GET_TEXT) {
          return eval(GET_TEXT);
        }
      };
    ` : `Ogone.contexts['${component.uuid}-${nId}'] = Ogone.contexts['${component.uuid}-${node.parentNode.id}'];`;
    Ogone.contexts.push(contextScript);
  });
};
