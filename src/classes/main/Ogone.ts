import OgoneRender from './OgoneRender.ts';
import { Document } from "../../ogone.dom.d.ts";
import { HTMLOgoneElement, OgoneParameters } from "../../ogone.main.d.ts";
declare const document: Document;

export default abstract class Ogone extends OgoneRender {
    static root: any;
}
/**
 * returns the base classe of all HTMLOgoneElement (webcomponents)
 */
Ogone.classes.extends = (
    klass: FunctionConstructor,
  ) => (class extends (klass) {
    declare public ogone: OgoneParameters;
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
      (this as unknown as HTMLOgoneElement).ogone = {
        isTemplate: true,
        isAsync: false,
        isAsyncNode: false,
        isStore: false,
        isRouter: false,
        originalNode: true,
        flags: {},
        props: [],
        parentCTXId: '',
        requirements: [],
        dependencies: [],
        routes: [],
      };
    }
  }) as unknown as HTMLOgoneElement;
/**
 *
 */
Ogone.classes.component = (
    klass: FunctionConstructor,
  ) =>
    (class extends (Ogone.classes.extends!(klass) as unknown as FunctionConstructor) {
      declare public type: string;
      constructor() {
        super();
        this.type = "component";
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

        // now ... just render ftw!
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

/**
 * to any async webcomponents
 */
Ogone.classes.async = (
    klass: FunctionConstructor,
  ) => (class extends (Ogone.classes.component!(klass) as unknown as FunctionConstructor) {
    constructor() {
      super();
      (this as unknown as HTMLOgoneElement).type = "async";
    }
  }) as unknown as HTMLOgoneElement;

/**
 * to any router webcomponents
 */
Ogone.classes.router = (
    klass: FunctionConstructor,
  ) => (class extends (Ogone.classes.component!(klass) as unknown as FunctionConstructor) {
    constructor() {
      super();
      (this as unknown as HTMLOgoneElement).type = "router";
    }
  }) as unknown as HTMLOgoneElement;

  /**
 * to any store webcomponents
 */
Ogone.classes.store = (
    klass: FunctionConstructor,
  ) => (class extends (Ogone.classes.component!(klass) as unknown as FunctionConstructor) {
    constructor() {
      super();
      (this as unknown as HTMLOgoneElement).type = "store";
    }
  }) as unknown as HTMLOgoneElement;

/**
 * any Controllers should be erased in DOM
 */
Ogone.classes.controller = (
    klass: any,
  ) => (class extends (Ogone.classes.component!(klass) as unknown as FunctionConstructor) {
    connectedCallback(this: HTMLOgoneElement) {
      this.remove();
    }
  }) as unknown as HTMLOgoneElement;