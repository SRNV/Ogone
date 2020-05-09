export default function getNMDeclaration(component, node, elementid, query) {
  let requirement = null;
  if (node.tagName === null && component.properties) {
    requirement = JSON.stringify(component.properties);
  }
  return `
  if (!nm && hasNodeManager) {
    nm = new NodeManager(component, node, {
      requirement: ${requirement || null},
      props,
      level,
      parentId,
      parentNodeManager,
      parentContextId,
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
    if (parentContextId && Ogone.contexts[parentContextId]) {
      nm.getContext = Ogone.contexts[parentContextId].bind(parentComponent.data);
    } else if (Ogone.contexts['${component.uuid}-${query}']) {
      nm.getContext = Ogone.contexts['${component.uuid}-${query}'].bind((component).data);
    }
    if (parentNodeManager && parentNodeManager.childs) {
      parentNodeManager.childs.push(nm);
    }
  }
  if (nm) {
    nm.positions[((parentId || \'\')+ ' ['+'${node.nuuid}-'+index+']').trim()] = newPosition;
  }
  `;
}