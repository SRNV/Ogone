const iterator = require('./iterator');
const Ogone = require('./');
const uuid = require('uuid-node');
const S = require('string');
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
module.exports = function oRenderDOM(
  keyComponent,
  node,
  structure = '',
  id = null,
  legacy = {
    tree: [],
    limit: 0,
    ctx: {},
    script: [],
    getLengthDeclaration: '',
    declarationScript: [],
    callbackDeclaration: '' }) {
  try {

    const component = Ogone.components.get(keyComponent);
    const nUuid = `o-${iterator.next().value}`;
    let query = '';
    let contextLegacy = {};
    if (node.tagName) {
      node.setAttribute(nUuid, '');
      node.setAttribute(component.uuid, '');
      node.nuuid = nUuid;
      query = `${structure} [${nUuid}]`.trim();
    } else {
      query = `${structure}`.trim();
    }
    if (legacy) {
      contextLegacy = Object.assign(legacy, {});
    }
    if (query.length && node.parentNode ===  null && !contextLegacy.tree.length) {
      contextLegacy.tree.push(`'[${nUuid}-0]'`);
    }
    if (component.data && node.nodeType === 3) {
      const data = node.rawText;
      const evaluated = S(data).between('"','"').s;
      const evaluated2 = S(data).strip(evaluated).between("'","'").s;
      const evaluated3 = S(data).strip(evaluated2).between('\`','\`').s;
      Object.keys(component.data).forEach((key) => {
        const result = S(data).strip(evaluated3)
        if (result.contains('\${') && result.contains(`this.${key}`)) {
          component.reactiveText[query] = true;
        }
      });
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
            console.warn(onevent)
              const oForDirective = oRenderForDirective(onevent);
              const { item, index, array, limit, exitVariable } = oForDirective;
              node.oForDirective = oForDirective;
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
              contextLegacy.getLengthDeclaration = `
                if (GET_LENGTH) {
                  GET_LENGTH(${array}.length);
                  return;
                }
              `;
              const pointer = array;
              const declarationScript = [`${pointer in component.data ? `const ${pointer} = this.${pointer}; ` : ''}
                let ${index} = 0, ${item} = ${array}[${index}];
                let ${exitVariable} = false;
                let ${exitVariable}2 = false;
                const ${limit} = LIM ? LIM[${contextLegacy.limit}] : null;`];
              const loopKeyOpenScript = `
                  let ${index}fe = 0;
                  for (let ${item}fe of Array.from(${array})) {
                    if (${exitVariable} === false) {
                      ${index} = ${index}fe;
                      ${item} = ${item}fe;
                    }
                    if (LIM && ${index}fe === ${limit}) {
                      ${exitVariable} = true;
                    }
                    ${index}fe++;
                `;
              const ctx = `{ ${Object.keys(contextLegacy.ctx)} }`;
              contextLegacy.declarationScript = contextLegacy.declarationScript.concat(declarationScript);
              contextLegacy.script.push(loopKeyOpenScript);
              contextLegacy.limit+= +1;
              const evaluatedQuery = `'[${nUuid}-'+\`$\{this.${index}\}\`+']'`;
              if (query.length && !contextLegacy.tree.includes(evaluatedQuery)) {
                contextLegacy.tree.push(evaluatedQuery);
              }
              const queryFn = `{
                idElement: '${nUuid}',
                uuid: [${contextLegacy.tree.map(q=>`"${q}"`).join()}].map((query) => (function(){ return eval(query)}).bind(CTX__)()).join(' '),
                parentId: [${contextLegacy.tree.map(q=>`"${q}"`).join()}].map((query) => (function(){ return eval(query)}).bind(CTX__)()).slice(0, ${contextLegacy.tree.length-1}).join(' '),
              }`;
              contextLegacy.callbackDeclaration = `
                    if (LIM) {
                      if (${index}fe === ${limit}  && !${exitVariable}2 && CALLBACK) {
                        const CTX__ = ${ctx};
                        const QUERY__ = ${queryFn};
                        const RESULT__ = eval(EVALUATED__);
                        CALLBACK(RESULT__, ${item}, ${index}, CTX__, QUERY__, ${array});
                        ${exitVariable}2 = true;
                      }
                    } else if (CALLBACK) {
                      const CTX__ = ${ctx};
                      const QUERY__ = ${queryFn};
                      const RESULT__ = eval(EVALUATED__);
                      CALLBACK(RESULT__, ${item}, ${index}, CTX__, QUERY__, ${array});
                    }
              `;
              contextLegacy.resolveCallback = `
                if (RESOLVE_CALLBACK) {
                  const CTX__ = ${ctx};
                  const QUERY__ = ${queryFn};
                  const RESULT__ = eval(EVALUATED__);
                  RESOLVE_CALLBACK(RESULT__, ${item}, ${index}, CTX__, QUERY__, ${array}, '${nUuid}');
                }
                `;
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
          oRenderDOM(keyComponent, el, query, i, {
            ...contextLegacy,
            ctx: {...contextLegacy.ctx },
            tree: [...contextLegacy.tree],
            script: [...contextLegacy.script],
            declarationScript: [...contextLegacy.declarationScript],
            callbackDeclaration: '',
          });
        });
        if (contextLegacy.callbackDeclaration && contextLegacy.callbackDeclaration.length) {
          const { length } = contextLegacy.script;
          contextLegacy.script[length - 1] += contextLegacy.callbackDeclaration;
        }
        if (contextLegacy.script.length) {
          contextLegacy.declarationScript[contextLegacy.declarationScript.length-1] += contextLegacy.getLengthDeclaration;
          contextLegacy.script = contextLegacy.declarationScript.concat(
            contextLegacy.script);
          const loopKeyCloseScript = `
                }
          `;
          for(i = 0, a = contextLegacy.script.length / 2; i < a; i++) {
            contextLegacy.script.push(loopKeyCloseScript);
          }
          const value = `${contextLegacy.script.join('')}
             ${contextLegacy.resolveCallback ? contextLegacy.resolveCallback : ''} `;
          contextLegacy.script = {
            value,
            arguments: ['EVALUATED__','CALLBACK', 'RESOLVE_CALLBACK', 'GET_LENGTH', 'LIM'],
          };
          component.for[query] = contextLegacy;
        }
    }
  } catch(oRenderDOMException) {
    console.error(oRenderDOMException)
  }
};