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
        oc.contexts.for[o.key] = [this];
        oc.contexts.for[o.key].placeholder = new Comment();
        oc.contexts.for[o.key].name = this.name;
      }
      return oc.contexts.for[o.key];
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
        directives: this.ogone.directives,
        dependencies: this.ogone.dependencies,
        ${cloneProps}
      })
      return node;
    }
    `;
}
