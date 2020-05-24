import Ogone from "../index.ts";

export default function oRenderContext(keyComponent) {
  const component = Ogone.components.get(keyComponent);
  Object.entries(component.for).forEach(([nId, directive]) => {
    const { script } = directive;
    const { node, ctx, getLength, array } = script;
    let contextIf = null;
    if (node.attributes && node.attributes["--if"]) {
      let nxt = node.nextElementSibling;
      node.ifelseBlock = {
        main: node.attributes["--if"],
        ifDirective: {
          [node.id]: node.attributes["--if"],
        },
        elseIf: {},
        elseDirective: {},
      };
      while (
        nxt && nxt.attributes &&
        (nxt.attributes["--else-if"] || nxt.attributes["--else"])
      ) {
        nxt.ifelseBlock = node.ifelseBlock;
        if (nxt.attributes["--else-if"]) {
          node.ifelseBlock.elseIf[nxt.id] = nxt.attributes["--else-if"];
        } else {
          node.ifelseBlock.elseDirective[nxt.id] = nxt.attributes["--else"];
        }

        const elseDir = !!nxt.attributes["--else"];
        nxt = nxt.nextElementSibling;
        if (
          elseDir && nxt && nxt.attributes &&
          (!!nxt.attributes["--else"] || !!nxt.attributes["--else-if"])
        ) {
          throw new Error(
            "[Ogone] else directive has to be the last in if-else-if blocks, no duplicate of --else are allowed.",
          );
        }
      }
    }
    if (node.ifelseBlock) {
      node.hasDirective = true;
      const { ifDirective, elseDirective, elseIf, main } = node.ifelseBlock;
      const isElse = elseDirective[node.id];
      const isElseIf = elseIf[node.id];
      const isMain = ifDirective[node.id];
      const allElseIf = Object.values(elseIf);
      if (!!isMain) {
        contextIf = `
          if (GET_LENGTH && !(${main})) {
            return 0;
          }
        `;
      } else if (!!isElseIf) {
        contextIf = `
          if (GET_LENGTH && (${main})) {
            return 0;
          } else if (GET_LENGTH && !(${isElseIf})) {
            return 0;
          }
        `;
      } else if (!!isElse) {
        contextIf = `
          if (GET_LENGTH && (${main})) {
            return 0;
          ${
          allElseIf.map((key) => {
            return `
          } else if (GET_LENGTH && ${key}) {
            return 0;`;
          }).join("\n")
        }
          }
        `;
      }
    }
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
        ${array ? `const _____a_ = ${array} || [];` : ""}

        ${contextIf ? contextIf : ""}
        ${script.value || ""}
        ${getLength ? getLength : ""}
        if (GET_TEXT) {
          try {
            return eval(GET_TEXT);
          } catch(err) {
            Ogone.error('Error in component:\\n\\t ${component.file}', err.message ,err);
            throw err;
          }
        }
        return {${[...Object.keys(ctx), ...Object.keys(component.data)]}};
      };
    `
        : `Ogone.contexts['${component.uuid}-${nId}'] = Ogone.contexts['${component.uuid}-${node.parentNode.id}'];`;
    Ogone.contexts.push(contextScript);
  });
}
