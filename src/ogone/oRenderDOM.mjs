import iterator from './iterator.mjs';
import Ogone from './index.mjs';
import uuid from 'uuid-node';
import S from 'string';
import oRenderForDirective from './oRenderForDirective.mjs';
import parseAttrs from '../../html-this/parseAttrs.mjs';

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
export default function oRenderDOM(
  keyComponent,
  node,
  structure = '',
  id = null,
  legacy = {
    tree: [],
    limit: 0,
    ctx: {},
    script: [],
    getLengthDeclarationAfterArrayEvaluation: '',
    getLengthDeclarationBeforeArrayEvaluation: '',
    declarationScript: [],
    callbackDeclaration: '' }) {
  try {

    const component = Ogone.components.get(keyComponent);
    const nUuid = `o-${iterator.next().value}`;
    let query = '';
    let contextLegacy = {};
    node.hasDirective = false;
    node.dependencies = [];
    if (node.rawAttrs && node.rawAttrs.length) {
      const parsedAttrs = parseAttrs(node.rawAttrs);
      node.props = parsedAttrs.filter(a => a.prop);
      node.event = parsedAttrs.filter(a => a.event);
      node.props.forEach((prop) => {
        node.removeAttribute(prop.savedName);
        Object.keys(component.data).forEach((key) => {
          if (prop.value.indexOf(key) > -1 && !node.dependencies.includes(key)) {
            node.dependencies.push(key);
          }
        });
      });
      node.event.forEach((event) => {
        node.removeAttribute(event.savedName);
        Object.keys(component.data).forEach((key) => {
          if (event.value.indexOf(key) > -1 && !node.dependencies.includes(key)) {
            node.dependencies.push(key);
          }
        });
      });
    }
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
              const { item, index, array, } = oForDirective;
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
              node.hasDirective = true;
              const getLengthScript = `
                if (GET_LENGTH) {
                  if (QUERY === '${query}') return (${array}).length;
                  else return 1;
                }
              `;
              contextLegacy.getLengthDeclarationBeforeArrayEvaluation = getLengthScript;
              const declarationScript = [`
                let ${index} = POSITION[${contextLegacy.limit}+1],
                ${item} = (${array})[${index}];`];

              contextLegacy.declarationScript = contextLegacy.declarationScript.concat(declarationScript);
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
    if (node.tagName) {
      contextLegacy.limit+= +1;
    }
    if(domDirective.directives.length) component.directives.push(domDirective);
    if (id !== null) component.dom.push(dom);
    if (node.childNodes.length) {
      node.childNodes
        .forEach((el, i) => {
          if (component.data && el.nodeType === 3) {
            const data = el.rawText;
            const evaluated = S(data).between('"','"').s;
            const evaluated2 = S(data).strip(evaluated).between("'","'").s;
            const evaluated3 = S(data).strip(evaluated2).between('\`','\`').s;
            Object.keys(component.data).forEach((key) => {
              const result = S(data).strip(evaluated3)
              if (result.contains('\${') && result.contains(`${key}`)) {
                if (!node.dependencies.includes(key)) {
                  node.dependencies.push(key);
                }
              }
            });
          }
          oRenderDOM(keyComponent, el, query, i, {
            ...contextLegacy,
            ctx: {...contextLegacy.ctx },
            tree: [...contextLegacy.tree],
            declarationScript: [...contextLegacy.declarationScript],
            callbackDeclaration: '',
          });
        });
        contextLegacy.declarationScript[0] = contextLegacy.getLengthDeclarationBeforeArrayEvaluation + contextLegacy.declarationScript[0];
        const value = `${contextLegacy.declarationScript.join('')}
            ${contextLegacy.resolveCallback ? contextLegacy.resolveCallback : ''} `;
        contextLegacy.script = {
          value,
        };
        component.for[query] = contextLegacy;
    }
  } catch(oRenderDOMException) {
    console.error(oRenderDOMException)
  }
};