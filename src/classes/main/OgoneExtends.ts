import OgoneError, { displayError } from './OgoneError.ts';
import type {
  OgoneRecycleOptions,
  Route,
  HTMLOgoneElement,
  OgoneParameters,
  OnodeComponent
} from '../../ogone.main.d.ts';
import type {
  Location,
  HTMLElement,
  MouseEvent,
  History,
  Document,
  Element,
  Comment as Com,
} from "../../ogone.dom.d.ts";
import { routerGo } from "./OgoneRouter.ts";

declare class Comment extends Com { };
declare const location: Location;
declare const history: History;
declare const document: Document;
export default class OgoneExtends extends OgoneError { }
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

export async function imp(id: string, url: string) {
  if (OgoneExtends.mod[id]) return;
  try {
    if (!url) {
      const mod = await import(id);
      OgoneExtends.mod[id] = mod;
      return mod;
    } else {
      const mod = await import(`/?import=${url}`);
      OgoneExtends.mod[id] = mod;
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
export function construct(node: HTMLOgoneElement) {
  const o = node.ogone;
  if (!o.type) return;
  node.dependencies = o.dependencies;
  if (o.isTemplate) {
    node.positionInParentComponent = [];
    o.component =
      (new OgoneExtends.components[o.uuid as string]() as unknown) as OnodeComponent;
    o.component!.requirements = o.requirements;
    o.component!.dependencies = o.dependencies;
    o.component!.type = o.type;
    // define runtime for hmr
    // OgoneExtends.instances[o.uuid] = OgoneExtends.instances[o.uuid] || [];
  }
  // define templates of hmr
  // OgoneExtends.mod[node.extends] = OgoneExtends.mod[node.extends] || [];
}
/**
 * function that will add the ogone parameters into the customElement
 * those parameters are passed right after the creation of the customElement
 * in Ogone.render
 */
export function setOgone(node: HTMLOgoneElement, def: OgoneParameters) {
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
  node.ogone.render = OgoneExtends.render[node.extends];
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
export function setNodeProps(Onode: HTMLOgoneElement) {
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
export function setPosition(Onode: HTMLOgoneElement) {
  const o = Onode.ogone;
  if (o.position && typeof o.level === 'number' && typeof o.index === 'number') {
    o.position[o.level as number] = o.index;
  }
}
/**
 * set the props into the component from the OgoneParameters.props
 * OgoneParameters.props is passed during the creation of the node
 */
export function setProps(Onode: HTMLOgoneElement) {
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
export function useSpread(Onode: HTMLOgoneElement) {
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
export function setNodes(Onode: HTMLOgoneElement) {
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
export function removeNodes(Onode: HTMLOgoneElement) {
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
export function destroy(Onode: HTMLOgoneElement) {
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
export function setEvents(Onode: HTMLOgoneElement) {
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
          if (OgoneExtends.router.openDevTool) {
            OgoneExtends.router.openDevTool({});
          }
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
export function insertElement(
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
 * used inside a reaction, this will create a new component each time the route is updated, via Ogone.routerGo(...)
 */
export function setActualRouterTemplate(node: any) {
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
export function setNodeAsyncContext(Onode: HTMLOgoneElement) {
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
export function setAsyncContext(Onode: HTMLOgoneElement) {
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
export function recycleWebComponent(Onode: HTMLOgoneElement, opts: OgoneRecycleOptions): HTMLElement {
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
export function saveUntilRender(Onode: HTMLOgoneElement, f: Function): void {
  if (Onode.ogone.methodsCandidate) {
    Onode.ogone.methodsCandidate.push(f);
  }
}