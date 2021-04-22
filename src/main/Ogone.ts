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
  Node,
  Text,
  SVGElement
} from "../ogone.dom.d.ts";
import { HTMLOgoneElement, OnodeComponentRenderOptions, OgoneParameters, Route, OgoneRecycleOptions, HTMLOgoneText } from "../ogone.main.d.ts";
declare const document: Document;
declare const location: Location;
declare const ROOT_UUID: string;
declare const ROOT_IS_PRIVATE: boolean;
declare const ROOT_IS_PROTECTED: boolean;
declare const _ogone_node_: string;
export class OgoneBaseClass extends HTMLElement {
  declare nodes: OgoneParameters['nodes'];
  declare uuid: OgoneParameters['uuid'];
  declare isTemplate: OgoneParameters['isTemplate'];
  declare component: OgoneParameters['component'];
  declare extends: OgoneParameters['extends'];
  public key = null;
  public data = null;
  public pluggedWebComponentIsSync = false;
  public dependencies = null;
  public state = 0;
  public activated = true;
  public namespace = null;
  public store = {};
  public contexts = {
    for: {},
  };
  // for async context
  public promises = [];
  public resolve = null;
  public async = {
    then: null,
    catch: null,
    finally: null,
  };
  public dispatchAwait = null;
  public promiseResolved = false;
  // events describers
  // this.events = {};
  // all nodes that's are dynamics will save a function into this property
  // like if we have
  //  <node --for="(el, i) of array" />
  // this node will register a function() { ... } that will be triggered each time there is an update
  //this.rerenderAsync = null;
  public react = [];
  public texts = [];
  public childs = [];
  public refs = {};
  public type = "component";
  constructor() {
    super();
    if (!Ogone.root) {
      let opts: OgoneParameters | null = {
        props: null,
        parentCTXId: '',
        dependencies: null,
        requirements: null,
        routes: null,
        isRoot: true,
        isTemplate: true,
        isTemplatePrivate: ROOT_IS_PRIVATE,
        isTemplateProtected: ROOT_IS_PROTECTED,
        isAsync: false,
        isController: false,
        isAsyncNode: false,
        isRouter: false,
        isStore: false,
        isImported: false,
        isRemote: false,
        index: 0,
        level: 0,
        position: [0],
        flags: null,
        isOriginalNode: true,
        uuid: ROOT_UUID,
        extends: '-nt',
      };
      setOgone(this as unknown as HTMLOgoneElement, opts);
      opts = null;
      Ogone.root = true;
    }
  }
  get firstNode() {
    return this.nodes![0];
  }
  get lastNode() {
    return this.nodes![this.nodes!.length - 1];
  }
  get extending(): string {
    return `${this.uuid}${this.extends}`;
  }
  get name() {
    return _ogone_node_;
  }
  set name(v) {

  }
  get isComponent() {
    return this.isTemplate;
  }
  get isRecursiveConnected() {
    return !!(this.nodes?.length && this.firstNode.isConnected && this.lastNode.isConnected);
  }
  get isConnected() {
    if (!this.firstNode) {
      return false;
    }
    return !!this.nodes?.find((n) => n.isConnected);
  }
  get context() {
    const o = this, oc = this.component;
    if (!oc) return;
    if (!oc.contexts.for[o.key!]) {
      oc.contexts.for[o.key!] = {
        list: [this],
        parentNode: (this as unknown as HTMLOgoneElement).parentNode,
        name: _ogone_node_,
      };
    }
    return oc.contexts.for[o.key!];
  }
  connectedCallback(this: HTMLOgoneElement) {
    if (this.isController) {
      this.remove();
      return;
    }
    // set position of the template/component
    setPosition(this);

    // set the context of the node
    setContext(this);

    // parse the route that match with location.pathname
    if (this.type === "router") {
      setActualRouterTemplate(this);
    }

    // set the props required by the node
    if (this.isTemplate) {
      setProps(this);
      OnodeUpdateProps(this);
    }
    renderingProcess(this);

    switch (true) {
      case this.type === "router":
        renderRouter(this);
        break;
      case this.type === "store":
        renderStore(this);
        break;
      case this.type === "async":
        renderAsync(this);
        break;
      default:
        renderNode(this);
        break;
    }
  }
  rerender(this: HTMLOgoneElement) {
    if (this.isRoot) {
      setTimeout(() => {
        Ogone.root = false;
        document.body.innerHTML = '';
        document.body.append(
          document.createElement(_ogone_node_)
        );
      }, 0);
      return;
    }
    if (this.isRouter) {
      this.actualRoute = null;
      setActualRouterTemplate(this);
      renderRouter(this);
      return;
    }
    for (let i = this.context.list.length, a = 0; i > a; i--) {
      destroy(
        this.context.list.pop() as HTMLOgoneElement
      );
    }
    renderContext(this, true);
  }
}
// @ts-ignore it actually exists
window.customElements.define(_ogone_node_, OgoneBaseClass);
// Router implementation
window.addEventListener('popstate', (event: Event) => {
  routerGo(location.pathname, (event as PopStateEvent).state);
});
const mapProxies: Map<unknown, Object> = new Map();
export function setReactivity(target: Object, updateFunction: Function, parentKey: string = ''): Object {
  return new Proxy(target, {
    get(obj: { [k: string]: unknown }, key: string) {
      if (key === 'prototype') {
        return Reflect.get(obj, key);
      }
      const itemProxy = mapProxies.get(obj[key]);
      if (itemProxy) return itemProxy;
      if ((obj[key] instanceof Object
        || Array.isArray(obj[key]))
        && !itemProxy) {
        const id = `${parentKey}.${key.toString()}`.replace(/^[^\w]+/i, '');
        let v = setReactivity(obj[key] as Object, updateFunction, id);
        mapProxies.set(obj[key], v);
        return v;
      }
      return obj[key];
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
export function _ap(p: HTMLElement, n: HTMLElement & HTMLOgoneElement) {
  n.placeholder ? p.append(n, n.placeholder) : p.append(n);
}
export function _h(...a: any[]) {
  // @ts-ignore should fit
  return document.createElement(...a);
}
export function _at(n: Element, a: string, b: string) {
  return n.setAttribute(a, b);
};
/**
 * SVG with namespace
 */
const _svg_ns = 'http://www.w3.org/2000/svg';
const _svg_xlinkNS = 'http://www.w3.org/1999/xlink';
export function _hns(parent: SVGElement | string, ...a: any[]) {
  if (typeof parent === 'string') {
    // @ts-ignore should fit
    return document.createElementNS(_svg_ns, parent);
  } else {
    // @ts-ignore should fit
    return document.createElementNS(parent.namespaceURI, ...a);
  }
}
export function _atns(parent: SVGElement | Element, n: Element | string, a: string, b: string) {
  if (typeof n === 'string') {
    return parent.setAttributeNS(null, n, a);
  } else {
    return (n as Element).setAttributeNS(null, a, b);
  }
};
/**
 * function called right after Ogone.setOgone
 * Ogone.setOgone is called when the customElement is created by document.createElement
 */
export function construct(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (!o.type) return;
  Onode.dependencies = o.dependencies;
  if (Onode.isComponent) {
    const { data, runtime, Refs } = Ogone.components[o.uuid as string](Onode);
    Onode.data = data;
    Onode.component = Onode;
    Onode.runtime = runtime;
    Onode.component.runtime = runtime;
    Onode.component.refs = Refs;
    Onode.requirements = o.requirements;
    Onode.props = o.props;
    Onode.type = Ogone.types[Onode.extending!]!;
  }
}
/**
 * function that will add the ogone parameters into the customElement
 * those parameters are passed right after the creation of the customElement
 * in Ogone.render
 */
export function setOgone(Onode: HTMLOgoneElement, def: OgoneParameters) {
  const params = {
    original: Onode,
    isRemote: false,
    isRoot: false,
    isImported: false,
    position: [0],
    index: 0,
    level: 0,
    // TODO pass the root component inside a template function to fill this field
    // ex: bundle.components.get(entrypoint)
    uuid: '',
    extends: '-nt',
    // int[]
    positionInParentComponent: [0],

    // int
    levelInParentComponent: 0,

    // define component
    component: Onode,

    // define parentComponent
    parentComponent: def.parentComponent,

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
  };
  Object.assign(Onode, params, def);
  // use the jsx function and save it into o.render
  // node function generates all the childNodes or the template
  Onode.renderNodes = Ogone.render[Onode.extending!];
  if (Onode.isRouter) {
    Onode.locationPath = location.pathname;
    Onode.routeChanged = true;
    const url = new URL(location.href);
    // @ts-ignore
    const query = new Map(url.searchParams.entries());
    Onode.historyState = { query };
  }
  construct(Onode);
  if (Ogone.subscribeComponent) Ogone.subscribeComponent(Onode);
}
/**
 * for dynamic attributes of any elements
 */
export function setNodeProps(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
      oc.component.react.push(() => r(n as HTMLElement, p));
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
export function setPosition(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (o.position && typeof o.level === 'number' && typeof o.index === 'number') {
    o.position[o.level as number] = o.index;
  }
}
/**
 * set the props into the component from the OgoneParameters.props
 * OgoneParameters.props is passed during the creation of the node
 */
export function setProps(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
  OnodeUpdateProps(Onode);
}
/**
 * for the flag --spread
 */
export function useSpread(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
        OnodeUpdateService(oc, k, value);
      });
      return Onode.component.activated;
    };
    parent = oc.parent;
  } else if (!o.isTemplate && o.flags && o.flags.spread) {
    reaction = () => {
      const v = o.getContext({
        position: o.position,
        getText: `{${o.flags.spread}}`,
      });
      Object.entries(v).forEach(([k, value]) => {
        if (o.nodes) {
          for (let n of o.nodes) {
            n.setAttribute(k, value as string);
          }
        }
      });
      return Onode.component.activated;
    };
    parent = oc.component
  }
  reaction && reaction();
  parent
    && reaction
    && (parent as unknown as HTMLOgoneElement).react.push(reaction as Function);
}
/**
 * use the dedicated render function inside Ogone.render
 * which returns all the template of the component or the dynamic node
 */
export function setNodes(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (!o.renderNodes) return;
  if (o.isTemplate) {
    o.nodes = Array.from(
      o.renderNodes(Onode.component).childNodes,
    ) as (HTMLOgoneElement & HTMLElement)[];
  } else {
    o.nodes = [o.renderNodes(Onode.component, o.position, o.index, o.level) as HTMLOgoneElement];
  }
  if (o.methodsCandidate && o.methodsCandidate.length) {
    o.methodsCandidate.forEach((f, i, arr) => {
      if (o.nodes) {
        for (let n of o.nodes) {
          if (n.extending) {
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
export function removeNodes(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (!o.nodes) return Onode;
  /* use it before removing template node */
  function rm(n: any) {
    if (n.extending) {
      destroy(n);
      // n.context.placeholder?.remove();
    } else {
      (n as HTMLElement).remove();
    }
  }
  if (o.actualTemplate) {
    rm(o.actualTemplate);
  }
  o.nodes.forEach((n) => {
    rm(n);
  });
  return Onode;
}
/**
 * will destroy the component and use the case 'destroy'
 */
export function destroy(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  if (!oc) return;
  Onode.context.list.forEach((n) => {
    removeNodes(n as HTMLOgoneElement);
    n.remove();
  });
  removeNodes(Onode);
  if (o.isTemplate) {
    OnodeDestroyPluggedWebcomponent(oc);
    oc.component.runtime("destroy");
    o.component.activated = false;
    Onode.component.texts.splice(0);
    Onode.component.react.splice(0);
  }
  // ogone: {% destroy.devTool %}
  Onode.context.list.splice(0);
  Onode.remove();
}
/**
 * adds Listeners on nodes
 */
export function setEvents(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  if (!o.flags || !o.getContext || !oc || !o.nodes) return;
  const position = Onode.isComponent
    ? oc.positionInParentComponent
    : o.position;
  const c = Onode.isComponent ? Onode.parentComponent : oc;
  for (let node of o.nodes) {
    for (let flag of o.flags.events) {
      if (flag.type === "wheel") {
        /* for wheel events */
        if (node.extending) {
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
                    c.component.runtime(flag.case, ctx, ev);
                    break;
                  case filter === "left" && ev.wheelDeltaX > 0:
                    c.component.runtime(flag.case, ctx, ev);
                    break;
                  case filter === "up" && ev.wheelDeltaY > 0:
                    c.component.runtime(flag.case, ctx, ev);
                    break;
                  case filter === "down" && ev.wheelDeltaY < 0:
                    c.component.runtime(flag.case, ctx, ev);
                    break;
                  case filter === null:
                    c.component.runtime(flag.case, ctx, ev);
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
                  c.component.runtime(flag.case, ctx, ev);
                  break;
                case filter === "left" && ev.wheelDeltaX > 0:
                  c.component.runtime(flag.case, ctx, ev);
                  break;
                case filter === "up" && ev.wheelDeltaY > 0:
                  c.component.runtime(flag.case, ctx, ev);
                  break;
                case filter === "down" && ev.wheelDeltaY < 0:
                  c.component.runtime(flag.case, ctx, ev);
                  break;
                case filter === null:
                  c.component.runtime(flag.case, ctx, ev);
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
              c.component.runtime(flag.case, ctx, ev);
              break;
            case ev.key === filter:
              c.component.runtime(flag.case, ctx, ev);
              break;
            case ev.keyCode === filter:
              c.component.runtime(flag.case, ctx, ev);
              break;
            case ev.code.toLowerCase() === filter:
              c.component.runtime(flag.case, ctx, ev);
              break;
            case !filter:
              c.component.runtime(flag.case, ctx, ev);
              break;
          }
        },
      );
      } else if (flag.name === "router-go" && flag.eval) {
        /* special for router-go flag */
        if (node.extending) {
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
        if (node.extending) {
          saveUntilRender(node, (nr: HTMLElement) => {
            nr.addEventListener(flag.type, (ev) => {
              if (flag.eval !== ev.animationName) return;
              const ctx = o.getContext({
                position,
              });
              if (c) {
                c.component.runtime(flag.case, ctx, ev);
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
              c.component.runtime(flag.case, ctx, ev);
            }
          });
        }
      } /* DOM L3 */ else {
        if (node.extending) {
          saveUntilRender(node, (nr: HTMLElement) => {
            nr.addEventListener(flag.type, (ev) => {
              const ctx = o.getContext({
                position,
              });
              if (c) {
                c.component.runtime(flag.case, ctx, ev);
              }
            });
          })
        } else {
          (node as HTMLElement).addEventListener(flag.type, (ev) => {
            const ctx = o.getContext({
              position,
            });
            if (c) {
              c.component.runtime(flag.case, ctx, ev);
            }
          });
        }
      }
    }
  }
}
/**
 * this function is used inside an array.find this is why it returns a boolean.
 * true if the route matches
 */
export function routerSearch(Onode: HTMLOgoneElement, route: Route, locationPath: string) {
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
export function setActualRouterTemplate(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  oc.routes = o.routes;
  oc.locationPath = o.locationPath;
  const l = oc.locationPath;
  let rendered = oc.routes!.find((r: any) =>
    r.path === l || routerSearch(Onode, r, l!) || r.path === 404
  );
  let preservedParams = rendered && rendered.params;
  // redirections
  while (rendered && rendered.redirect) {
    rendered = oc.routes!.find((r: any) => rendered && r.name === rendered.redirect);
    if (rendered) {
      rendered.params = preservedParams;
    }
  }
  if (rendered) {
    o.actualRouteName = rendered.name || null;
  }
  if (!rendered) {
    o.actualTemplate = new Text(' ');
    o.actualRoute = null;
    o.routeChanged = true;
  } else if (
    rendered && !(rendered.once || o.actualRoute === rendered.component)
  ) {
    const co = document.createElement(_ogone_node_) as HTMLOgoneElement;
    o.actualTemplate = co;
    o.actualRoute = rendered.component;
    o.routeChanged = true;
    // don't spread o
    // some props of o can overwritte the template.ogone and create errors in context
    // like undefined data
    let ogoneOpts: OgoneParameters | null = {
      isTemplate: true,
      isTemplatePrivate: rendered.isTemplatePrivate,
      isTemplateProtected: rendered.isTemplateProtected,
      isRouter: rendered.isRouter,
      isStore: false,
      isAsync: rendered.isAsync,
      isAsyncNode: false,
      isController: false,
      placeholder: new Text(' '),
      requirements: o.requirements,
      routes: o.routes,
      isOriginalNode: false,
      dependencies: [],
      extends: "-nt",
      uuid: rendered.uuid,
      tree: o.tree,
      params: rendered.params || null,
      props: o.props,
      parentComponent: o.parentComponent,
      parentCTXId: o.component.parentCTXId,
      positionInParentComponent: o.positionInParentComponent!
        .slice(),
      levelInParentComponent: o.levelInParentComponent,
      index: o.index,
      level: o.level,
      position: o.position,
      flags: o.flags,
      isRoot: false,
      name: rendered.name || rendered.component,
      parentNodeKey: o.key,
      routerCalling: o,
    };
    setOgone(co, ogoneOpts);
    ogoneOpts = null;
    co.isAsync = co.type === 'async';
    co.isRouter = co.type === 'router';
    co.isStore = co.type === 'store';
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
export function setNodeAsyncContext(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (o.flags && o.flags.await) {
    const promise = new Promise((resolve, reject) => {
      try {
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
      } catch (err) {
        reject(err);
      }
    });
    o.component.promises.push(promise);
  }
}
/**
 * set the context when the user uses the flags: then, catch, finally
 * the context is saved into OComponent.async
 */
export function setAsyncContext(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
    oc.component.promises.push(promise);
  }
}
/**
 * returns the new webcomponent, the instance of OComponent will save this webcomponent and synchronize itself with the webcomponent.
 */
export function OnodeRecycleWebComponent(Onode: HTMLOgoneElement, opts: OgoneRecycleOptions): HTMLElement {
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
  OnodePlugWebComponent(Onode, webcomponent, isSync);
  return webcomponent;
}
/**
 * this function saves another function into OgoneParameters of the HTMLOgoneElement
 * ```typescript
 * Onode.ogone.methodsCandidate.push(f);
 * ```
 * the saved function will trigger when everything is ready in the HTMLOgoneElement
 */
export function saveUntilRender(Onode: HTMLOgoneElement, f: Function): void {
  if (Onode.methodsCandidate) {
    Onode.methodsCandidate.push(f);
  }
}
/**
 * for the flag --bind
 */
export function bindValue(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
      typeof dependency === "string" &&
      k.indexOf(dependency as string) > -1 &&
      evl !== undefined && n.value !== evl
    ) {
      n.value = evl;
    }
    return n.isConnected;
  }
  for (let n of o.nodes) {
    function bound() {

    }
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
        fn.bind(oc.component.data)(...values, n);
        OnodeUpdate(oc, k);
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
        fn.bind(oc.component.data)(...values, n);
        OnodeUpdate(oc, k);
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
        fn.bind(oc.component.data)(...values, n);
        OnodeUpdate(oc, k)
      }
    });
    oc.component.react.push((dependency: string | boolean) =>
      r((n as unknown as HTMLInputElement), dependency)
    );
    r((n as unknown as HTMLInputElement), true);
  }
}
/**
 * for the flag --class
 */
export function bindClass(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
    oc.component.react.push(() => r(node as HTMLElement));
    r(node as HTMLElement);
  }
}
/**
 * for the flag --html
 */
export function bindHTML(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
    oc.component.react.push(() => r(node as HTMLElement));
    r(node as HTMLElement);
  }
}
/**
 * for the flag --style
 */
export function bindStyle(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
    oc.component.react.push(() => r(n as HTMLElement));
    r(n as HTMLElement);
  }
}
export function setContext(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (!o.key) return;
  if (o.isTemplate) {
    if (o.parentComponent) {
      o.parent = o.parentComponent;
      o.parent.childs.push(o);
    }
    if (Ogone.contexts[o.component.parentCTXId] && o.parentComponent) {
      const gct = Ogone.contexts[o.component.parentCTXId].bind(
        o.parentComponent.data,
      );
      o.parentContext = gct;
      o.getContext = gct;
    }
  } else if (Ogone.contexts[Onode.extending!] && o && o.component) {
    o.getContext = Ogone.contexts[Onode.extending!].bind(o.component.data);
  }
  if (o.type === "store" && o.parent) {
    o.namespace = Onode.getAttribute("namespace") || undefined;
    o.parent.store[o.namespace as string] = o;
  }
}
export function setDevToolContext(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  if (!oc) return;
  const ocp = oc.parent as HTMLOgoneElement;
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

export function showPanel(panelName: 'infos' | 'error' | 'success' | 'warn', time: number | undefined) {
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
export function infosMessage(opts: { message: string; }) {
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
/**
 * fake slot replacement inside the component
 * // TODO use native slot implementation
 */
export function renderSlots(Onode: HTMLOgoneElement) {
  const o = Onode;
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
export function renderNode(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  if (!Onode) return;
  if (o.isTemplate) {
    // update Props before replace the element
    OnodeUpdateProps(Onode);
    if (o.isTemplatePrivate || o.isTemplateProtected) {
      const shadow = Onode.attachShadow({ mode: o.isTemplatePrivate ? 'closed' : 'open' });
      shadow.append(...(o.nodes as Node[]));
    } else {
      if (Onode.childNodes.length) {
        renderSlots(Onode);
      }
      // replace the element
      if (o.type === "async") {
        Onode.placeholder.replaceWith(...(o.nodes as Node[]), Onode.placeholder);
      } else {
        // HERE maximum callstack: recursive component
        // this occurs if the data is not retrieved
        Onode.replaceWith(...(o.nodes as Node[]));
      }
    }
    // template/node is already connected
    // ask the component to evaluate the value of the textnodes
    OnodeRenderTexts(Onode, true);

    // trigger the init case of the component
    // we can pass the parameters of the router into the ctx
    if (o.type !== "async") {
      OnodeTriggerDefault(oc, {
        router: {
          params: o.params,
          state: history.state,
          path: location.pathname,
        },
      });
    }
  } else {
    if (Onode.childNodes.length) {
      renderSlots(Onode);
    }
    Onode.replaceWith(...(o.nodes as Node[]));
  }
}
/**
 * start the store component's lifeCycle and remove all nodes of the store component
 * ends by removing the HTMLOgoneElement
 * throws if the namespace doesn't match with the namespace inside the store component
 */
export function renderStore(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
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
  OnodeTriggerDefault(oc);
  removeNodes(Onode)
  Onode.remove();
}
/**
 * all the instructions involved in the implementation of the router.
 * this will use a HTMLSectionElement and alays replace it's innerHTML
 */
export function renderRouter(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  if (!oc) return;
  // update Props before replacement of the element
  OnodeUpdateProps(Onode);
  if (!o.replacer) {
    o.replacer = document.createElement('section');
  }
  if (Onode.parentNode) {
    Onode.replaceWith(o.replacer);
  }
  if (o.routeChanged) {
    o.replacer.innerHTML = "";
    o.replacer.append(o.actualTemplate as unknown as Node, (o.actualTemplate! as HTMLOgoneElement).placeholder);
  }
  // run case router:xxx on the router component
  oc.component.runtime(`router:${o.actualRouteName || o.locationPath}`, history.state);
}
/**
 * rendering instructions for the router components inside an async component context
 */
export function renderAsyncRouter(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (!o.nodes) return;
  const filter = (t: any) => t.isComponent && t.isRouter;
  const s = o.nodes.filter(filter) as HTMLOgoneElement[];
  for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
    const arrayOfTemplates = Array.from(n.querySelectorAll(_ogone_node_))
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
export function renderAsyncStores(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (!o.nodes) return;
  const filter = (t: any) => t.isComponent && t.component && t.isStore;
  const asyncStores = o.nodes.filter(filter) as HTMLOgoneElement[];
  for (let n of o.nodes.filter((n) => n.nodeType === 1)) {
    const arrayOfTemplates = Array.from(n.querySelectorAll(_ogone_node_))
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
export function renderAsyncComponent(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  if (!oc || !o || !o.nodes) return;
  const filter = (t: any) => t.isComponent && t.isAsync && t.flags && t.flags.await;
  for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
    const awaitingNodes = Array.from(node.querySelectorAll(_ogone_node_))
      .filter(filter) as HTMLOgoneElement[];
    if (
      node.isComponent && node && node.component && node.component.type === "async"
    ) {
      awaitingNodes.push(node);
    }
    for (let awaitingNode of awaitingNodes) {
      if (awaitingNode.component) {
        // create a custom Event for parent component
        // parent component will wait the event to be dispatched
        const ev = new CustomEvent(`${o.key}:${awaitingNode.key}:resolve`);
        awaitingNode.component.dispatchAwait = () => {
          awaitingNode.dispatchEvent(ev);
        };

        // force rendering of awaiting node
        // TODO revert force async render
        // forceAsyncRender(awaitingNode);

        const promise = new Promise((resolve) => {
          if (awaitingNode && awaitingNode.component.promiseResolved) {
            // if the async child component resolve directly the promise
            resolve(true);
          } else {
            awaitingNode.addEventListener(
              `${o.key}:${awaitingNode.key}:resolve`,
              () => {
                resolve(true);
              },
            );
          }
        });
        oc.component.promises.push(promise);
      }
    }
  }
}
/**
 * rendering instructions for the basic components inside an async component context
 */
export function renderComponent(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (!o.nodes) return;
  const filter = (t: any) => t.component && t.component.type === "component";
  for (let node of o.nodes.filter((n) => n.nodeType === 1)) {
    const components = Array.from(node.querySelectorAll(_ogone_node_))
      .filter(filter) as HTMLOgoneElement[];
    let n = (node as HTMLOgoneElement);
    if (
      n.isComponent && n.extending && n.component && n.component.type === "component"
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
export function renderAsync(Onode: HTMLOgoneElement, shouldReportToParentComponent?: boolean) {
  const o = Onode, oc = Onode;
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
  const placeholder = Onode.placeholder;
  // async placeholder feature
  if (chs.length) {
    // Onode.replaceWith(...chs);
  } else if (!Onode.isTemplatePrivate && !Onode.isTemplateProtected) {
    Onode.replaceWith(placeholder);
  }
  oc.component.resolve = (...args: unknown[]) => {
    return new Promise((resolve) => {
      // we need to delay the execution
      // for --defer flag
      setTimeout(() => {
        // set Async context for Async Components
        setAsyncContext(Onode);
        resolve(true);
      }, 0);
    }).then(() => {
      Promise.all(oc.component.promises)
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
  // here runtime undefined
  OnodeTriggerDefault(oc, o.params, o.historyState);
}
/**
 * all the instructions involved in the rendering of the components or dynamic nodes
 */
export function renderingProcess(Onode: HTMLOgoneElement) {
  const o = Onode;
  // use the jsx renderer only for templates
  // use the previous jsx and push the result into ogone.nodes
  setNodes(Onode);
  // set Async context for Async nodes
  if (o.isAsyncNode) {
    setNodeAsyncContext(Onode);
  }
  // set the dependencies of the node into the component
  if (o.isOriginalNode) setDeps(Onode);

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
export function renderContext(Onode: HTMLOgoneElement, force?: boolean) {
  const o = Onode, oc = Onode;
  if (!force && (!oc || !o.getContext || !o.isOriginalNode)) return false;
  if (!o.getContext) return false;
  const length = o.getContext(
    { getLength: true, position: o.position },
  ) as number;
  OnodeListRendering(Onode, {
    callingNewComponent: o.isTemplate,
    length,
  });
  return true;
}
/**
 * for all RouterComponents, this function will force the use of the default modifier.
 * and save a reaction in the component. this reaction will use the functions Ogone.setActualRouterTemplate && Ogone.renderRouter
 */
export function triggerLoad(Onode: HTMLOgoneElement) {
  const o = Onode, oc = Onode;
  if (!oc) return;
  const rr = Ogone.routerReactions;
  oc.component.runtime(0, o.historyState);
  rr.push((path: string) => {
    o.locationPath = path;
    setActualRouterTemplate(Onode);
    renderRouter(Onode);
    return oc.component.activated;
  });
}
/**
* adds a reaction to the parent component or the component
* to keep up to data the nodes
* renderContext is used for the updates
*/
export function setDeps(Onode: HTMLOgoneElement) {
  const o = Onode;
  if (o.isOriginalNode && o.getContext && o.original) {
    (o.isComponent && o.parentComponent ? o.parentComponent : o.component).react.push(() =>
      renderContext(o)
    );
    renderContext(o);
  }
}
export function routerGo(url: string, state: any) {
  if (Ogone.actualRoute === url) return;
  // protect from infinite loop
  Ogone.actualRoute = url;
  Ogone.routerReactions.forEach((r, i, arr) => {
    if (r && !r(url, state)) delete arr[i];
  });
  history.pushState(state || {}, "", url || "/");
}
export function OnodeTriggerDefault(Onode: HTMLOgoneElement, params?: any, event?: Event | OgoneParameters['historyState']) {
  if (!Onode.component.activated) return;
  if (Onode.type === "store") {
    initStore(Onode);
  }
  OnodeUpdateProps(Onode);
  Onode.component.runtime(0, params, event);
};
export function OnodeUpdate(Onode: HTMLOgoneElement, dependency?: string) {
  if (Onode.type === "store") {
    OnodeUpdateStore(Onode, dependency!);
    return;
  }
  Onode.component.runtime(`update:${dependency}`);
  OnodeReactions(Onode, dependency as string);
  OnodeRenderTexts(Onode, dependency as string);
  Onode.component.childs.filter((c: HTMLOgoneElement) => c.type !== "store").forEach(
    (c: HTMLOgoneElement) => {
      OnodeUpdateProps(c, dependency as string);
    },
  );
};
export function OnodeRenderTexts(Onode: HTMLOgoneElement, dependency: string | true, opts: { parent?: HTMLOgoneElement } = {}) {
  Onode.component.texts.forEach((t: HTMLOgoneText, i: number, arr: HTMLOgoneText[]) => {
    // if there is no update of the texts
    // this can be the reason why
    const { code, position, dependencies, getContext } = t;
    if (dependencies && !dependencies.includes(dependency as string)) return;
    if (Onode.component.activated) {
      if (!getContext) return delete arr[i];
      if (typeof dependency === 'string' && code.indexOf(dependency) < 0) return;
      const v = getContext({
        getText: code,
        position,
      });
      if (t.data !== v) t.data = (v.length ? v : ' ');
    } else {
      delete arr[i];
    }
  });
};
export function OnodeReactions(Onode: HTMLOgoneElement, dependency: string) {
  Onode.component.react.forEach((t: Function, i: number, arr: Function[]) => {
    if (t && !t(dependency)) delete arr[i];
  });
};
export function initStore(Onode: HTMLOgoneElement) {
  if (!Ogone.stores[Onode.namespace as string]) {
    Ogone.stores[Onode.namespace as string] = {
      ...Onode.component.data,
    };
  }
  // save the component's reaction into Ogone.clients with the key of the component
  // and a function
  Ogone.clients.push([Onode.key as string, (namespace, key, overwrite) => {
    const parent = Onode.parentComponent;
    const { data } = Onode.component;
    if (
      namespace === Onode.namespace &&
      data &&
      parent &&
      parent.data
    ) {
      if (!overwrite) {
        data[key] = Ogone.stores[Onode.namespace][key];
      } else {
        Ogone.stores[Onode.namespace][key] = data[key];
      }
      if (parent.data[key] !== data[key]) {
        parent.data[key] = data[key];
        OnodeUpdate(parent, key);
      }
    }
    return Onode.component.activated;
  }]);
};
export function OnodeUpdateStore(Onode: HTMLOgoneElement, dependency: string) {
  // find the reaction of this store module with the key
  // @ts-ignore VSCode error on iterators
  const [key, client] = Ogone.clients.find(([key]) => key === Onode.key);
  if (client) {
    // use the namespace, the dependency or property that should change
    client(Onode.component.namespace, dependency, true);
    // update other modules
    Ogone.clients.filter(([key]) => key !== Onode.key).forEach(
      ([key, f], i, arr) => {
        if (f && !f(Onode.component.namespace as string, dependency, false)) {
          delete arr[i];
        }
      },
    );
  }
};
export function OnodeUpdateService(Onode: HTMLOgoneElement, key: string, value: unknown, force?: boolean) {
  const { data } = Onode.component;
  if (data && value !== data[key] || force && data) {
    const previous = data[key];
    data[key] = value;
    /**
     * for recycle Webcomponent feature
     * pluggedWebComponent is a WebComponent that is used
     * by the end user
     */
    if (Onode.pluggedWebComponentIsSync) {
      if (Onode.pluggedWebComponent && typeof Onode.pluggedWebComponent.beforeUpdate === 'function') {
        Onode.pluggedWebComponent.beforeUpdate(key, data[key], value)
      }
      /**
       * update the webcomponent
       */
      if (Onode.pluggedWebComponent && value !== Onode.pluggedWebComponent[key]) {
        Onode.pluggedWebComponent[key] = value;
      }
    }
    if (Onode.pluggedWebComponent && typeof Onode.pluggedWebComponent.attributeChangedCallback === 'function') {
      Onode.pluggedWebComponent.attributeChangedCallback(key, previous, value);
    }
    OnodeUpdate(Onode, key);
    if (Onode.type === "async") {
      if (!Onode.dependencies) return;
      if (
        key &&
        Onode.dependencies.find((d: string) => d.indexOf(key) > -1)
      ) {
        // let the user rerender
        Onode.component.runtime("async:update", {
          updatedParentProp: key,
        });
      }
    }
  }
};
export function OnodeUpdateProps(Onode: HTMLOgoneElement, dependency?: string) {
  if (!Onode.component.activated) return;
  if (Onode.type === "store") return;
  if (!Onode?.component?.requirements || !Onode.props) return;
  Onode.component.requirements.forEach(([key]: [string, string]) => {
    const prop = Onode.props.find((prop: [string, ...any[]]) =>
      prop[0] === key
    );
    if (!prop) return;
    const value = Onode.parentContext({
      getText: `${prop[1]}`,
      position: Onode.positionInParentComponent,
    });
    OnodeUpdateService(Onode, key, value, !!dependency);
  });
};
/**
* this is used to update the attributes of the webcomponent
* when a prop is updated
*/
export function OnodePlugWebComponent(Onode: HTMLOgoneElement, wc: any, isSync: boolean) {
  Onode.pluggedWebComponent = wc;
  Onode.pluggedWebComponentIsSync = isSync;
};
export function OnodeDestroyPluggedWebcomponent(Onode: HTMLOgoneElement) {
  if (Onode.pluggedWebComponent && typeof Onode.pluggedWebComponent.beforeDestroy === 'function') {
    Onode.pluggedWebComponent.beforeDestroy();
  }
  if (Onode.pluggedWebComponent) {
    Onode.pluggedWebComponent = false;
    Onode.pluggedWebComponentIsSync = false;
  }
};
export function OnodeListRendering(
  Onode: HTMLOgoneElement, /** original node */
  opts: OnodeComponentRenderOptions,
) {
  if (!Onode || !opts) return;
  // Onode is a web component
  // based on the user token
  // this web component is a custom Element
  // at the first call of this function Onode is not "rendered" (replaced by the required element)
  let { callingNewComponent, length: dataLength } = opts;
  typeof dataLength === "object" ? dataLength = 1 : [];
  const context = Onode.context;
  if (!context) return;
  // no need to render if it's the same
  if (context.list.length === dataLength) return;
  // first we to add missing nodes
  for (let i = context.list.length, a = dataLength; i < a; i++) {
    let node: HTMLOgoneElement;
    node = document.createElement(context.name, { is: Onode.extending }) as HTMLOgoneElement;
    let ogoneOpts: Partial<OgoneParameters> | null = {
      type: Onode.type,
      index: i,
      isOriginalNode: false,
      level: Onode.level,
      placeholder: new Text(' '),
      position: Onode.position!.slice(),
      flags: Onode.flags,
      original: Onode,
      isRoot: false,
      name: Onode.name,
      tree: Onode.tree,
      namespace: Onode.namespace,
      isTemplate: Onode.isTemplate,
      isTemplatePrivate: Onode.isTemplatePrivate,
      isTemplateProtected: Onode.isTemplateProtected,
      isImported: Onode.isImported,
      isAsync: Onode.isAsync,
      isAsyncNode: Onode.isAsyncNode,
      isRouter: Onode.isRouter,
      isStore: Onode.isStore,
      isRemote: Onode.isRemote,
      extends: Onode.extends,
      uuid: Onode.uuid,
      routes: Onode.routes,

      parentNodeKey: Onode.parentNodeKey,
    };
    Object.assign(ogoneOpts, (!callingNewComponent ? {
      component: Onode.component,
      nodeProps: Onode.nodeProps,
    } : {
      props: Onode.props,
      dependencies: Onode.dependencies,
      requirements: Onode.requirements,
      params: Onode.params,
      parentComponent: Onode.parentComponent,
      parentCTXId: Onode.parentCTXId,
      positionInParentComponent: Onode.positionInParentComponent ? Onode.positionInParentComponent
        .slice() : [],
      levelInParentComponent: Onode.levelInParentComponent,
    }));
    setOgone(node, ogoneOpts as unknown as OgoneParameters);
    ogoneOpts = null;
    Onode.placeholder.replaceWith(node, Onode.placeholder);
    context.list.push(node);
  }
  // no need to remove if it's the same
  if (context.list.length === dataLength) return;
  // now we remove the extra elements
  for (let i = context.list.length, a = dataLength; i > a; i--) {
    destroy(
      context.list.pop() as HTMLOgoneElement
    );
  }
  return true;
}