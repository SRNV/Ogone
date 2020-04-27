const Ogone = require('.');

module.exports = function oRenderNodesBehavior(keyComponent, node, structure = '', index = 0) {
  const component = Ogone.components.get(keyComponent);
  let query = '';
  let contextLegacy = {};
  if (node.tagName && node.nuuid) {
    query = `${structure} [${node.nuuid}]`.trim();
  } else {
    query = `${structure}`.trim();
  }

  const isNS = ['svg', 'path', 'polygon'].includes(node.tagName) ? 'NS' : '';
  const namespaced = isNS.length ? '"http://www.w3.org/2000/svg", ': '';
  let creationDeclaration = `
    const node = document.createElement${isNS}(${namespaced}'${node.tagName || 'template'}');
    node.setAttribute${isNS}(${namespaced}'${component.uuid}',''); /* style scope */
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
      // childScripts.push(childScript);
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
      index = 0,
      callback,
      parentId,
      parentNodeManager,
      position = [], 
      level = 0 } = opts
    const newPosition = [...position];
    newPosition[level] = index;
    // declare node
    let text, nm = nodeManager;
    ${node.nodeType === 3 ? creationTextNodeDeclartion : creationDeclaration}

    // create new NM to rule this node and descendant
    if (!nm && ${node.oForDirective || !node.tagName ? `true /*has directive*/`: 'false /*no directive*/'} && hasNodeManager) {
      nm = new NodeManager(component, node, {
        parentId,
        level,
        position: newPosition,
        templateId: '${elementid}',
        querySelector: '${query}',
        templateUuid: '${node.nuuid}',
        uuid: '${node.nuuid}-'+index,
        componentUuid: '${component.uuid}',
        type: ${node.nodeType},
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
      let templateDeclaration = '';
      if (child.nodeType === 1) {
        // LEGACIES TO SUBNODES
        templateDeclaration = `
          node.append(Ogone.templates['${childId}'](component, {
            nodeManager: null,
            hasNodeManager: true,
            parentNodeManager: nm ? nm : null,
            level: level + 1,
            position: newPosition,
            ${
              node.nuuid ? 
                `parentId: ((parentId || \'\')+ ' ['+'${node.nuuid}-'+index+']').trim(),`:
                `parentId: null,`
            }
          }));`.trim();
      }
      if (child.nodeType === 3 && child.rawText.trim().length && node.tagName !== null) {
        templateDeclaration = `
          ${ child.rawText.indexOf('${') > 0 ? `
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
      if (nm && nm.state === 1) {
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
