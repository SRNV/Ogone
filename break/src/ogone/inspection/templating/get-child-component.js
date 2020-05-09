import Ogone from '../../index.ts';

export default function getChildComponent(component, node, elementid, query) {
    const isNodeComponent = component.imports[node.tagName];
    let newcomponent = Ogone.components.get(isNodeComponent);
    if (!isNodeComponent || !newcomponent) return '';
    return `component = new Ogone.components['${newcomponent.uuid}']();`;
}