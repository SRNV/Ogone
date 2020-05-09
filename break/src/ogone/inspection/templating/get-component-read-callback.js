import Ogone from '../../index.ts';
import iterator from '../../../../lib/iterator.js';

export default function getComponentReadCallback(component, node, elementid, query) {
    const isNodeComponent = component.imports[node.tagName];
    let newcomponent = Ogone.components.get(isNodeComponent);
    if (!isNodeComponent || !newcomponent) return '';
    let subquery = `data-${iterator.next().value}`;
    const callback = `
    component.read({
        template: node,
        id: '${subquery}',
        attr: '${newcomponent.uuid}',
        type: 'child-component',
        querySelector: '${subquery}',
        parentNodeManager: nm ? nm : null,
    }, true);
    `;
    return callback;
}