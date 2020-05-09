import Ogone from '../index.ts';
import iterator from '../../../lib/iterator.js';
import getAppendChilds from './templating/get-append-childs.js';
import getNodeDeclaration from './templating/get-node-declaration.js';
import getNMDeclaration from './templating/get-nm-declaration.js';
import getChildComponent from './templating/get-child-component.js';
import getComponentReadCallback from './templating/get-component-read-callback.js';
import elementsExtensions from './templating/elements-extensions.js';

export default function oRenderNodesBehavior(keyComponent, node, structure = '', index = 0) {
  const component = Ogone.components.get(keyComponent);
  const isNodeComponent = component.imports[node.tagName];
  let nodeCE = !!isNodeComponent ? `${component.uuid}-${node.tagName}` : null;
  let query = '';
  if (node.tagName && node.nuuid) {
    query = `${structure} [${node.nuuid}]`.trim();
  } else {
    query = `${structure}`.trim();
  }
  if (node.tagName ===  null) {
    const componentPragma = node.pragma(component.uuid, true, Object.keys(component.imports), (tagName) => {
      const p = component.imports[tagName];
      const newcomponent = Ogone.components.get(p);
      return newcomponent.uuid
    })
    const componentExtension = `
      Ogone.classes['${component.uuid}'] = (class extends HTMLElement {
        constructor() {
          super();
          const component = new Ogone.components['${component.uuid}']();
          component.dependencies = (${JSON.stringify(node.dependencies)});
          component.requirements = (${component.properties ? JSON.stringify(component.properties) : null});
          component.props = this.props;
          component.positionInParentComponent = this.positionInParentComponent;
          if (!this.index) {
            this.index = 0;
          }
          if (this.parentComponent) {
            component.parent = this.parentComponent;
            component.parent.childs.push(component);
          }
          if (Ogone.contexts[this.parentCTXId]) {
            component.parentContext = Ogone.contexts[this.parentCTXId].bind(this.parentComponent.data);
          }
          /* render function */
          const r = ${componentPragma.replace(/\n/gi, '').replace(/([\s])+/gi, ' ')}
          this.ogone = {
            component,
            nodes: [],
            placeholder: new Comment(),
            render: r,
          };
        }
        connectedCallback() {
          const childs = Array.from(
            this.ogone.render(this.ogone.component).childNodes
          );
          this.ogone.nodes.push(childs);
          this.render();
        }
        render() {
          this.ogone.nodes.forEach((nodes /* Node[] */) => {
            this.replaceWith(...nodes)
          });
          this.ogone.component.startLifecycle();
          this.ogone.component.updateProps();
        }
      })
      customElements.define('template-${component.uuid}', Ogone.classes['${component.uuid}']);`;
    Ogone.classes.push(componentExtension);
  }
  if (node.attributes && node.attributes.is) {
    // console.warn(node.attributes.is);
  }
  /**
    use native "is" attr of WEBCOMPONENTS
    use WEBCOMPONENTS
    TEMPLATES for COMPONENTS
    ELEMENTs for elements
   */
  // Ogone.templates.push(result);
  if (node.childNodes) {
    node.childNodes.forEach((child, i) => {
      if (node.nodeType === 1) oRenderNodesBehavior(keyComponent, child, query, i);
    });
  }
};
