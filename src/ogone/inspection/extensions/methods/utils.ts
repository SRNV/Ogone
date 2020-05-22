export default function utilsMethods(component: any, node: any, opts: any): string {
  const { isTemplate } = opts;
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
    }`;
}