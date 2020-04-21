const iterator = require('./iterator');
const Ogone = require('./');
const uuid = require('uuid-node');
const oRenderForDirective =  require('./oRenderForDirective');

const directives = [
  'o-if',
  'o-else',
  'o-for',
  'o-click',
  'o-mousemove',
  'o-mousedown',
  'o-mouseup',
  'o-mouseleave',
  'o-dblclick',
  'o-drag',
  'o-dragend',
  'o-dragstart',
  'o-model',
  'o-transform',
  'o-html',
  'o-input',
];
module.exports = function oRenderDOM(keyComponent, node, structure = '', id = null, legacy = { tree: [], limit: 0, ctx: {}, script: [], declarationScript: [] }) {
  const component = Ogone.components.get(keyComponent);
  const nUuid = `o-${iterator.next().value}`;
  let query = '';
  let contextLegacy = {};
  if (node.tagName) {
    node.setAttribute(nUuid, '');
    node.setAttribute(component.uuid, '');
    query = `${structure} [${nUuid}]`.trim();
  } else {
    query = `${structure}`.trim();
  }
  if (legacy) {
    contextLegacy = Object.assign(legacy, {});
    if (query.length && !contextLegacy.tree.includes(query)) {
      contextLegacy.tree.push(query);
    }
  }
  const dom = {
    id,
    rawText: node.rawText.trim(),
    tagName: node.tagName,
    querySelector: query,
    type: node.nodeType,
  };
  const domDirective = {
    querySelector: query,
    directives: [],
  };
  if (node.rawAttrs && node.rawAttrs.trim().length) {
    // get the directives
    directives.forEach((directive) => {
      if (node.hasAttribute(directive)) {
        const onevent = node.getAttribute(directive);
        const payload = [directive.slice(2)];
        switch(true) {
          case directive === 'o-model' && ['input', 'textarea'].includes(node.tagName):
            if (onevent in component.data) {
              if (!component.reactive[onevent]) {
                component.reactive[onevent] = [];
              }
              component.reactive[onevent].push(query);
            } else {
              const undefinedDataInComponentException = new Error(`[Ogone] ${onevent} is not defined. This error is thrown before binding this missing data. please define it in \n\t\t ${component.file} -> describe.yml`)
              throw undefinedDataInComponentException;
            }
            payload.push(function bounded(value) {
              if (this[onevent] !== value) { this[onevent] = value; }
            });
            break;
          case directive === 'o-for':
            const oForDirective = oRenderForDirective(onevent);
            const { item, index, array, evaluated, limit, exitVariable } = oForDirective;
            if (legacy.ctx[item]) {
              const ItemNameAlreadyInUseException = new Error(`[Ogone] '${item}' is already defined in the template, as item`);
              throw ItemNameAlreadyInUseException;
            }
            if (legacy.ctx[index]) {
              const IndexAlreadyInUseException = new Error(`[Ogone] '${index}' is already defined in the template, as index`);
              throw IndexAlreadyInUseException;
            }
            legacy.ctx[index] = true;
            legacy.ctx[item] = oForDirective;
            const pointer = array.split(/(\\b|[\[\]])/gi)[0].trim();
            const declarationScript = [`${pointer in component.data ? `const ${pointer} = this.${pointer}; ` : ''}
              let ${index} = 0, ${item} = ${evaluated};
              let ${exitVariable} = false;
              const ${limit} = LIM[${contextLegacy.limit}];`];
            const loopKeyOpenScript = `
                if (${array}) {
                  ${item} = ${evaluated};
                }
                for(;${evaluated}  && ${index} < ${limit} && ${exitVariable} === false; ${index}++) {
                  ${item} = ${evaluated};
                  if (${index} === ${limit}) {
                    ${index}++;
                    ${exitVariable} = true;
                  }
              `;
            contextLegacy.declarationScript = contextLegacy.declarationScript.concat(declarationScript);
            contextLegacy.script.push(loopKeyOpenScript);
            contextLegacy.limit+= +1;
            payload.push(oForDirective);
            break;
          default:
            payload.push(new Function(onevent));
            break;
        }
        domDirective.directives.push(payload);
        node.removeAttribute(directive);
      }
    });
    // get any reference
    if (node.hasAttribute('ref')) {
      const ref = node.getAttribute('ref');
      component.refs[ref] = query;
      node.removeAttribute('ref');
    }
  }
  if(domDirective.directives.length) component.directives.push(domDirective);
  if (id !== null) component.dom.push(dom);
  if (node.childNodes.length) {
    node.childNodes
      .forEach((el, i) => {
        oRenderDOM(keyComponent, el, query, i, { ...contextLegacy, ctx: {...contextLegacy.ctx }, tree: [...contextLegacy.tree], declarationScript: [...contextLegacy.declarationScript] });
      });
      if (contextLegacy.script.length) {
        contextLegacy.script = contextLegacy.declarationScript.concat(contextLegacy.script);
        const loopKeyCloseScript = `
              }
        `;
        for(i = 0, a = contextLegacy.script.length / 2; i < a; i++) {
        contextLegacy.script.push(loopKeyCloseScript);
        }
        //console.warn(contextScript)
        const value = contextLegacy.script.join('');
        contextLegacy.script = {
          value,
          arguments: ['LIM'],
        };
        component.for[query] = contextLegacy;
      }
  }
};