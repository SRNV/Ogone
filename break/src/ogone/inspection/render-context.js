import Ogone from "../index.ts";

export default function oRenderContext(keyComponent) {
  const component = Ogone.components.get(keyComponent);
  Object.entries(component.for).reverse().forEach(([nId, directive]) => {
    const { script } = directive;
    const { node, ctx } = script;
    const contextScript =
      node.hasDirective || !node.tagName && node.nodeType === 1
        ? `
    Ogone.contexts['${component.uuid}-${nId}'] = function(opts) {
        const GET_TEXT = opts.getText;
        const GET_LENGTH = opts.getLength;
        const POSITION = opts.position;
        ${
          component.data instanceof Object
            ? Object.keys(component.data).map((prop) =>
              `const ${prop} = this.${prop};`
            ).join("\n")
            : ""
        }
        ${script.value || ""}
        if (GET_TEXT) {
          return eval(GET_TEXT);
        }
        return {${[...Object.keys(ctx), ...Object.keys(component.data)]}};
      };
    `
        : `Ogone.contexts['${component.uuid}-${nId}'] = Ogone.contexts['${component.uuid}-${node.parentNode.id}'];`;
    Ogone.contexts.push(contextScript);
  });
}
