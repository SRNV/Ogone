import iterator from "../../lib/iterator.ts";
import oRenderForFlag from "./render-for-flag.ts";
import { Bundle, XMLNodeDescription, LegacyDescription } from '../../../.d.ts';

const flags = [
  "--if",
  "--else",
  "--for",
  "--click",
  "--mousemove",
  "--mousedown",
  "--mouseup",
  "--mouseleave",
  "--dblclick",
  "--drag",
  "--dragend",
  "--dragstart",
  "--model",
  "--transform",
  "--html",
  "--input",
];

export default function oRenderDOM(
  bundle: Bundle,
  keyComponent: string,
  node: XMLNodeDescription,
  legacy: LegacyDescription = {
    limit: 0,
    ctx: {},
    script: [],
    getLengthDeclarationAfterArrayEvaluation: "",
    declarationScript: [],
    callbackDeclaration: "",
  },
) {
  try {
    const component = bundle.components.get(keyComponent);
    let contextLegacy: LegacyDescription = {};
    if (component && node.attributes) {
      const attrs = Object.keys(node.attributes);
      const keyData = Object.keys(component.data);
      attrs.forEach((key) => {
        if (!key.startsWith("--")) return;
        node.hasFlag = true;
        keyData.forEach((key2) => {
          if (
            // @ts-ignore
            node.attributes[key].indexOf &&
            // @ts-ignore
            node.attributes[key].indexOf(key2) > -1 &&
            !node.dependencies.includes(key2)
          ) {
            node.dependencies.push(key2);
          }
        });
      });
    }
    if (node.tagName) {
      if (!node.attributes) {
        node.attributes = {};
      }
      if (component && node.attributes) {
        node.attributes[component.uuid] = true;
      }
    }
    if (legacy) {
      contextLegacy = Object.assign(legacy, {});
    }
    if (node.attributes['--for']) {
      const v = node.attributes['--for']
      // get the flags
      const oForFlag = oRenderForFlag(v as string);
      const { item, index, array } = oForFlag;
      if (legacy.ctx) {
        if (legacy.ctx[item]) {
          const ItemNameAlreadyInUseException = new Error(
            `[Ogone] '${item}' is already defined in the template, as item`,
          );
          throw ItemNameAlreadyInUseException;
        }
        if (legacy.ctx[index]) {
          const IndexAlreadyInUseException = new Error(
            `[Ogone] '${index}' is already defined in the template, as index`,
          );
          throw IndexAlreadyInUseException;
        }
        legacy.ctx[index] = true;
        legacy.ctx[item] = oForFlag;
        node.hasFlag = true;
        const getLengthScript = `
                if (GET_LENGTH) {
                  return (_____a_).length;
                }`;
        legacy.arrayName = array;
        legacy.getLength = getLengthScript;
        if (contextLegacy) {
          const declarationScript = [`
                    let ${index} = POSITION[${contextLegacy.limit}],
                    ${item} = (_____a_)[${index}];`];

          if (contextLegacy && contextLegacy.declarationScript) {
            contextLegacy.declarationScript = contextLegacy.declarationScript
              .concat(declarationScript);
          }
          delete node.attributes['--for'];
        }
      }
    }
    if (node.childNodes?.length) {
      node.childNodes
        .forEach((el, i) => {
          if (component && component.data && el.nodeType === 3) {
            const data = el.rawText;
            Object.keys(component.data).forEach((key) => {
              const result = data;
              // need to be more precise here
              // @ts-ignore
              if (result.indexOf("\${") > -1 && result.indexOf(`${key}`) > -1) {
                if (!node.dependencies.includes(key)) {
                  node.dependencies.push(key);
                }
              }
            });
          }
          if (contextLegacy) {
            oRenderDOM(bundle, keyComponent, el, {
              ...contextLegacy,
              ctx: { ...contextLegacy.ctx },
              declarationScript: [...(contextLegacy && contextLegacy.declarationScript ? contextLegacy.declarationScript : [])],
              callbackDeclaration: "",
              // @ts-ignore
              limit: contextLegacy.limit + 1,
            });
          }
        });
    }
    if (contextLegacy) {
      const value = `${contextLegacy.declarationScript ? contextLegacy.declarationScript.join("") : ''} `;
      contextLegacy.script = {
        value,
        node,
        ctx: legacy.ctx,
        getLength: legacy.getLength,
        array: legacy.arrayName,
      };
      if (component && node.id) {
        component.for[node.id] = contextLegacy;
      }
    }
  } catch (oRenderDOMException) {
    console.error(oRenderDOMException);
  }
}
