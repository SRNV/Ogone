import Ogone from '../index.ts';
import getElementExtension from './extensions/element-extension.js';

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
      Ogone.classes['${component.uuid}'] = (class extends HTMLTemplateElement {
        constructor() {
          super();
          const component = new Ogone.components['${component.uuid}']();
          this.dependencies = (${JSON.stringify(node.dependencies)});
          this.positionInParentComponent = [];
          component.dependencies = (${JSON.stringify(node.dependencies)});
          component.requirements = (${component.properties ? JSON.stringify(component.properties) : null});
          /* render function */
          const r = ${componentPragma.replace(/\n/gi, '').replace(/([\s])+/gi, ' ')}
          this.ogone = {
            directives: this.directives,
            position: [0],
            level: 0,
            component,
            nodes: Array.from(r(component).childNodes),
            getContext: null,
            render: r,
            originalNode: true, /* set as false by component */
          };
        }
        connectedCallback() {
          this.setProps();
          this.setContext();
          this.setDeps();
          this.setEventsDirectives();
          this.render();
        }
        setProps() {
          if (!this.index) {
            this.index = 0;
          }
          this.ogone.component.props = this.props;
          this.ogone.component.positionInParentComponent = this.positionInParentComponent;
          this.positionInParentComponent[this.levelInParentComponent] = this.index;
        }
        setContext() {
          const oc = this.ogone.component;
          this.ogone.directives = this.directives;
          if (this.parentComponent) {
            oc.parent = this.parentComponent;
            oc.parent.childs.push(oc);
          }
          if (Ogone.contexts[this.parentCTXId]) {
            const gct = Ogone.contexts[this.parentCTXId].bind(this.parentComponent.data);
            oc.parentContext = gct;
            this.ogone.getContext = gct;
          }
        }
        render() {
          const oc = this.ogone.component;
          // update Props before replace the element
          oc.updateProps();
          // replace the element
          this.replaceWith(...this.ogone.nodes);
          if (oc.renderTexts instanceof Function) {
            oc.renderTexts(true);
          }
          oc.startLifecycle();
        }
        setDeps() {
          if (this.ogone.originalNode) {
            /* directives: for */
            if (this.ogone.getContext) {
              // required for array.length evaluation
              // create a random key
              const key = this.parentCTXId+\`\${Math.random()}\`;
              this.ogone.component.parent.react.push(() => this.directiveFor(key));
              this.directiveFor(key);
            }
          }
        }
        directiveFor(key) {
          const length = this.ogone.getContext({ getLength: true });
          this.ogone.component.parent.render(this, {
            callingNewComponent: true,
            key,
            length,
          });
          return true;
        }
        setEventsDirectives() {
          if (!this.ogone || !this.ogone.directives) return;
          this.ogone.directives.forEach((dir) => {
            this.ogone.nodes.forEach((node) => {
              node.addEventListener(dir.type, (ev) => {
                const oc = this.ogone.component;
                const ctx = this.ogone.getContext({
                  position: oc.positionInParentComponent,
                });
                oc.parent.runtime(dir.case, ctx, ev);
              })
            })
          });
        }
        removeNodes() {
          /* use it before removing template node */
          this.ogone.nodes.forEach((n) => n.remove());
          return this;
        }
        get firstNode() {
          return this.ogone.nodes[0];
        }
        get lastNode() {
          const o = this.ogone.nodes;
          return o[o.length - 1];
        }
        get name() {
          return 'template';
        }
        get extends() {
          return '${component.uuid}-nt';
        }
      })
      customElements.define('${component.uuid}-nt', Ogone.classes['${component.uuid}'], {extends: 'template'});`;
    Ogone.classes.push(componentExtension);
  }
  if (node.hasDirective && node.tagName) {
    const elementExtension = getElementExtension(component, node);
    Ogone.classes.push(elementExtension);
  }
  if (node.childNodes) {
    node.childNodes.forEach((child, i) => {
      if (node.nodeType === 1) oRenderNodesBehavior(keyComponent, child, query, i);
    });
  }
};
