import iterator from "../../lib/iterator.ts";
import oRenderForFlag from "./render-for-flag.js";

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
  bundle,
  keyComponent,
  node,
  structure = "",
  id = null,
  legacy = {
    tree: [],
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
    const nUuid = `o-${iterator.next().value}`;
    let query = "";
    let contextLegacy = {};
    node.dependencies = [];
    if (node.attributes) {
      const attrs = Object.keys(node.attributes);
      const keyData = Object.keys(component.data);
      attrs.forEach((key) => {
        if (!key.startsWith("--")) return;
        node.hasFlag = true;
        keyData.forEach((key2) => {
          if (
            node.attributes[key].indexOf &&
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
      if (node.attributes) {
        node.attributes[nUuid] = true;
        node.attributes[component.uuid] = true;
      }
      node.nuuid = nUuid;
      query = `${structure} [${nUuid}]`.trim();
    } else {
      query = `${structure}`.trim();
    }
    if (legacy) {
      contextLegacy = Object.assign(legacy, {});
    }
    if (
      query.length && node.parentNode === null && !contextLegacy.tree.length
    ) {
      contextLegacy.tree.push(`'[${nUuid}-0]'`);
    }
    const domFlag = {
      querySelector: query,
      flags: [],
    };
    if (node.rawAttrs && node.rawAttrs.trim().length) {
      // get the flags
      flags.forEach((flag) => {
        if (node.attributes[flag]) {
          const onevent = node.attributes[flag];
          const payload = [flag.slice(2)];
          switch (true) {
            case flag === "--model" &&
              ["input", "textarea"].includes(node.tagName):
              if (onevent in component.data) {
                if (!component.reactive[onevent]) {
                  component.reactive[onevent] = [];
                }
                component.reactive[onevent].push(query);
              } else {
                const undefinedDataInComponentException = new Error(
                  `[Ogone] ${onevent} is not defined. This error is thrown before binding this missing data. please define it in \n\t\t ${component.file} -> describe.yml`,
                );
                throw undefinedDataInComponentException;
              }
              payload.push(function bounded(value) {
                if (this[onevent] !== value) this[onevent] = value;
              });
              delete node.attributes[flag];
              break;
            case flag === "--for":
              const oForFlag = oRenderForFlag(onevent);
              const { item, index, array } = oForFlag;
              node.oForFlag = oForFlag;
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
              const declarationScript = [`
                let ${index} = POSITION[${contextLegacy.limit}],
                ${item} = (_____a_)[${index}];`];

              contextLegacy.declarationScript = contextLegacy.declarationScript
                .concat(declarationScript);
              payload.push(oForFlag);
              delete node.attributes[flag];
              break;
            default:
              break;
          }
          domFlag.flags.push(payload);
        }
      });
    }
    if (domFlag.flags.length) component.flags.push(domFlag);
    if (node.childNodes?.length) {
      node.childNodes
        .forEach((el, i) => {
          if (component.data && el.nodeType === 3) {
            const data = el.rawText;
            Object.keys(component.data).forEach((key) => {
              const result = data;
              // need to be more precise here
              if (result.indexOf("\${") > -1 && result.indexOf(`${key}`) > -1) {
                if (!node.dependencies.includes(key)) {
                  node.dependencies.push(key);
                }
              }
            });
          }
          oRenderDOM(bundle, keyComponent, el, query, i, {
            ...contextLegacy,
            ctx: { ...contextLegacy.ctx },
            tree: [...contextLegacy.tree],
            declarationScript: [...contextLegacy.declarationScript],
            callbackDeclaration: "",
            limit: contextLegacy.limit + 1,
          });
        });
    }

    const value = `${contextLegacy.declarationScript.join("")}
        ${contextLegacy.resolveCallback ? contextLegacy.resolveCallback : ""} `;
    contextLegacy.script = {
      value,
      node,
      ctx: legacy.ctx,
      getLength: legacy.getLength,
      array: legacy.arrayName,
    };
    component.for[node.id] = contextLegacy;
  } catch (oRenderDOMException) {
    console.error(oRenderDOMException);
  }
}
