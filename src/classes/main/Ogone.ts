import OgoneComponent from './OgoneComponent.ts';
import { Document, PopStateEvent, Location } from "../../ogone.dom.d.ts";
import { HTMLOgoneElement, OgoneParameters } from "../../ogone.main.d.ts";
import { setActualRouterTemplate, setOgone, setPosition, setProps } from "./OgoneExtends.ts";
import { setContext } from "./OgoneContext.ts";
import {
  renderAsync,
  renderingProcess,
  renderNode,
  renderRouter,
  renderStore
} from "./OgoneRender.ts";
import { routerGo } from "./OgoneRouter.ts";
declare const document: Document;
declare const location: Location;

export default class Ogone extends OgoneComponent {}
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
  uuid: string = '',
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
          uuid,
          extends: '-nt',
        };
        setOgone(this as unknown as HTMLOgoneElement, opts);
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
      setPosition(this);

      // set the context of the node
      setContext(this);
      // setHMRContext();

      // parse the route that match with location.pathname
      if (o.type === "router") {
        setActualRouterTemplate(this);
      }

      // set the props required by the node
      if (o.isTemplate && o.component) {
        setProps(this);
        o.component.updateProps();
      }
      renderingProcess(this);

      switch (true) {
        case o.type === "router":
          renderRouter(this);
          break;
        case o.type === "store":
          renderStore(this);
          break;
        case o.type === "async":
          renderAsync(this);
          break;
        default:
          renderNode(this);
          break;
      }
    }
  }) as unknown as HTMLOgoneElement;
// Router implementation
window.addEventListener('popstate', (event: Event) => {
  routerGo(location.pathname, (event as PopStateEvent).state);
});