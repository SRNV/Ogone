import Ogone from "./OgoneBase.ts";
import {
  HTMLElement,
  HTMLInputElement,
  Document,
  PopStateEvent,
  Location,
  MouseEvent,
  history,
  Element,
  Comment as Com,
  Node,
  Text
} from "../ogone.dom.d.ts";
import { HTMLOgoneElement, OnodeComponent, OnodeComponentRenderOptions, OgoneParameters, Route, OgoneRecycleOptions } from "../ogone.main.d.ts";
declare const document: Document;
declare const location: Location;
declare class Comment extends Com {};

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
/**
 * this constructor is used as a base function for components
 * ```typescript
 * // actual usage
 * Ogone.createComponent.call(this);
 * ```
 */
export function createComponent(this: OnodeComponent): OnodeComponent {
  this.key = null;
  this.data = null;
  this.pluggedWebComponentIsSync = false;
  this.dependencies = null;
  this.state = 0;
  this.activated = true;
  this.namespace = null;
  this.store = {};
  this.contexts = {
    for: {},
  };
  // for async context
  this.promises = [];
  this.resolve = null;
  this.async = {
    then: null,
    catch: null,
    finally: null,
  };
  this.dispatchAwait = null;
  this.promiseResolved = false;
  // events describers
  // this.events = {};
  // all nodes that's are dynamics will save a function into this property
  // like if we have
  //  <node --for="(el, i) of array" />
  // this node will register a function() { ... } that will be triggered each time there is an update
  //this.rerenderAsync = null;
  this.react = [];
  this.texts = [];
  this.childs = [];
  this.startLifecycle = (params?: any, event?: Event | OgoneParameters['historyState']) => {
    if (!this.activated) return;
    if (this.type === "store") {
      this.initStore();
    }
    this.updateProps();
    this.runtime(0, params, event);
  };
  this.update = (dependency?: string) => {
    if (this.type === "store") {
      this.updateStore(dependency);
      return;
    }
    this.runtime(`update:${dependency}`);
    this.reactTo(dependency as string);
    this.renderTexts(dependency as string);
    this.childs.filter((c: OnodeComponent) => c.type !== "store").forEach(
      (c: OnodeComponent) => {
        c.updateProps(dependency as string);
      },
    );
  };
  this.renderTexts = (dependency: string) => {
    if (!this.activated) return;
    this.texts.forEach((t: Function, i: number, arr: Function[]) => {
      // if there is no update of the texts
      // this can be the reason why
      if (t && !t(dependency)) delete arr[i];
    });
  };
  this.reactTo = (dependency: string) => {
    this.react.forEach((t: Function, i: number, arr: Function[]) => {
      if (t && !t(dependency)) delete arr[i];
    });
  };
  this.initStore = () => {
    if (!Ogone.stores[this.namespace as string]) {
      Ogone.stores[this.namespace as string] = {
        ...this.data,
      };
    }
    // save the component's reaction into Ogone.clients with the key of the component
    // and a function
    Ogone.clients.push([this.key as string, (namespace, key, overwrite) => {
      if (
        namespace === this.namespace &&
        this.data &&
        this.parent &&
        this.parent.data
      ) {
        if (!overwrite) {
          this.data[key] = Ogone.stores[this.namespace][key];
        } else {
          Ogone.stores[this.namespace][key] = this.data[key];
        }
        if (this.parent.data[key] !== this.data[key]) {
          this.parent.data[key] = this.data[key];
          this.parent.update(key);
        }
      }
      return this.activated;
    }]);
  };
  this.updateStore = (dependency: string) => {
    // find the reaction of this store module with the key
    // @ts-ignore VSCode error on iterators
    const [key, client] = Ogone.clients.find(([key]) => key === this.key);
    if (client) {
      // use the namespace, the dependency or property that should change
      client(this.namespace, dependency, true);
      // update other modules
      Ogone.clients.filter(([key]) => key !== this.key).forEach(
        ([key, f], i, arr) => {
          if (f && !f(this.namespace as string, dependency, false)) {
            delete arr[i];
          }
        },
      );
    }
  };
  this.updateService = (key: string, value: unknown, force?: boolean) => {
    if (this.data && value !== this.data[key] || force && this.data) {
      const previous = this.data[key];
      this.data[key] = value;
      /**
       * for recycle Webcomponent feature
       * pluggedWebComponent is a WebComponent that is used
       * by the end user
       */
      if (this.pluggedWebComponentIsSync) {
        if (this.pluggedWebComponent && typeof this.pluggedWebComponent.beforeUpdate === 'function') {
          this.pluggedWebComponent.beforeUpdate(key, this.data[key], value)
        }
        /**
         * update the webcomponent
         */
        if (this.pluggedWebComponent && value !== this.pluggedWebComponent[key]) {
          this.pluggedWebComponent[key] = value;
        }
      }
      if (this.pluggedWebComponent && typeof this.pluggedWebComponent.attributeChangedCallback === 'function') {
        this.pluggedWebComponent.attributeChangedCallback(key, previous, value);
      }
      this.update(key);
      if (this.type === "async") {
        if (!this.dependencies) return;
        if (
          key &&
          this.dependencies.find((d: string) => d.indexOf(key) > -1)
        ) {
          // let the user rerender
          this.runtime("async:update", {
            updatedParentProp: key,
          });
        }
      }
    }
  };
  this.updateProps = (dependency: string) => {
    if (!this.activated) return;
    if (this.type === "store") return;
    if (!this.requirements || !this.requirements.length || !this.props) return;
    this.requirements.forEach(([key]: [string, string]) => {
      const prop = this.props.find((prop: [string, ...any[]]) =>
        prop[0] === key
      );
      if (!prop) return;
      const value = this.parentContext({
        getText: `${prop[1]}`,
        position: this.positionInParentComponent,
      });
      this.updateService(key, value, !!dependency);
    });
  };
  /**
   * this is used to update the attributes of the webcomponent
   * when a prop is updated
   */
  this.plugWebComponent = (wc: any, isSync: boolean) => {
    this.pluggedWebComponent = wc;
    this.pluggedWebComponentIsSync = isSync;
  };
  this.destroyPluggedWebcomponent = () => {
    if (this.pluggedWebComponent && typeof this.pluggedWebComponent.beforeDestroy === 'function') {
      this.pluggedWebComponent.beforeDestroy();
    }
    if (this.pluggedWebComponent) {
      this.pluggedWebComponent = false;
      this.pluggedWebComponentIsSync = false;
    }
  };
  this.render = (
    Onode: HTMLOgoneElement, /** original node */
    opts: OnodeComponentRenderOptions,
  ) => {
    if (!Onode || !opts) return;
    // Onode is a web component
    // based on the user token
    // this web component is a custom Element
    // at the first call of this function Onode is not "rendered" (replaced by the required element)
    let { callingNewComponent, length: dataLength } = opts;
    typeof dataLength === "object" ? dataLength = 1 : [];
    const context = Onode.context;
    // no need to render if it's the same
    if (context.list.length === dataLength) return;
    // first we add missing nodes
    for (let i = context.list.length, a = dataLength; i < a; i++) {
      let node: HTMLOgoneElement;
      node = document.createElement(context.name, { is: Onode.extends }) as HTMLOgoneElement;
      let ogoneOpts: any = {
        index: i,
        originalNode: false,
        level: Onode.ogone.level,
        position: Onode.ogone.position!.slice(),
        flags: Onode.ogone.flags,
        original: Onode,
        isRoot: false,
        name: Onode.ogone.name,
        tree: Onode.ogone.tree,
        namespace: Onode.ogone.namespace,
        isTemplate: Onode.ogone.isTemplate,
        isImported: Onode.ogone.isImported,
        isAsync: Onode.ogone.isAsync,
        isAsyncNode: Onode.ogone.isAsyncNode,
        isRouter: Onode.ogone.isRouter,
        isStore: Onode.ogone.isStore,
        isRemote: Onode.ogone.isRemote,
        extends: Onode.ogone.extends,
        uuid: Onode.ogone.uuid,
        routes: Onode.ogone.routes,

        parentNodeKey: Onode.ogone.parentNodeKey,
        ...(!callingNewComponent ? {
          component: this,
          nodeProps: Onode.ogone.nodeProps,
        } : {
            props: Onode.ogone.props,
            dependencies: Onode.ogone.dependencies,
            requirements: Onode.ogone.requirements,
            params: Onode.ogone.params,
            parentComponent: Onode.ogone.parentComponent,
            parentCTXId: Onode.ogone.parentCTXId,
            positionInParentComponent: Onode.ogone.positionInParentComponent ? Onode.ogone.positionInParentComponent
              .slice() : [],
            levelInParentComponent: Onode.ogone.levelInParentComponent,
          }),
      };
      setOgone(node, ogoneOpts);
      ogoneOpts = null;
      let previous = node;
      if (i === 0) {
        context.placeholder.replaceWith(node);
      } else {
        let lastEl = context.list[i - 1];
        if (lastEl && lastEl.isConnected) {
          insertElement(lastEl as HTMLOgoneElement, "afterend", node);
        } else if (Onode && Onode.parentNode && !Onode.renderedList) {
          Onode.parentNode.insertBefore(node, Onode.nextElementSibling);
          Onode.renderedList = true;
          previous = node;
        } else if (Onode && Onode.parentNode && Onode.renderedList) {
          Onode.parentNode.insertBefore(node, previous.nextElementSibling);
          previous = node;
        }
      }
      context.list.push(node);
    }
    // no need to remove if it's the same
    if (context.list.length === dataLength) return;
    // now we remove the extra elements
    for (let i = context.list.length, a = dataLength; i > a; i--) {
      if (context.list.length === 1) {
        // get the first element of the webcomponent
        let firstEl = context.list[0] as HTMLOgoneElement;
        if (firstEl && firstEl.firstNode && firstEl.isConnected) {
          insertElement(firstEl, "beforebegin", context.placeholder);
        } else if (Onode.parentNode) {
          const { parentNode } = context;
          parentNode.insertBefore(context.placeholder, Onode);
        }
      }
      const rm = context.list.pop() as HTMLOgoneElement;
      // don't use destroy here
      // if rm.destroy is used, it will not allow empty list to rerender
      removeNodes(rm);
      rm.remove();
    }
  };
  return this;
}
export function setReactivity(target: Object, updateFunction: Function, parentKey: string = ''): Object {
  const proxies: { [k: string]: Object } = {};
  return new Proxy(target, {
    get(obj: { [k: string]: unknown }, key: string, ...args: unknown[]) {
      let v;
      const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
      if (key === 'prototype') {
        v = Reflect.get(obj, key, ...args)
      } else if (obj[key] instanceof Object && !proxies[id]) {
        v = setReactivity(obj[key] as Object, updateFunction, id);
        proxies[id] = v;
      } else {
        v = Reflect.get(obj, key, ...args);
      }
      return v;
    },
    set(obj: { [k: string]: unknown }, key: string, value: unknown, ...args: unknown[]) {
      if (obj[key] === value) return true;
      const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
      const v = Reflect.set(obj, key, value, ...args);
      updateFunction(id);
      return v;
    },
    deleteProperty(obj, key) {
      const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
      const v = Reflect.deleteProperty(obj, key)
      delete proxies[id];
      updateFunction(id);
      return v;
    }
  });
};

export async function imp(id: string, url?: string) {
  if (Ogone.mod[id]) return;
  try {
    if (!url) {
      const mod = await import(id);
      Ogone.mod[id] = mod;
      return mod;
    } else {
      const mod = await import(`/?import=${url}`);
      Ogone.mod[id] = mod;
      return mod;
    }
  } catch (err) {
    displayError(err.message, "Error in Dynamic Import", new Error(`
    module's url: ${id}
    `));
  }
};
/**
 * function called right after Ogone.setOgone
 * Ogone.setOgone is called when the customElement is created by document.createElement
 */
function construct(node: HTMLOgoneElement) {
  const o = node.ogone;
  if (!o.type) return;
  node.dependencies = o.dependencies;
  if (o.isTemplate) {
    node.positionInParentComponent = [];
    o.component =
      (new Ogone.components[o.uuid as string]() as unknown) as OnodeComponent;
    o.component!.requirements = o.requirements;
    o.component!.dependencies = o.dependencies;
    o.component!.type = o.type;
    // define runtime for hmr
    // Ogone.instances[o.uuid] = Ogone.instances[o.uuid] || [];
  }
  // define templates of hmr
  // Ogone.mod[node.extends] = Ogone.mod[node.extends] || [];
}
/**
 * function that will add the ogone parameters into the customElement
 * those parameters are passed right after the creation of the customElement
 * in Ogone.render
 */
function setOgone(node: HTMLOgoneElement, def: OgoneParameters) {
  node.ogone = {
    isRemote: false,
    isRoot: false,
    isImported: false,
    position: [0],
    index: 0,
    level: 0,
    // TODO pass the root component inside a template function to fill this field
    // ex: bundle.components.get(entrypoint)
    uuid: '{% root.uuid %}',
    extends: '-nt',
    // int[]
    positionInParentComponent: [0],

    // int
    levelInParentComponent: 0,

    // define component
    component: null,

    // define parentComponent
    parentComponent: null,

    // jsx function
    render: null,

    // register all nodes of template or custom element
    nodes: [],

    // replacer is used for --ifElse flag
    replacer: null,

    // critical function
    getContext: null,

    // promise for await flag
    promise: null,

    // set routes if component is a router
    routes: null,

    // set the location
    locationPath: null,

    // set the actualTemplate of the router
    actualTemplate: null,

    // save the route
    actualRouteName: null,
    actualRoute: null,
    key: `n${Math.random()}`,

    // whenever the route change
    routeChanged: null,

    // set state to pass it through the history.state
    historyState: null,

    // usefull to delay actions on nodes
    methodsCandidate: [],
    // overwrite properties
    ...def,
  };
  // use the jsx function and save it into o.render
  // node function generates all the childNodes or the template
  node.ogone.render = Ogone.render[node.extends];
  if (!node.ogone.isTemplate) {
    node.type = `${node.type}-node`;
  }
  node.ogone.type = node.type as OgoneParameters["type"];
  if (node.type === "router" && def.routes) {
    node.ogone.locationPath = location.pathname;
    node.ogone.routes = def.routes;
    node.ogone.routeChanged = true;
    node.ogone.historyState = (() => {
      const url = new URL(location.href);
      // @ts-ignore
      const query = new Map(url.searchParams.entries());
      return { query };
    })();
  }
  construct(node);
}
/**
 * for dynamic attributes of any elements
 */
function setNodeProps(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!o || !oc || !o.nodes || !o.nodeProps) return;
  function r(n: HTMLElement, p: [string, string]) {
    const vl: string | ({ [k: string]: boolean }) = o.getContext({
      position: o.position,
      getText: `(${p[1]})`,
    });
    n.setAttribute(p[0], vl as string);
    return n.isConnected;
  }
  for (let n of o.nodes) {
    for (let p of o.nodeProps) {
      oc.react.push(() => r(n as HTMLElement, p));
      r(n as HTMLElement, p);
    }
  }
}
/**
 * will set the position of the node
 * using the level, assigned during the creation of the template, depending on how many ancestors has the element
 * and an index which will increase if needed into a loop
 * each element in the rendered loop has it's own index
 */
function setPosition(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (o.position && typeof o.level === 'number' && typeof o.index === 'number') {
    o.position[o.level as number] = o.index;
  }
}
/**
 * set the props into the component from the OgoneParameters.props
 * OgoneParameters.props is passed during the creation of the node
 */
function setProps(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!o || !oc) return;
  if (!o.index) {
    o.index = 0;
  }
  oc.props = o.props;
  if (!o.positionInParentComponent || o.levelInParentComponent !== undefined) {
    oc.positionInParentComponent = o.positionInParentComponent!;
    o.positionInParentComponent![
      o.levelInParentComponent!
    ] = o.index;
  }
  oc.updateProps();
}
/**
 * for the flag --spread
 */
function useSpread(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  const op = oc.parent;
  let reaction, parent;
  if (o.isTemplate && o.flags && o.flags.spread && op) {
    reaction = () => {
      const v = o.getContext({
        position: o.positionInParentComponent,
        getText: `{${o.flags.spread}}`,
      });
      Object.entries(v).forEach(([k, value]) => {
        oc.updateService(k, value);
      });
      return oc.activated;
    };
    parent = oc.parent;
  } else if (!o.isTemplate && o.flags && o.flags.spread) {
    reaction = () => {
      const v = o.getContext({
        position: o.positionInParentComponent,
        getText: `{${o.flags.spread}}`,
      });
      Object.entries(v).forEach(([k, value]) => {
        if (o.nodes) {
          for (let n of o.nodes) {
            n.setAttribute(k, value as string);
          }
        }
      });
      return oc.activated;
    };
    parent = oc.react
  }
  reaction && reaction();
  parent
    && reaction
    && (parent as unknown as OnodeComponent).react.push(reaction as Function);
}
/**
 * use the dedicated render function inside Ogone.render
 * which returns all the template of the component or the dynamic node
 */
function setNodes(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc || !o.render) return;
  if (o.isTemplate) {
    o.nodes = Array.from(
      o.render(oc).childNodes,
    ) as (HTMLOgoneElement & HTMLElement)[];
  } else {
    o.nodes = [o.render(oc, o.position, o.index, o.level) as HTMLOgoneElement];
  }
  if (o.methodsCandidate && o.methodsCandidate.length) {
    o.methodsCandidate.forEach((f, i, arr) => {
      if (o.nodes) {
        for (let n of o.nodes) {
          if (n.ogone) {
            saveUntilRender(n, f);
          } else {
            f(n);
          }
        }
      }
      delete arr[i];
    });
  }
}
/**
 * will remove all nodes of the component
 */
function removeNodes(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return Onode;
  /* use it before removing template node */
  function rm(n: any) {
    if (n.ogone) {
      destroy(n);
      n.context.placeholder.remove();
    } else {
      (n as HTMLElement).remove();
    }
  }
  if (o.actualTemplate) {
    o.actualTemplate.forEach((n) => {
      rm(n);
    });
  }
  o.nodes.forEach((n) => {
    rm(n);
  });
  if (Onode.ogone.component) {
    Onode.ogone.component.activated = false;
  }
  return Onode;
}
/**
 * will destroy the component and use the case 'destroy'
 */
function destroy(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  Onode.context.list.forEach((n) => {
    removeNodes(n as HTMLOgoneElement);
    n.remove();
  });
  removeNodes(Onode);
  if (o.isTemplate) {
    oc.destroyPluggedWebcomponent();
    oc.runtime("destroy");
    oc.activated = false;
  }
  // ogone: {% destroy.devTool %}
  Onode.context.placeholder.remove();
  Onode.remove();
}
/**
 * adds Listeners on nodes
 */
function setEvents(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!o.flags || !o.getContext || !oc || !o.nodes) return;
  const position = Onode.isComponent
    ? oc.positionInParentComponent
    : o.position;
  const c = Onode.isComponent ? oc.parent : oc;
  for (let node of o.nodes) {
    for (let flag of o.flags.events) {
      if (flag.type === "wheel") {
        /* for wheel events */
        if (node.ogone) {
          // check if it's an ogone element
          // if it's one
          // node.ogone.nodes can be empty at Onode moment
          // so we need to save the following function and remove it
          saveUntilRender(node, (nr: HTMLElement & { hasWheel: boolean }) => {
            nr.hasWheel = true;
            nr.addEventListener(flag.type, (ev) => {
              const foundWheel = ev.path.find((n: HTMLElement & { hasWheel: boolean }) =>
                n && n.hasWheel
              );
              if (foundWheel && !foundWheel.isSameNode(node)) return;
              if (o.getContext && c) {
                const filter = o.getContext({
                  getText: `${flag.filter}`,
                  position,
                }) as string;
                const ctx = o.getContext({
                  position,
                });
                switch (true) {
                  case filter === "right" && ev.wheelDeltaX < 0:
                    c.runtime(flag.case, ctx, ev);
                    break;
                  case filter === "left" && ev.wheelDeltaX > 0:
                    c.runtime(flag.case, ctx, ev);
                    break;
                  case filter === "up" && ev.wheelDeltaY > 0:
                    c.runtime(flag.case, ctx, ev);
                    break;
                  case filter === "down" && ev.wheelDeltaY < 0:
                    c.runtime(flag.case, ctx, ev);
                    break;
                  case filter === null:
                    c.runtime(flag.case, ctx, ev);
                    break;
                }
              }
            });
          });
        } else {
          (node as unknown as { hasWheel: boolean }).hasWheel = true;
          (node as HTMLElement).addEventListener(flag.type, (ev) => {
            const foundWheel = ev.path.find((n: HTMLElement & { hasWheel: boolean }) =>
              n && n.hasWheel
            );
            if (foundWheel && !foundWheel.isSameNode(node)) return;
            if (o.getContext && c) {
              const filter = o.getContext({
                getText: `${flag.filter}`,
                position,
              }) as string;
              const ctx = o.getContext({
                position,
              });
              switch (true) {
                case filter === "right" && ev.wheelDeltaX < 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === "left" && ev.wheelDeltaX > 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === "up" && ev.wheelDeltaY > 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === "down" && ev.wheelDeltaY < 0:
                  c.runtime(flag.case, ctx, ev);
                  break;
                case filter === null:
                  c.runtime(flag.case, ctx, ev);
                  break;
              }
            }
          });
        }
      } else if (flag.type.startsWith("key") && c) {
          /* all keyboard event */ document.addEventListener(
        flag.type,
        (ev) => {
          const filter = o.getContext({
            getText: `${flag.filter}`,
            position,
          });
          const ctx = o.getContext({
            position,
          });
          switch (true) {
            case ev.charCode === filter:
              c.runtime(flag.case, ctx, ev);
              break;
            case ev.key === filter:
              c.runtime(flag.case, ctx, ev);
              break;
            case ev.keyCode === filter:
              c.runtime(flag.case, ctx, ev);
              break;
            case ev.code.toLowerCase() === filter:
              c.runtime(flag.case, ctx, ev);
              break;
            case !filter:
              c.runtime(flag.case, ctx, ev);
              break;
          }
        },
      );
      } else if (flag.name === "router-go" && flag.eval) {
        /* special for router-go flag */
        if (node.ogone) {
          saveUntilRender(node, (nr: HTMLElement) => {
            nr.addEventListener("click", (ev: MouseEvent) => {
              routerGo(
                o.getContext({
                  getText: `${flag.eval}`,
                  position,
                }),
                history.state,
              );
            });
          });
        } else {
          (node as HTMLElement)
            .addEventListener("click", (ev: MouseEvent) => {
              routerGo(
                o.getContext({
                  getText: `${flag.eval}`,
                  position,
                }),
                history.state,
              );
            });
        }
      } else if (flag.name === 'router-dev-tool' && flag.eval) { // special for router-dev-tool flag
        node.addEventListener("click", () => {
          /**
          if (Ogone.router.openDevTool) {
            Ogone.router.openDevTool({});
          }
          */
        });
      } else if (flag.name === "event" && flag.type.startsWith('animation')) {
        if (node.ogone) {
          saveUntilRender(node, (nr: HTMLElement) => {
            nr.addEventListener(flag.type, (ev) => {
              if (flag.eval !== ev.animationName) return;
              const ctx = o.getContext({
                position,
              });
              if (c) {
                c.runtime(flag.case, ctx, ev);
              }
            });
          })
        } else {
          (node as HTMLElement).addEventListener(flag.type, (ev) => {
            if (flag.eval !== ev.animationName) return;
            const ctx = o.getContext({
              position,
            });
            if (c) {
              c.runtime(flag.case, ctx, ev);
            }
          });
        }
      } /* DOM L3 */ else {
        if (node.ogone) {
          saveUntilRender(node, (nr: HTMLElement) => {
            nr.addEventListener(flag.type, (ev) => {
              const ctx = o.getContext({
                position,
              });
              if (c) {
                c.runtime(flag.case, ctx, ev);
              }
            });
          })
        } else {
          (node as HTMLElement).addEventListener(flag.type, (ev) => {
            const ctx = o.getContext({
              position,
            });
            if (c) {
              c.runtime(flag.case, ctx, ev);
            }
          });
        }
      }
    }
  }
}
/**
 * recursive insertion, this function is involved into the loops rendering
 */
function insertElement(
  Onode: HTMLOgoneElement,
  p: "beforebegin" | "afterbegin" | "beforeend" | "afterend",
  el: HTMLElement,
): undefined | Element | null {
  if (!Onode.firstNode) {
    Onode.insertAdjacentElement(p, el);
    return;
  }
  let target;
  switch (p) {
    case "beforebegin":
      target = Onode.firstNode;
      break;
    case "afterbegin":
      target = Onode.firstNode;
      break;
    case "beforeend":
      target = Onode.lastNode;
      break;
    case "afterend":
      target = Onode.lastNode;
      break;
  }
  return (!!(target as HTMLOgoneElement).ogone
    ? insertElement((target as HTMLOgoneElement).context.list[
      (target as HTMLOgoneElement).context.list.length - 1
    ] as HTMLOgoneElement, p, el)
    : (target as HTMLElement).insertAdjacentElement(p, el));
}
/**
 * this function is used inside an array.find this is why it returns a boolean.
 * true if the route matches
 */
function routerSearch(Onode: HTMLOgoneElement, route: Route, locationPath: string) {
  if (typeof locationPath !== "string") return false;
  const { path } = route;
  const splitted = path.toString().split("/");
  const locationSplit = locationPath.split("/");
  const result: Route['params'] = {};
  if (
    !splitted.filter((r) => r.trim().length).length !==
    !locationSplit.filter((r) => r.trim().length).length
  ) {
    return false;
  }
  if (splitted.length !== locationSplit.length) return false;
  const error = splitted.find((p, i, arr) => {
    if (!p.startsWith(":")) {
      return locationSplit[i] !== p;
    }
  });
  if (error) return false;
  splitted.forEach((p, i) => {
    if (p.startsWith(":")) {
      const param = p.slice(1, p.length);
      result[param] = locationSplit[i];
    }
  });
  route.params = result;
  return true;
}
/**
 * used inside a reaction, this will create a new component each time the route is updated, via routerGo(...)
 */
function setActualRouterTemplate(node: any) {
  const o = node.ogone, oc = o.component;
  oc.routes = o.routes;
  oc.locationPath = o.locationPath;
  const l = oc.locationPath;
  let rendered = oc.routes.find((r: any) =>
    r.path === l || routerSearch(node, r, l) || r.path === 404
  );
  let preservedParams = rendered.params;
  // redirections
  while (rendered && rendered.redirect) {
    rendered = oc.routes.find((r: any) => r.name === rendered.redirect);
    if (rendered) {
      rendered.params = preservedParams;
    }
  }
  if (rendered) {
    o.actualRouteName = rendered.name || null;
  }
  if (!rendered) {
    o.actualTemplate = new Comment();
    o.actualRoute = null;
    o.routeChanged = true;
  } else if (
    rendered && !(rendered.once || o.actualRoute === rendered.component)
  ) {
    const { component: uuidC } = rendered;
    const co = document.createElement("template", { is: uuidC }) as HTMLOgoneElement;
    o.actualTemplate = co;
    o.actualRoute = rendered.component;
    o.routeChanged = true;
    // don't spread o
    // some props of o can overwritte the template.ogone and create errors in context
    // like undefined data
    let ogoneOpts: OgoneParameters | null = {
      isTemplate: true,
      isRouter: false,
      isStore: false,
      isAsync: false,
      isAsyncNode: false,
      requirements: o.requirements,
      routes: o.routes,
      originalNode: false,
      dependencies: [],
      extends: "-nt",
      uuid: rendered.uuid,
      tree: o.tree,
      params: rendered.params || null,
      props: o.props,
      parentComponent: o.parentComponent,
      parentCTXId: o.parentCTXId,
      positionInParentComponent: o.positionInParentComponent
        .slice(),
      levelInParentComponent: o.levelInParentComponent,
      index: o.index,
      level: o.level,
      position: o.position,
      flags: o.flags,
      isRoot: false,
      name: rendered.name || rendered.component,
      parentNodeKey: o.key,
    };
    setOgone(co, ogoneOpts);
    ogoneOpts = null;
    // if the route provide any title
    // we change the title of the document

    if (rendered.title) {
      document.title = rendered.title;
    }
  } else {
    o.routeChanged = false;
  }
}

/**
 * to any element that has the flag --await
 */
function setNodeAsyncContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (o.flags && o.flags.await) {
    const promise = new Promise((resolve, reject) => {
      if (typeof o.flags.await === "boolean") {
        Onode.firstNode.addEventListener("load", () => {
          resolve(false);
        });
      } else {
        const type = o.getContext({
          getText: o.flags.await,
          position: o.position,
        });
        Onode.firstNode.addEventListener(type, () => {
          resolve(false);
        });
      }
    });
    oc.promises.push(promise);
  }
}
/**
 * set the context when the user uses the flags: then, catch, finally
 * the context is saved into OComponent.async
 */
function setAsyncContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (o.flags && o.flags.then) {
    oc.async.then = o.flags.then;
  }
  if (o.flags && o.flags.catch) {
    oc.async.catch = o.flags.catch;
  }
  if (o.flags && o.flags.finally) {
    oc.async.finally = o.flags.finally;
  }
  if (o.flags && o.flags.defer) {
    const promise = oc.parentContext({
      getText: o.flags.defer,
      position: o.positionInParentComponent,
    });
    oc.promises.push(promise);
  }
}
/**
 * returns the new webcomponent, the instance of OComponent will save this webcomponent and synchronize itself with the webcomponent.
 */
function recycleWebComponent(Onode: HTMLOgoneElement, opts: OgoneRecycleOptions): HTMLElement {
  const { injectionStyle, id, name, component, isSync } = opts;
  let webcomponent;
  if (opts.extends) {
    const original = opts.extends;
    webcomponent = document.createElement(original, {
      is: name,
    });
  } else {
    webcomponent = document.createElement(name);
  }
  // webcomponent preparation
  webcomponent.setAttribute(id, '');
  // inject the webcomponent into the template
  Onode[injectionStyle || 'append'](webcomponent);
  // plug the webcomponent to the component
  component.plugWebComponent(webcomponent, isSync);
  return webcomponent;
}
/**
 * this function saves another function into OgoneParameters of the HTMLOgoneElement
 * ```typescript
 * Onode.ogone.methodsCandidate.push(f);
 * ```
 * the saved function will trigger when everything is ready in the HTMLOgoneElement
 */
function saveUntilRender(Onode: HTMLOgoneElement, f: Function): void {
  if (Onode.ogone.methodsCandidate) {
    Onode.ogone.methodsCandidate.push(f);
  }
}
/**
 * for the flag --bind
 */
function bindValue(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!o.flags || !o.flags.bind || !oc || !o.nodes) return;
  function r(n: HTMLInputElement, dependency: boolean | string) {
    const k = o.flags.bind;
    const evl = o.getContext({
      position: o.position,
      getText: k,
    });
    if (dependency === true) {
      // force binding
      n.value = evl;
    }
    if (
      typeof k === "string" &&
      k.indexOf(dependency as string) > -1 &&
      evl !== undefined && n.value !== evl
    ) {
      n.value = evl;
    }
    return n.isConnected;
  }
  for (let n of o.nodes) {
    (n as unknown as HTMLInputElement).addEventListener("keydown", (ev: Event) => {
      const k = o.flags.bind;
      const evl = o.getContext({
        position: o.position,
        getText: k,
      });
      if (evl !== (n as unknown as HTMLInputElement).value) {
        const ctx = o.getContext({
          position: o.position,
        });
        const values = Object.values(ctx);
        const keys = Object.keys(ctx);
        const fn = new Function(...keys, "n", `${k} = n.value;`);
        fn.bind(oc.data)(...values, n);
        oc.update(k, ev);
      }
    });
    (n as unknown as HTMLInputElement).addEventListener("keyup", (ev: Event) => {
      const k = o.flags.bind;
      const evl = o.getContext({
        position: o.position,
        getText: k,
      });
      if (evl !== (n as unknown as HTMLInputElement).value) {
        const ctx = o.getContext({
          position: o.position,
        });
        const values = Object.values(ctx);
        const keys = Object.keys(ctx);
        const fn = new Function(...keys, "n", `${k} = n.value;`);
        fn.bind(oc.data)(...values, n);
        oc.update(k, ev);
      }
    });
    (n as unknown as HTMLInputElement).addEventListener("change", (ev: Event) => {
      const k = o.flags.bind;
      const evl = o.getContext({
        position: o.position,
        getText: k,
      });
      if (evl !== (n as unknown as HTMLInputElement).value) {
        const ctx = o.getContext({
          position: o.position,
        });
        const values = Object.values(ctx);
        const keys = Object.keys(ctx);
        const fn = new Function(...keys, "n", `${k} = n.value;`);
        fn.bind(oc.data)(...values, n);
        oc.update(k, ev);
      }
    });
    oc.react.push((dependency: string | boolean) =>
      r((n as unknown as HTMLInputElement), dependency)
    );
    r((n as unknown as HTMLInputElement), true);
  }
}
/**
 * for the flag --class
 */
function bindClass(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!o.flags || !o.flags.class || !oc || !o.nodes) return;
  function r(n: HTMLElement) {
    const vl = o.getContext({
      position: o.position,
      getText: (o.flags.class),
    });
    if (typeof vl === "string") {
      n.classList.value = vl;
    } else if (typeof vl === "object") {
      const keys = Object.keys(vl);
      n.classList.add(...keys.filter((key) => vl[key]));
      n.classList.remove(...keys.filter((key) => !vl[key]));
    } else if (Array.isArray(vl)) {
      n.classList.value = vl.join(" ");
    }
    return n.isConnected;
  }
  for (let node of o.nodes) {
    oc.react.push(() => r(node as HTMLElement));
    r(node as HTMLElement);
  }
}
/**
 * for the flag --html
 */
function bindHTML(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!o.flags || !o.flags.html || !oc || !o.nodes || o.isTemplate) return;
  function r(n: HTMLElement) {
    const vl = o.getContext({
      position: o.position,
      getText: (o.flags.html),
    });
    if (typeof vl === "string") {
      n.innerHTML = '';
      n.insertAdjacentHTML('beforeend', vl);
    }
    return n.isConnected;
  }
  for (let node of o.nodes) {
    oc.react.push(() => r(node as HTMLElement));
    r(node as HTMLElement);
  }
}
/**
 * for the flag --style
 */
function bindStyle(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!o.flags || !o.flags.style || !oc || !o.nodes) return;
  function r(n: HTMLElement) {
    const vl: string | ({ [k: string]: boolean }) = o.getContext({
      position: o.position,
      getText: o.flags.style,
    });
    if (typeof vl === "string") {
      Object.keys(n.style)
        .forEach((key: string) => {
          // @ts-ignore
          n.style[key] = vl[key];
        });
    } else if (typeof vl === "object") {
      Object.entries(vl)
        // @ts-ignore
        .forEach(([k, v]: [string, boolean]) => n.style[k] = v);
    }
    return n.isConnected;
  }
  for (let n of o.nodes) {
    oc.react.push(() => r(n as HTMLElement));
    r(n as HTMLElement);
  }
}
function setContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc || !o.key) return;
  if (o.isTemplate) {
    oc.key = o.key;
    oc.dependencies = o.dependencies;
    if (o.parentComponent) {
      oc.parent = o.parentComponent;
      oc.parent.childs.push(oc);
    }
    if (Ogone.contexts[o.parentCTXId] && o.parentComponent) {
      const gct = Ogone.contexts[o.parentCTXId].bind(
        o.parentComponent.data,
      );
      oc.parentContext = gct;
      o.getContext = gct;
    }
  } else if (Ogone.contexts[Onode.extends] && oc) {
    o.getContext = Ogone.contexts[Onode.extends].bind(oc.data);
  }
  if (o.type === "store" && oc.parent) {
    oc.namespace = Onode.getAttribute("namespace") || null;
    oc.parent.store[oc.namespace as string] = oc;
  }
}
function setDevToolContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  const ocp = oc.parent as OnodeComponent;
  const tree = o.tree
    ? o.tree
      .replace(
        "null",
        Onode.isComponent ? ocp.key as string : oc.key as string,
      )
      .split(">")
    : [o.key];
  Ogone.ComponentCollectionManager.read({
    tree,
    key: o.key,
    parentNodeKey: o.parentNodeKey,
    name: o.name || tree[tree.length - 1],
    ctx: oc,
    isRoot: o.isRoot,
    parentCTX: ocp,
    type: o.isTemplate ? o.isRoot ? "root" : oc.type : "element",
  });
}
function displayError(message: string, errorType: string, errorObject: Error) {
  // here we render the errors in development
  if (!Ogone.errorPanel) {
    const p = document.createElement("div");
    Object.entries({
      zIndex: "5000000",
      background: "#00000097",
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: "0px",
      left: "0px",
      overflowY: "auto",
      justifyContent: "center",
      display: "grid",
      flexDirection: "column",
    }).forEach(([key, value]: [string, string]) => {
      p.style[key as unknown as number] = value;
    });
    Ogone.errorPanel = p;
  }
  Ogone.errors++;
  const err = document.createElement("div");
  Object.entries({
    zIndex: "5000000",
    background: "#000000",
    minHeight: "fit-content",
    maxWidth: "70%",
    padding: "21px",
    color: "red",
    borderLeft: "3px solid red",
    margin: "auto",
    display: "inline-flex",
    flexDirection: "column",
  }).forEach(([key, value]) => err.style[key as unknown as number] = value);
  const errorId = Ogone.errors;
  const code = document.createElement("code");
  const stack = document.createElement("code");
  const h = document.createElement("h4");
  // set the text
  h.innerText = `[Ogone] Error ${errorId}: ${errorType ||
    "Undefined Type"}`;
  code.innerText = `${message.trim()}`;
  stack.innerText = `${errorObject && errorObject.stack ?
      errorObject.stack.replace(message, "")
      : ""
    }`;
  // check if stack is empty or not
  if (!stack.innerText.length && errorObject && errorObject.message) {
    stack.innerText = `${errorObject && errorObject.message ? errorObject.message : ""
      }`;
  }
  !stack.innerText.length ? stack.innerText = "undefined stack" : "";
  // set the styles
  code.style.marginLeft = "20px";
  code.style.whiteSpace = "pre-wrap";
  code.style.wordBreak = "break-word";
  stack.style.marginLeft = "20px";
  stack.style.color = "#dc7373";
  stack.style.padding = "17px";
  stack.style.background = "#462626";
  stack.style.whiteSpace = "pre-wrap";
  stack.style.wordBreak = "break-word";
  stack.style.border = "1px solid";
  stack.style.marginTop = "10px";
  h.style.color = "#8c8c8c";
  if (!Ogone.firstErrorPerf) {
    Ogone.firstErrorPerf = performance.now();
  }
  if (Ogone.errorPanel) {
    Ogone.errorPanel.style.paddingTop = "30px";
    // set the grid of errors
    err.style.gridArea = `e${errorId}`;
    const m = 2;
    let grid = "";
    let i = 0;
    let a = 0;
    for (i = 0, a = Ogone.errorPanel.childNodes.length + 1; i < a; i++) {
      grid += `e${i + 1} `;
    }
    let b = i;
    while (i % m) {
      grid += `e${b} `;
      i++;
    }
    const cells = grid.split(" ");
    var o, j, temparray, chunk = m;
    let newgrid = "";
    for (o = 0, j = cells.length - 1; o < j; o += chunk) {
      temparray = cells.slice(o, o + chunk);
      newgrid += ` "${temparray.join(" ")}"`;
    }
    Ogone.errorPanel.style.gridGap = "10px";
    Ogone.errorPanel.style.gridAutoRows = "max-content";
    Ogone.errorPanel.style.gridTemplateRows = "masonry";
    Ogone.errorPanel.style.gridTemplateAreas = newgrid;
    err.style.animationName = "popup";
    err.style.animationIterationCount = "1";
    err.style.animationDuration = "0.5s";
    // append elements
    err.append(h, code, stack);
    Ogone.errorPanel.append(err);
    Ogone.errorPanel.style.pointerEvents = "scroll";
    //  append only if it's not in the document
    !Ogone.errorPanel.isConnected
      ? document.body.append(Ogone.errorPanel)
      : [];
  }
};

function showPanel(panelName: 'infos' | 'error' | 'success' | 'warn', time: number | undefined) {
  const panel = panelName === 'infos' ?
    Ogone.infosPanel :
    panelName === 'success' ?
      Ogone.successPanel :
      panelName === 'warn' ?
        Ogone.warnPanel :
        Ogone.errorPanel;
  if (panel) {
    document.body.append(panel);
    if (time) {
      setTimeout(() => {
        const f = document.createDocumentFragment();
        f.append(panel);
      }, time);
    }
  }
}
function infosMessage(opts: { message: string; }) {
  if (!Ogone.infosPanel) {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.opacity = "0.85";
    container.style.bottom = "0px";
    container.style.left = "0px";
    container.style.background = "var(--o-header, #333333)";
    container.style.padding = "5px";
    container.style.paddingRight = "15px";
    container.style.width = "max-content";
    container.style.color = "var(--o-grey, #cecece)";
    container.style.fontSize = "10pt";
    container.style.fontFamily = "sans-serif";
    container.style.borderLeft = "3px solid var(--o-secondary, #61c3aa)";
    container.style.zIndex = "400000";
    Ogone.infosPanel = container;
  }
  Ogone.infosPanel!.innerHTML = opts.message;
  showPanel("infos", 2000);
}
export async function hmr(url: string) {
  try {
    const mod = await import(`${url}?p=\${performance.now()}`);
    const keys = Object.keys(Ogone.mod);
    keys.filter((key) => key === url).forEach((key) => {
      Ogone.mod[key] = mod;
    });
    Ogone.mod["*"]
      .forEach(([key, f]: [string, any], i, arr) => {
        key === url && f && !f(mod) ? delete arr[i] : 0;
      });
    return mod;
  } catch (err) {
    displayError(err.message, "HMR-Error", new Error(`
    module's url: ${url}
    `));
    throw err;
  }
}
export async function hmrTemplate(uuid: string | number, pragma: any) {
  try {
    const templates = Ogone.mod[uuid];
    if (templates) {
      templates.forEach((f: (arg0: any) => any, i: string | number, arr: { [x: string]: any; }) => {
        f && !f(pragma) ? delete arr[i] : 0;
      });
    }
    return templates;
  } catch (err) {
    displayError(err.message, "HMR-Error", err);
    throw err;
  }
}
export async function hmrRuntime(uuid: string | number, runtime: { bind: (arg0: any) => any; }) {
  try {
    const components = Ogone.instances[uuid];
    if (components) {
      components.forEach((c, i, arr) => {
        if (c.activated) {
          c.runtime = runtime.bind(c.data);
          c.runtime(0);
          c.renderTexts(true);
        } else {
          delete arr[i];
        }
      });
    }
    return components;
  } catch (err) {
    displayError(err.message, "HMR-Error", err);
    throw err;
  }
}
function startConnection() {
  if (Ogone.isDeno) {
    // createServer();
  } else {
    createClient();
  }
}
function createClient() {
  const ws = new WebSocket(`ws://localhost:${Ogone.websocketPort}/`);
  ws.onmessage = (msg) => {
    const { url, type, uuid, pragma, ctx, style, runtime } = JSON.parse(
      msg.data,
    );
    if (type === "javascript") {
      hmr(url).then(() => {
        console.warn("[Ogone] hmr:", url);
        infosMessage({
          message: `[HMR] module updated: ${url}`,
        });
      });
    }
    if (type === "template" && pragma && uuid) {
      eval(ctx);
      hmrTemplate(uuid, pragma).then(() => {
        infosMessage({
          message: `[HMR] template updated: ${uuid}`,
        });
      });
    }
    if (type === "reload") {
      console.warn("[Ogone] hmr: reloading the application");
      infosMessage({
        message: `[HMR] socket lost. Reloading your application`,
      });
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
    if (type === "style") {
      const styleElement = document.querySelector(`style[id="${uuid}"]`);
      if (styleElement) styleElement.innerHTML = style;
      infosMessage({
        message: `[HMR] style updated: ${uuid}`,
      });
    }
    if (type === "runtime") {
      const r = eval(runtime);
      hmrRuntime(uuid, (r || function () { })).then(() => {
        infosMessage({
          message: `[HMR] component updated: ${uuid}`,
        });
      });
    }
  };

  ws.onclose = () => {
    setTimeout(() => {
      console.warn("[Ogone] ws closed: reloading");
      location.reload();
    }, 1000);
  };
  return ws;
}
/**
 * fake slot replacement inside the component
 * // TODO use native slot implementation
 */
function renderSlots(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const slots = Array.from(Onode.querySelectorAll("[slot]"));
  for (
    let node of o.nodes.filter((n) => (n as HTMLElement).nodeType === 1)
  ) {
    // d for default slots
    const d = (node as HTMLElement).querySelector("slot:not([name])");
    if (d) {
      d.replaceWith(...Array.from(Onode.childNodes));
    }
  }
  for (let slotted of slots) {
    // sn for slotName
    const sn = slotted.getAttribute("slot");
    for (let n of o.nodes) {
      const s = (n as HTMLElement).querySelector(`slot[name="${sn}"]`);
      if (s) {
        slotted.removeAttribute("slot");
        s.replaceWith(slotted);
      }
    }
  }
}
/**
 * global instructions for the rendering of the HTMLOgoneElement
 * will render all the dynamic textnodes and replace all the slots elements
 */
function renderNode(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (o.isTemplate) {
    // update Props before replace the element
    oc.updateProps();
    if (Onode.childNodes.length) {
      renderSlots(Onode);
    }
    // replace the element
    if (o.type === "async") {
      Onode.context.placeholder.replaceWith(...(o.nodes as Node[]));
    } else {
      Onode.replaceWith(...(o.nodes as Node[]));
    }
    // template/node is already connected
    // ask the component to evaluate the value of the textnodes
    oc.renderTexts(true);

    // trigger the init case of the component
    // we can pass the parameters of the router into the ctx
    if (o.type !== "async") {
      oc.startLifecycle({
        router: {
          params: o.params,
          state: history.state,
          path: location.pathname,
        },
      });
    }
  } else if (oc) {
    if (Onode.childNodes.length) {
      renderSlots(Onode);
    }
    oc.renderTexts(true);
    Onode.replaceWith(...(o.nodes as Node[]));
  }
}
/**
 * start the store component's lifeCycle and remove all nodes of the store component
 * ends by removing the HTMLOgoneElement
 * throws if the namespace doesn't match with the namespace inside the store component
 */
function renderStore(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (oc.namespace !== o.namespace) {
    const error =
      "the attribute namespace is not the same provided in the component store";
    const BadNamspaceException = new Error(`[Ogone] ${error}`);
    displayError(error, "Store Module: Bad Namsepace Exception", new Error(`
      store namespace: ${o.namespace}
      attribute namespace: ${oc.namespace}
      `));
    throw BadNamspaceException;
  }
  oc.startLifecycle();
  removeNodes(Onode)
  Onode.remove();
}
/**
 * all the instructions involved in the implementation of the router.
 * this will use a HTMLSectionElement and alays replace it's innerHTML
 */
function renderRouter(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  // update Props before replacement of the element
  oc.updateProps();
  if (!o.replacer) {
    o.replacer = document.createElement('section');
  }
  if (Onode.parentNode) {
    Onode.replaceWith(o.replacer);
  }
  if (o.routeChanged) {
    o.replacer.innerHTML = "";
    o.replacer.append(o.actualTemplate as unknown as Node);
  }
  // run case router:xxx on the router component
  oc.runtime(`router:${o.actualRouteName || o.locationPath}`, history.state);
}
/**
 * rendering instructions for the router components inside an async component context
 */
function renderAsyncRouter(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "router";
  const s = o.nodes.filter(filter) as HTMLOgoneElement[];
  for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
    const arrayOfTemplates = Array.from(n.querySelectorAll("template"))
      .filter(filter) as typeof s;
    for (let template of arrayOfTemplates) {
      s.push(template);
    }
  }
  for (let t of s) {
    t.connectedCallback();
  }
}
/**
 * rendering instructions for the store components inside an async component context
 */
function renderAsyncStores(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "store";
  const asyncStores = o.nodes.filter(filter) as HTMLOgoneElement[];
  for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
    const arrayOfTemplates = Array.from(n.querySelectorAll("template"))
      .filter(filter) as typeof asyncStores;
    for (let template of arrayOfTemplates) {
      asyncStores.push(template);
    }
  }
  for (let t of asyncStores) {
    t.connectedCallback();
    removeNodes(t)
    t.remove();
  }
}
/**
 * rendering instructions for async components inside an async component context
 */
function renderAsyncComponent(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc || !o || !o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "async";
  for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
    const awaitingNodes = Array.from(node.querySelectorAll("template"))
      .filter(filter) as HTMLOgoneElement[];
    if (
      node.isComponent && node.ogone && node.ogone.component && node.ogone.component.type === "async"
    ) {
      awaitingNodes.push(node);
    }
    for (let awaitingNode of awaitingNodes) {
      // create a custom Event for parent component
      // parent component will wait the event to be dispatched
      const ev = new CustomEvent(`${o.key}:${awaitingNode.ogone.key}:resolve`);
      awaitingNode.component.dispatchAwait = () => {
        awaitingNode.dispatchEvent(ev);
      };

      // force rendering of awaiting node
      // TODO revert force async render
      // forceAsyncRender(awaitingNode);

      const promise = new Promise((resolve) => {
        if (awaitingNode.component.promiseResolved) {
          // if the async child component resolve directly the promise
          resolve(true);
        } else {
          awaitingNode.addEventListener(
            `${o.key}:${awaitingNode.ogone.key}:resolve`,
            () => {
              resolve(true);
            },
          );
        }
      });
      oc.promises.push(promise);
    }
  }
}
/**
 * rendering instructions for the basic components inside an async component context
 */
function renderComponent(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (!o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "component";
  for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
    const components = Array.from(node.querySelectorAll("template"))
      .filter(filter) as HTMLOgoneElement[];
    let n = (node as HTMLOgoneElement);
    if (
      n.isComponent && n.ogone && n.ogone.component && n.ogone.component.type === "component"
    ) {
      components.push(n as HTMLOgoneElement);
    }
    for (let onode of components) {
      // force rendering of awaiting node
      // TODO revert froce Async render
      // forceAsyncRender(onode);
      renderingProcess(onode);
    }
  }
}
/**
 * instructions for the async components
 */
function renderAsync(Onode: HTMLOgoneElement, shouldReportToParentComponent?: boolean) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  // first render child stores component
  renderAsyncStores(Onode);

  // first render child router component
  renderAsyncRouter(Onode);

  // render components
  renderComponent(Onode);

  // then render child async components
  renderAsyncComponent(Onode);

  const chs = Array.from(Onode.childNodes) as (HTMLElement | HTMLOgoneElement)[];
  const placeholder = Onode.context.placeholder;
  const txt = chs.find((n) => n.nodeType === 3) as unknown as Text;
  if (txt) {
    const UnwrappedTextnodeOnAsyncComponentException = new Error(
      `[Ogone] Top level textnode are not supported for Async component placeholder.
            Please wrap this text into an element.
            textnode data: "${txt.data}"`,
    );
    displayError(
      UnwrappedTextnodeOnAsyncComponentException.message,
      "Async Component placeholder TypeError",
      UnwrappedTextnodeOnAsyncComponentException,
    );
    throw UnwrappedTextnodeOnAsyncComponentException;
  }
  // async placeholder feature
  if (chs.length) {
    Onode.replaceWith(...chs);
  } else {
    Onode.replaceWith(placeholder);
  }
  oc.resolve = (...args: unknown[]) => {
    return new Promise((resolve) => {
      // we need to delay the execution
      // for --defer flag
      setTimeout(() => {
        // set Async context for Async Components
        setAsyncContext(Onode);

        // replace childnodes by template
        if (chs.length) {
          const { isConnected } = chs[0];
          if (isConnected) {
            chs.slice(1).forEach((ch) => {
              if ((ch as HTMLOgoneElement).ogone) {
                removeNodes(ch as HTMLOgoneElement)
                ch.remove();
                return;
              }
              ch.remove();
            });
            chs[0].replaceWith(placeholder);
          }
        }
        resolve(true);
      }, 0);
    }).then(() => {
      Promise.all(oc.promises)
        .then((p) => {
          // render the element;
          renderNode(Onode);
          if (oc.async.then && shouldReportToParentComponent && oc.parent) {
            // handle resolution with --then:...
            oc.parent.runtime(oc.async.then, { value: args, await: p });
          }
        }).catch((err) => {
          if (oc.async.catch && shouldReportToParentComponent && oc.parent) {
            // handle error with --catch:...
            oc.parent.runtime(oc.async.catch, err);
          }
          displayError(
            err.message,
            `Error in Async component. component: ${o.name}`,
            err,
          );
        }).finally(() => {
          if (oc.async.finally && shouldReportToParentComponent && oc.parent) {
            // handle finally with --finally:...
            oc.parent.runtime(oc.async.finally);
          }
        });
    });
  };
  oc.startLifecycle(o.params, o.historyState);
}
/**
 * all the instructions involved in the rendering of the components or dynamic nodes
 */
function renderingProcess(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  // use the jsx renderer only for templates
  setNodes(Onode);
  // set Async context for Async nodes
  if (o.isAsyncNode) {
    setNodeAsyncContext(Onode);
  }
  // use the previous jsx and push the result into ogone.nodes
  // set the dependencies of the node into the component
  if (o.originalNode) setDeps(Onode);

  // set dynamic attributes through o.props
  if (!o.isTemplate && o.nodeProps) {
    setNodeProps(Onode);
  }

  // set the events
  setEvents(Onode);

  // bind classList
  bindClass(Onode);

  // bind style
  bindStyle(Onode);

  // bind value
  bindValue(Onode);

  // bind HTML
  bindHTML(Onode);

  // spread parent Property
  useSpread(Onode);

  // set history state and trigger default code for router
  if (o.type === "router") {
    triggerLoad(Onode);
  }
}
/**
 * this function call the render function of the component if it's only a basic node
 * or of the parent component if it's already a component
 * the component render function will duplicate the element using the user's --for flag
 */
function renderContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc || !o.getContext) return false;
  const length = o.getContext(
    { getLength: true, position: o.position },
  ) as number;
  (o.isTemplate && oc.parent ? oc.parent : oc).render(Onode, {
    callingNewComponent: o.isTemplate,
    length,
  });
  return true;
}
/**
 * for all RouterComponents, this function will force the use of the default modifier.
 * and save a reaction in the component. this reaction will use the functions Ogone.setActualRouterTemplate && Ogone.renderRouter
 */
function triggerLoad(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  const rr = Ogone.routerReactions;
  oc.runtime(0, o.historyState);
  rr.push((path: string) => {
    o.locationPath = path;
    setActualRouterTemplate(Onode);
    renderRouter(Onode);
    return oc.activated;
  });
}
/**
* adds a reaction to the parent component or the component
* to keep up to data the nodes
* renderContext is used for the updates
*/
function setDeps(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  if (!oc) return;
  if (o.originalNode && o.getContext) {
    (Onode.isComponent && oc.parent ? oc.parent : oc).react.push(() =>
      renderContext(Onode)
    );
    renderContext(Onode);
  }
}
function setHMRContext(Onode: HTMLOgoneElement) {
  const o = Onode.ogone, oc = o.component;
  // register to hmr
  if (o.isTemplate && oc && o.uuid) {
    Ogone.instances[o.uuid].push(oc);
  }
  Ogone.mod[Onode.extends].push((pragma: string) => {
    Ogone.render[Onode.extends] = eval(pragma);
    if (!o.nodes) return;
    if (o.isTemplate) {
      return true;
    } else if (oc) {
      const invalidatedNodes = o.nodes.slice();
      const ns = Array.from(o.nodes);
      o.render = Ogone.render[Onode.extends];
      renderingProcess(Onode);
      invalidatedNodes.forEach((n, i) => {
        if (n.ogone) {
          if (i === 0) n.firstNode.replaceWith(...ns);
          destroy(n);
        } else {
          if (i === 0) n.replaceWith(...ns);
          (n as HTMLElement).remove();
        }
      });
      oc.renderTexts(true);
      return true;
    }
  });
}
function routerGo(url: string, state: any) {
  if (Ogone.actualRoute === url) return;
  // protect from infinite loop
  Ogone.actualRoute = url;
  Ogone.routerReactions.forEach((r, i, arr) => {
    if (r && !r(url, state)) delete arr[i];
  });
  history.pushState(state || {}, "", url || "/");
}
