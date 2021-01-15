import OgoneRender from './OgoneRender.ts';
import { Document } from "../../ogone.dom.d.ts";
import { HTMLOgoneElement, OgoneParameters } from "../../ogone.main.d.ts";
declare const document: Document;

export default class Ogone extends OgoneRender {}
/**
 * returns the base extension classe of all HTMLOgoneElement (webcomponents)
 */
Ogone.classes.extends = (
  klass: FunctionConstructor,
) => (class extends (klass) {
  declare private ogone: OgoneParameters;
  get firstNode() {
    const o = this.ogone;
    return o.nodes![0];
  }
  get lastNode() {
    const o = this.ogone;
    return o.nodes![o.nodes!.length - 1];
  }
  get extends() {
    const o = this.ogone;
    return `${o.uuid}${o.extends}`;
  }
  get name() {
    return this.isComponent
      ? "template"
      : (this as unknown as HTMLOgoneElement).tagName.toLowerCase();
  }
  get isComponent() {
    const o = this.ogone;
    return o.isTemplate;
  }
  get isRecursiveConnected() {
    return !!(this.ogone?.nodes?.length && this.firstNode.isConnected && this.lastNode.isConnected);
  }
  get isConnected() {
    if (!this.firstNode) {
      return false;
    }
    return !!this.ogone?.nodes?.find((n) => n.isConnected);
  }
  get context() {
    const o = this.ogone, oc = o.component!;
    if (!oc.contexts.for[o.key!]) {
      oc.contexts.for[o.key!] = {
        list: [this],
        placeholder: document.createElement("template"),
        parentNode: (this as unknown as HTMLOgoneElement).parentNode,
        name: this.name,
      };
    }
    return oc.contexts.for[o.key!];
  }
  constructor() {
    super();
    ((this as unknown as HTMLOgoneElement).ogone as Partial<HTMLOgoneElement['ogone']>) = {};
  }
}) as unknown as HTMLOgoneElement;
/**
 *
 */
Ogone.classes.component = (
  klass: FunctionConstructor,
  componentType: string = "component",
) =>
  (class extends (Ogone.classes.extends!(klass) as unknown as FunctionConstructor) {
    declare public type: string;
    constructor() {
      super();
      this.type = componentType;
      if (!Ogone.root) {
        let opts: OgoneParameters | null = {
          props: null,
          parentCTXId: '',
          dependencies: null,
          requirements: null,
          routes: null,
          isRoot: true,
          isTemplate: true,
          isAsync: false,
          isAsyncNode: false,
          isRouter: false,
          isStore: false,
          isImported: false,
          isRemote: false,
          index: 0,
          level: 0,
          position: [0],
          flags: null,
          originalNode: true,
          // TODO pass the root component inside a template function to fill this field
          // ex: bundle.components.get(entrypoint)
          uuid: '{% root.uuid %}',
          extends: '-nt',
        };
        Ogone.setOgone(this as unknown as HTMLOgoneElement, opts);
        opts = null;
        Ogone.root = true;
      }
    }
    connectedCallback(this: HTMLOgoneElement) {
      if (this.type === "controller") {
        this.remove();
        return;
      }
      const o = this.ogone;
      // set position of the template/component
      Ogone.setPosition(this);

      // set the context of the node
      Ogone.setContext(this);
      // Ogone.setHMRContext();

      // parse the route that match with location.pathname
      if (o.type === "router") {
        Ogone.setActualRouterTemplate(this);
      }

      // set the props required by the node
      if (o.isTemplate && o.component) {
        Ogone.setProps(this);
        o.component.updateProps();
      }
      Ogone.renderingProcess(this);

      switch (true) {
        case o.type === "router":
          Ogone.renderRouter(this);
          break;
        case o.type === "store":
          Ogone.renderStore(this);
          break;
        case o.type === "async":
          Ogone.renderAsync(this);
          break;
        default:
          Ogone.renderNode(this);
          break;
      }
    }
  }) as unknown as HTMLOgoneElement;