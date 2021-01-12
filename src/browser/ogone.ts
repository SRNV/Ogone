import { NestedOgoneParameters } from '../types/template.ts';
import { OnodeComponent } from '../types/component.ts';
import Ogone from '../classes/Ogone.ts';

Ogone.setReactivity = function setReactivity(target: Object, updateFunction: Function, parentKey: string = ''): Object {
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
Ogone.displayError = function (this: Ogone, message, errorType, errorObject) {
  // here we render the errors in development
  if (!this.errorPanel) {
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
    }).forEach(([key, value]) => p.style[key] = value);
    this.errorPanel = p;
  }
  this.errors++;
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
  }).forEach(([key, value]) => err.style[key] = value);
  const errorId = this.errors;
  const code = document.createElement("code");
  const stack = document.createElement("code");
  const h = document.createElement("h4");
  // set the text
  h.innerText = `[Ogone] Error ${errorId}: ${errorType ||
    "Undefined Type"}`;
  code.innerText = `${message.trim()}`;
  stack.innerText = `${
    errorObject && errorObject.stack
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
  if (!this.firstErrorPerf) {
    this.firstErrorPerf = performance.now();
  }
  this.errorPanel.style.paddingTop = "30px";
  // set the grid of errors
  err.style.gridArea = `e${errorId}`;
  const m = 2;
  let grid = "";
  let i = 0;
  let a = 0;
  for (i = 0, a = this.errorPanel.childNodes.length + 1; i < a; i++) {
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
  this.errorPanel.style.gridGap = "10px";
  this.errorPanel.style.gridAutoRows = "max-content";
  this.errorPanel.style.gridTemplateRows = "masonry";
  this.errorPanel.style.gridTemplateAreas = newgrid;
  err.style.animationName = "popup";
  err.style.animationIterationCoutn = "1";
  err.style.animationDuration = "0.5s";
  // append elements
  err.append(h, code, stack);
  this.errorPanel.append(err);
  this.errorPanel.style.pointerEvents = "scroll";
  //  append only if it's not in the document
  !this.errorPanel.isConnected
    ? document.body.append(this.errorPanel)
    : [];
};
  Ogone.imp = async function (id, url) {
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
      Ogone.displayError(err.message, "Error in Dynamic Import", {
        message: `
        module's url: ${id}
        `,
      });
    }
  };
  /**
   * Component utils
   */
  Ogone.construct = function (node: any) {
    const o = node.ogone;
    if (!o.type) return;
    node.dependencies = o.dependencies;
    if (o.isTemplate) {
      node.positionInParentComponent = [];
      o.component =
        (new Ogone.components[o.uuid](node) as unknown) as OnodeComponent;
      o.component.requirements = o.requirements;
      o.component.dependencies = o.dependencies;
      o.component.type = o.type;
      // define runtime for hmr
      // Ogone.instances[o.uuid] = Ogone.instances[o.uuid] || [];
    }
    // define templates of hmr
    // Ogone.mod[node.extends] = Ogone.mod[node.extends] || [];
  }
  Ogone.setOgone = function (node: any, def: NestedOgoneParameters) {
    node.ogone = {
      isRemote: false,
      isRoot: false,
      isImported: false,
      position: [0],
      index: 0,
      level: 0,
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
    node.ogone.type = node.type as NestedOgoneParameters["type"];
    if (node.type === "router" && def.routes) {
      node.ogone.locationPath = location.pathname;
      node.ogone.routes = def.routes;
      node.ogone.routeChanged = true;
      node.ogone.historyState = (() => {
        const url = new URL(location.href);
        const query = new Map(url.searchParams.entries());
        return { query };
      })();
    }
    Ogone.construct(node);
  }
  Ogone.setContext = function (Onode: any) {
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
  Ogone.setHMRContext = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    // register to hmr
    if (o.isTemplate && oc) {
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
        Ogone.renderingProcess(Onode);
        invalidatedNodes.forEach((n, i) => {
          if (n.ogone) {
            if (i === 0) n.firstNode.replaceWith(...ns);
            Ogonr.destroy(n);
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
  Ogone.setDevToolContext = function (Onode: any) {
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
  Ogone.setNodeProps = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    if (!o || !oc || !o.nodes || !o.nodeProps) return;
    function r(n: HTMLElement, p: [string, string]) {
      const vl: string | ({ [k: string]: boolean }) = o.getContext({
        position: o.position,
        getText: `(${p[1]})`,
      });
      n.setAttribute(p[0], vl);
      return n.isConnected;
    }
    for (let n of o.nodes) {
      for (let p of o.nodeProps) {
        oc.react.push(() => r(n as HTMLElement, p));
        r(n as HTMLElement, p);
      }
    }
  }
  Ogone.setPosition = function (Onode: any) {
    const o = Onode.ogone;
    o.position[o.level] = o.index;
  }
  Ogone.setProps = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    if (!o || !oc) return;
    if (!o.index) {
      o.index = 0;
    }
    oc.props = o.props;
    if (!o.positionInParentComponent || o.levelInParentComponent !== undefined) {
      oc.positionInParentComponent = o.positionInParentComponent;
      o.positionInParentComponent[
        o.levelInParentComponent
      ] = o.index;
    }
    oc.updateProps();
  }
  Ogone.useSpread = function (Onode: any) {
    const o = Onode.ogone, oc = o.component, op = oc.parent;
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
          for (let n of o.nodes) {
            n.setAttribute(k, value);
          }
        });
        return oc.activated;
      };
      parent = oc.react
    }
    reaction && reaction();
    parent && parent.react.push(reaction);
  }
  Ogone.setNodes = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    if (!oc || !o.render) return;
    if (o.isTemplate) {
      o.nodes = Array.from(
        o.render(oc).childNodes,
      ) as (HTMLTemplateElement | Template | HTMLElement)[];
    } else {
      o.nodes = [o.render(oc, o.position, o.index, o.level)];
    }
    if (o.methodsCandidate && o.methodsCandidate.length) {
      o.methodsCandidate.forEach((f, i, arr) => {
        for (let n of o.nodes) {
          if (n.ogone) {
            n.saveUntilRender(f);
          } else {
            f(n);
          }
        }
        delete arr[i];
      });
    }
  }
  Ogone.setDeps = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    if (!oc) return;
    if (o.originalNode && o.getContext) {
      (Onode.isComponent && oc.parent ? oc.parent : oc).react.push(() =>
        Ogone.renderContext(Onode)
      );
      Ogone.renderContext(Onode);
    }
  }
  Ogone.removeNodes = function (Onode: any) {
    const o = Onode.ogone;
    if (!o.nodes) return Onode;
    /* use it before removing template node */
    function rm(n: any) {
      if (n.ogone) {
        Ogone.destroy(n);
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
    Onode.ogone.component.activated = false;
    return Onode;
  }
  Ogone.destroy = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    if (!oc) return;
    Onode.context.list.forEach((n) => {
      Ogone.removeNodes(n);
      n.remove();
    });
    Ogone.removeNodes(Onode);
    if (o.isTemplate) {
      oc.destroyPluggedWebcomponent();
      oc.runtime("destroy");
      oc.activated = false;
    }
    // ogone: {% destroy.devTool %}
    this.context.placeholder.remove();
    Onode.remove();
  }


  Ogone.saveUntilRender = function (Onode: any, f: Function): void {
    Onode.ogone.methodsCandidate.push(f);
  }

  Ogone.setEvents = function (Onode: any) {
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
            Ogone.saveUntilRender(node, (nr: HTMLElement) => {
              nr.hasWheel = true;
              nr.addEventListener(flag.type, (ev) => {
                const foundWheel = ev.path.find((n: HTMLElement) =>
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
            node.hasWheel = true;
            (node as HTMLElement).addEventListener(flag.type, (ev) => {
              const foundWheel = ev.path.find((n: HTMLElement) =>
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
            Ogone.saveUntilRender(node, (nr: HTMLElement) => {
              nr.addEventListener("click", (ev: MouseEvent) => {
                if (Ogone.router) {
                  Ogone.router.go(
                    o.getContext({
                      getText: `${flag.eval}`,
                      position,
                    }),
                    history.state,
                  );
                }
              });
            });
          } else {
            (node as HTMLElement)
              .addEventListener("click", (ev: MouseEvent) => {
                if (Ogone.router) {
                  Ogone.router.go(
                    o.getContext({
                      getText: `${flag.eval}`,
                      position,
                    }),
                    history.state,
                  );
                }
              });
          }
      } else if (flag.name === 'router-dev-tool' && flag.eval)  { // special for router-dev-tool flag
        node.addEventListener("click", (ev) => {
          Ogone.router.openDevTool();
        });
        } else if (flag.name === "event" && flag.type.startsWith('animation')) {
          if (node.ogone) {
            Ogone.saveUntilRender(node, (nr: HTMLElement) => {
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
            Ogone.saveUntilRender(node, (nr: HTMLElement) => {
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
  Ogone.insertElement = function (
    Onode: any,
    p: "beforebegin" | "afterbegin" | "beforeend" | "afterend",
    el: HTMLElement,
  ) {
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
    return (!!(target as Template).ogone
      ? Ogone.insertElement((target as Template).context.list[
        (target as Template).context.list.length - 1
      ], p, el)
      : (target as HTMLElement).insertAdjacentElement(p, el));
  }

  /**
   * Store Component utils
   */

  /**
   * RouterComponent utils
   */
  Ogone.triggerLoad = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    const rr = Ogone.router.react;
    oc.runtime(0, o.historyState);
    rr.push((path: string) => {
      o.locationPath = path;
      Ogone.setActualRouterTemplate(Onode);
      Ogone.renderRouter(Onode);
      return oc.activated;
    });
  }
  Ogone.routerSearch = function (node, route, locationPath) {
    const o = node.ogone;
    if (typeof locationPath !== "string") return false;
    const { path } = route;
    const splitted = path.toString().split("/");
    const locationSplit = locationPath.split("/");
    const result: { [k: string]: string } = {};
    if (
      !splitted.filter((r) => r.trim().length).length !==
      !locationSplit.filter((r) => r.trim().length).length
    ) {
      return;
    }
    if (splitted.length !== locationSplit.length) return false;
    const error = splitted.find((p, i, arr) => {
      if (!p.startsWith(":")) {
        return locationSplit[i] !== p;
      }
    });
    if (error) return false;
    splitted.forEach((p, i, arr) => {
      if (p.startsWith(":")) {
        const param = p.slice(1, p.length);
        arr[i] = null;
        result[param] = locationSplit[i];
      }
    });
    route.params = result;
    return true;
  }
  Ogone.setActualRouterTemplate = function (node: any) {
    const o = node.ogone, oc = o.component;
    oc.routes = o.routes;
    oc.locationPath = o.locationPath;
    const l = oc.locationPath;
    let rendered = oc.routes.find((r: any) =>
      r.path === l || Ogone.routerSearch(node, r, l) || r.path === 404
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
      const co = document.createElement("template", { is: uuidC });
      o.actualTemplate = co;
      o.actualRoute = rendered.component;
      o.routeChanged = true;
      // don't spread o
      // some props of o can overwritte the template.ogone and create errors in context
      // like undefined data
      let ogoneOpts: any = {
        isTemplate: true,
        isRouter: false,
        isStore: false,
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
      Ogone.setOgone(co, ogoneOpts);
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
   * AsyncComponent utils
   */
  Ogone.setNodeAsyncContext = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
    if (o.flags && o.flags.await) {
      const promise = new Promise((resolve, reject) => {
        if (typeof o.flags.await === "boolean") {
          Onode.firstNode.addEventListener("load", (ev) => {
            resolve(false);
          });
        } else {
          const type = o.getContext({
            getText: o.flags.await,
            position: o.position,
          });
          Onode.firstNode.addEventListener(type, (ev) => {
            resolve(false);
          });
        }
      });
      oc.promises.push(promise);
    }
  }
  Ogone.setAsyncContext = function (Onode: any) {
    const o = Onode.ogone, oc = o.component;
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
   * recycle feature utils
   */
  Ogone.recycleWebComponent = function (Onode: any, opts: {
    injectionStyle: 'append' | 'preprend';
    id: string;
    name: string;
    component: any;
    isSync: boolean;
    extends?: string;
  } = { injectionStyle: 'append' }): boolean {
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
