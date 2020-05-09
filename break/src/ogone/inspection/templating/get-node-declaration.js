import Ogone from '../../index.ts';
import iterator from '../../../../lib/iterator.js';

export default function getNodeDeclaration(component, node, elementid, query) {
  let creationDeclaration = '';
  const isNodeComponent = component.imports[node.tagName];
  const newcomponent = Ogone.components.get(isNodeComponent);
  switch(true) {
    case !isNodeComponent:
      const isNS = ['svg', 'path', 'polygon'].includes(node.tagName) ? 'NS' : '';
      const namespaced = isNS.length ? '"http://www.w3.org/2000/svg", ': '';
      creationDeclaration = `
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
    break;
    case isNodeComponent !== undefined:
      const elementid = `${newcomponent.uuid}`;
      const query = `data-${iterator.next().value}`;
      creationDeclaration =  `
      const node = document.createElement('${component.uuid}-${node.tagName}');
      node.component = component;
      `
  }
  return creationDeclaration;
}