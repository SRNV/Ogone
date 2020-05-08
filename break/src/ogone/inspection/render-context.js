import Ogone from '../index.ts';

export default function oRenderContext(keyComponent) {
  const component = Ogone.components.get(keyComponent);
  Object.entries(component.for).forEach(([querySelector, directive]) => {
    const { script, } = directive;
    console.warn(script)
    const contextScript = `
    Ogone.contexts['${component.uuid}-${querySelector}'] = function(opts) {
        const {
          getLength: GET_LENGTH,
          getText: GET_TEXT,
          query: QUERY,
          position: POSITION,
        } = opts;
        ${
            component.data instanceof Object ?
            Object.keys(component.data).map((prop) => `const ${prop} = this.${prop};`).join('\n')
            : ''
        }
        ${script.value || ''}
        if (GET_TEXT && !GET_LENGTH) {
            return eval(\`(\${GET_TEXT})\`);
        }
      };
    `;
    Ogone.contexts.push(contextScript);
  });
};
