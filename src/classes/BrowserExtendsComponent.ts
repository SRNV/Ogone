// @ts-nocheck
import type { BCE } from "../types/component.ts";
import type { NestedOgoneParameters } from "../types/template.ts";
const getClassExtends = (
  klass: typeof HTMLElement | typeof HTMLTemplateElement,
) => (class extends (klass as typeof HTMLElement) implements BCE {
  declare public ogone: NestedOgoneParameters;
  get firstNode() {
    const o = this.ogone;
    return o.nodes[0];
  }
  get lastNode() {
    const o = this.ogone;
    return o.nodes[o.nodes.length - 1];
  }
  get extends() {
    const o = this.ogone;
    return `${o.uuid}${o.extends}`;
  }
  get name() {
    const o = this.ogone;
    return this.isComponent ? "template" : this.tagName.toLowerCase();
  }
  get isComponent() {
    const o = this.ogone;
    return o.isTemplate;
  }
  get isRecursiveConnected() {
    return this.ogone.nodes.length && this.firstNode.isConnected && this.lastNode.isConnected;
  }
  get isConnected() {
    if (!this.firstNode) {
      return false;
    }
    return !!this.ogone.nodes.find((n) => n.isConnected);
  }
  get context() {
    const o = this.ogone, oc = o.component;
    if (!oc.contexts.for[o.key]) {
      oc.contexts.for[o.key] = {
        list: [this],
        placeholder: document.createElement("template"),
        parentNode: this.parentNode,
        name: this.name,
      };
    }
    return oc.contexts.for[o.key];
  }
  constructor() {
    super();
    this.ogone = {};
  }
});
export default getClassExtends.toString();
