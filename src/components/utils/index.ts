export default function utilsMethods(
  component: any,
  node: any,
  opts: any,
): string {
  const { isTemplate } = opts;
  const cloneProps: string = isTemplate
    ? `
    props: this.ogone.props,
    params: this.ogone.params,
    parentComponent: this.ogone.parentComponent,
    parentCTXId: this.ogone.parentCTXId,
    positionInParentComponent: this.ogone.positionInParentComponent
      .slice(),
    levelInParentComponent: this.ogone.levelInParentComponent,`
    : "component: this.ogone.component,";
  return `
    get context() {
      const o = this.ogone;
      const oc = o.component;
      if (!oc.contexts.for[o.key]) {
        oc.contexts.for[o.key] = {
          list: [this],
          placeholder: document.createElement('template'),
          parentNode: this.parentNode,
          name: this.name,
        };
      }
      return oc.contexts.for[o.key];
    }
    insertElement(p, el) {
      if (!this.firstNode) {
        this.insertAdjacentElement(p, el);
        return;
      }
      let target;
      switch(p) {
        case 'beforebegin':
          target = this.firstNode;
          break;
        case 'afterbegin':
          target = this.firstNode;
          break;
        case 'beforeend':
          target = this.lastNode;
          break;
        case 'afterend':
          target = this.lastNode;
        break;
      }
      return (!!target.ogone ?
        (target.context.list[
          target.context.list.length -1
        ]).insertElement(p, el) :
        target.insertAdjacentElement(p, el));
    }
    get isConnected() {
      if (!this.firstNode) {
        return false;
      }
      return !!this.ogone.nodes.find((n) => n.isConnected);
    }
    get isRecursiveConnected() {
      return this.firstNode.isConnected && this.lastNode.isConnected;
    }
    get firstNode() {
      return this.ogone.nodes[0];
    }
    get lastNode() {
      const o = this.ogone.nodes;
      return o[o.length - 1];
    }
    get name() {
      ${isTemplate ? 'return "template"' : "return this.tagName.toLowerCase();"}
    }
    get extends() {
      ${
    isTemplate
      ? `return '${component.uuid}-nt';`
      : `return '${component.uuid}-${node.id}';`
  }
    }
    get isComponent() {
      return ${isTemplate};
    }
    get clone() {
      const node = document.createElement(this.name, { is: this.extends });
      node.setOgone({
        index: this.ogone.index,
        originalNode: true,
        level: this.ogone.level,
        position: this.ogone.position,
        flags: this.ogone.flags,
        dependencies: this.ogone.dependencies,
        render: this.ogone.render,
        ${cloneProps}
      })
      return node;
    }
    `;
}
