import Ogone from '../index.ts';
import iterator from '../../../lib/iterator.js';

export default function oRenderNodesBehavior(keyComponent, node, structure = '', index = 0) {
  const component = Ogone.components.get(keyComponent);
  let query = '';
  if (node.tagName && node.nuuid) {
    query = `${structure} [${node.nuuid}]`.trim();
  } else {
    query = `${structure}`.trim();
  }
  if (query === '[o-19] [o-20]') console.warn(node);
  const isNS = ['svg', 'path', 'polygon'].includes(node.tagName) ? 'NS' : '';
  const namespaced = isNS.length ? '"http://www.w3.org/2000/svg", ': '';
  let requirement = null;
  if (node.tagName === null && component.properties) {
    requirement = JSON.stringify(component.properties);
  }
  let creationDeclaration = `
    const node = document.createElement${isNS}(${namespaced}'${node.tagName || 'template'}');
    node.setAttribute${isNS}(${namespaced}'${component.uuid}',''); /* style scope */
    /* attributes */
    ${node.attributes ? Object.entries(node.attributes).map(([key, value]) => {
      if (value === true) {
        return `node.setAttribute('${key}', '');`
      }
      return `node.setAttribute('${key}', '${value}');`;
    }).join('\n') : ''}
  `;
  if (node.tagName !== null) {
    creationDeclaration+= `
    node.setAttribute${isNS}(${namespaced}'${node.nuuid}','');
    node.setAttribute${isNS}(${namespaced}'${node.nuuid}-'+index,'');
    `
  }
  const creationTextNodeDeclartion = `
    const node = new Text(' ');
  `;
  const elementid = node.nodeType === 1 ?
    `${component.uuid}${node.nuuid ? '-' + node.nuuid : ''}` : `${component.uuid}-${query}-text-${index}`;
  if (node.childNodes) {
    node.childNodes.forEach((child, i) => {
      if (node.nodeType === 1) oRenderNodesBehavior(keyComponent, child, query, i);
    });
  }
  const argsDeclaration = node.tagName !== null ?
    `opts`: 'opts';
  let result = (node.nodeType === 1) ?
`
  Ogone.templates['${elementid}'] = (function(component, ${argsDeclaration}) {
    const {
      nodeManager,
      hasNodeManager,
      props = null,
      index = 0,
      callback,
      parentId,
      parentNodeManager,
      position = [],
      dependencies = null,
      level = 0 } = opts
    const newPosition = [...position];
    let subcomponent = null;
    let subnode = null;
    let oc;
    newPosition[level] = index;
    // declare node
    let text, nm = nodeManager;
    ${node.nodeType === 3 ? creationTextNodeDeclartion : creationDeclaration}

    // create new NM to rule this node and descendant
    if (!nm && hasNodeManager) {
      nm = new NodeManager(component, node, {
        requirement: ${requirement || null},
        props,
        level,
        parentId,
        parentNodeManager,
        position: newPosition,
        type: ${node.nodeType},
        querySelector: '${query}',
        templateId: '${elementid}',
        uuid: '${node.nuuid}-'+index,
        templateUuid: '${node.nuuid}',
        componentUuid: '${component.uuid}',
        dependencies: dependencies || ${JSON.stringify(node.dependencies)},
        ${node.oForDirective ? `array: '${node.oForDirective.array}',`: 'array: null,'}
      });
      if (Ogone.contexts['${component.uuid}-${query}']) {
        nm.getContext = Ogone.contexts['${component.uuid}-${query}'].bind(component.data);
      }
      if (parentNodeManager && parentNodeManager.childs) {
        parentNodeManager.childs.push(nm);
      }
    }
    // append childs
    ${ node.childNodes.length ? node.childNodes.map((child, childIndex) => {
      const childId = `${component.uuid}-${child.nuuid}`;
      const childTextNodePositionSTR = `(parentId || \'\')+' [${node.nuuid}-'+index+'] ${childIndex}'`;
      let childProps = '';
      const childHasProps = child.props && child.props.length > 0;
      if (childHasProps) {
        childProps = JSON.stringify(child.props);
      }
      let templateDeclaration = '';
      if (child.nodeType === 1) {
        // LEGACIES TO SUBNODES
        const isNodeAComponent = component.imports[child.tagName];
        const subComponent = Ogone.components.get(isNodeAComponent);
        if (!isNodeAComponent) {
          templateDeclaration = `
            node.append(Ogone.templates['${childId}'](component, {
              nodeManager: null,
              hasNodeManager: true,
              parentNodeManager: nm ? nm : null,
              level: level + 1,
              position: newPosition,
              dependencies: ${JSON.stringify(child.dependencies)},
              ${
                node.nuuid ?
                  `parentId: ((parentId || \'\')+ ' ['+'${node.nuuid}-'+index+']').trim(),`:
                  `parentId: null,`
              }
            }));`.trim();
        } else {
          let subquery = `data-${iterator.next().value}`;
          templateDeclaration = `
          subnode = new Comment('');
          node.append(subnode);
          oc = new Ogone.components['${subComponent.uuid}']();
          oc.read({
            id: '${subquery}',
            attr: '${subComponent.uuid}',
            type: 'component',
            querySelector: '${subquery}',
            node: subnode,
            parentNodeManager: nm ? nm : null,
            dependencies: ${JSON.stringify(child.dependencies)},
            props: ${childHasProps ? childProps : null},
          });
          `.trim();
        }
      }
      if (child.nodeType === 3 && child.rawText.trim().length && node.tagName !== null) {
        templateDeclaration = `
          ${ child.rawText.indexOf('${') > -1 ? `
            text = new Text(nm.getContext({
              position: newPosition,
              getText: '\`${child.rawText.trim()}\`',
            }));
            text.rawText = '${child.rawText.trim()}';
            text.uuid = ((parentId || \'\')+ ' ['+'${node.nuuid}-'+index+']').trim();
            nm.texts[${childTextNodePositionSTR}] = text;
            node.append(text);
            ` : `node.append(new Text('${child.rawText.trim()}'));`
          }`; // end templateDeclaration
        }
        return templateDeclaration;
      }).join('\n') : '' }
      if (nm) {
        nm.positions[((parentId || \'\')+ ' ['+'${node.nuuid}-'+index+']').trim()] = newPosition;
      }
      if (callback instanceof Function) {
        callback(node, '${node.nuuid}-'+index);
      }
    return node;
  })
` : '';
  Ogone.templates.push(result);
  return result;
};
