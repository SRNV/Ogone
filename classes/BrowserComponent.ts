// @ts-nocheck
import type { NestedOgoneParameters } from "../types/template.ts";
import type { OgoneBrowser } from "../types/ogone.ts";
import type { BCE } from "../types/component.ts";
import type { OnodeComponent } from "../types/component.ts";
import type { Template } from "../types/template.ts";
declare const Ogone: OgoneBrowser;
declare type TextElements =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;
const getClassComponent = (
  klass: typeof HTMLElement | typeof HTMLTemplateElement,
) =>
  class extends (Ogone.classes.extends(klass)) {
    declare public type: string;
    declare public setActualRouterTemplate: Function;
    declare public renderRouter: Function;
    declare public renderStore: Function;
    declare public renderAsync: Function;
    declare public setNodeAsyncContext: Function;
    declare public triggerLoad: Function;
    constructor() {
      super();
      this.type = "component";
      if (!Ogone.root) {
        let opts = {
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
          uuid: '{{ root.uuid }}',
          extends: '-nt',
        };
        (this as BCE & this).setOgone(opts);
        opts = null;
        Ogone.root = true;
      }
    }
    construct(this: BCE) {
      const o = this.ogone;
      if (!o.type) return;
      this.dependencies = o.dependencies;
      if (o.isTemplate) {
        this.positionInParentComponent = [];
        o.component =
          (new Ogone.components[o.uuid]() as unknown) as OnodeComponent;
        o.component.requirements = o.requirements;
        o.component.dependencies = o.dependencies;
        o.component.type = o.type;
        // define runtime for hmr
        // Ogone.run[o.uuid] = Ogone.run[o.uuid] || [];
      }
      // define templates of hmr
      // Ogone.mod[this.extends] = Ogone.mod[this.extends] || [];
    }
    connectedCallback(this: BCE & this) {
      const o = this.ogone;
      // set position of the template/component
      this.setPosition();

      // set the context of the node
      this.setContext();
      // this.setHMRContext();

      // parse the route that match with location.pathname
      if (o.type === "router") {
        this.setActualRouterTemplate();
      }

      // set the props required by the node
      if (o.isTemplate && o.component) {
        this.setProps();
        o.component.updateProps();
      }
      this.renderingProcess();

      // now ... just render ftw!
      switch (true) {
        case o.type === "router":
          this.renderRouter();
          break;
        case o.type === "store":
          this.renderStore();
          break;
        case o.type === "async":
          this.renderAsync();
          break;
        default:
          this.render();
          break;
      }
    }
    setContext(this: BCE & this) {
      const o = this.ogone, oc = o.component;
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
      } else if (Ogone.contexts[this.extends] && oc) {
        o.getContext = Ogone.contexts[this.extends].bind(oc.data);
      }
      if (o.type === "store" && oc.parent) {
        oc.namespace = this.getAttribute("namespace") || null;
        oc.parent.store[oc.namespace as string] = oc;
      }
    }
    setHMRContext(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      // register to hmr
      if (o.isTemplate && oc) {
        Ogone.run[o.uuid].push(oc);
      }
      Ogone.mod[this.extends].push((pragma: string) => {
        Ogone.render[this.extends] = eval(pragma);
        if (!o.nodes) return;
        if (o.isTemplate) {
          return true;
        } else if (oc) {
          const invalidatedNodes = o.nodes.slice();
          const ns = Array.from(o.nodes);
          o.render = Ogone.render[this.extends];
          this.renderingProcess();
          invalidatedNodes.forEach((n, i) => {
            if ((n as typeof this).ogone) {
              if (i === 0) (n as typeof this).firstNode.replaceWith(...ns);
              (n as typeof this).destroy();
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
    setDevToolContext(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      if (!oc) return;
      const ocp = oc.parent as OnodeComponent;
      const tree = o.tree
        ? o.tree
          .replace(
            "null",
            this.isComponent ? ocp.key as string : oc.key as string,
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
    setNodeProps(this: BCE & this) {
      const o = this.ogone, oc = o.component;
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
    renderingProcess(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      // use the jsx renderer only for templates
      this.setNodes();
      // render DevTools
      // {{ render.devTool }}
      // set Async context for Async nodes
      if (o.isAsyncNode) {
        this.setNodeAsyncContext();
      }
      // use the previous jsx and push the result into ogone.nodes
      // set the dependencies of the node into the component
      if (this.ogone.originalNode) this.setDeps();

      // set dynamic attributes through o.props
      if (!o.isTemplate && o.nodeProps) {
        this.setNodeProps();
      }

      // set the events
      this.setEvents();

      // bind classList
      this.bindClass();

      // bind style
      this.bindStyle();

      // bind value
      this.bindValue();

      // bind HTML
      this.bindHTML();

      // set history state and trigger default code for router
      if (o.type === "router") {
        this.triggerLoad();
      }
    }
    setPosition(this: BCE & this) {
      const o = this.ogone;
      o.position[o.level] = o.index;
    }
    setProps(this: BCE & this) {
      const o = this.ogone, oc = o.component;
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
    setNodes(this: BCE & this) {
      const o = this.ogone, oc = o.component;
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
      // set parentKey to template
      // ogone: {{ nodes.devtool.parentKey }}
    }
    setDeps(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      if (!oc) return;
      if (o.originalNode && o.getContext) {
        (this.isComponent && oc.parent ? oc.parent : oc).react.push(() =>
          this.renderContext()
        );
        this.renderContext();
      }
    }
    renderContext(this: BCE & this | Template) {
      const o = this.ogone, oc = o.component;
      if (!oc || !o.getContext) return;
      const length = o.getContext(
        { getLength: true, position: o.position },
      ) as number;
      (o.isTemplate && oc.parent ? oc.parent : oc).render((this as Template), {
        callingNewComponent: o.isTemplate,
        length,
      });
      return true;
    }
    removeNodes(this: BCE & this): typeof this {
      const o = this.ogone;
      if (!o.nodes) return this;
      /* use it before removing template node */
      function rm(n: any) {
        if ((n as typeof this).ogone) {
          (n as typeof this).destroy();
          (n as typeof this).context.placeholder.remove();
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
      this.ogone.component.activated = false;
      return this;
    }
    destroy(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      if (!oc) return;
      this.context.list.forEach((n) => {
        n.removeNodes<typeof this>().remove();
      });
      this.removeNodes();
      if (o.isTemplate) {
        oc.runtime("destroy");
        oc.activated = false;
      }
      // ogone: {{ destroy.devTool }}
      this.context.placeholder.remove();
      this.remove();
    }
    render(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      if (!oc) return;
      if (o.isTemplate) {
        // update Props before replace the element
        oc.updateProps();
        if (this.childNodes.length) {
          this.renderSlots();
        }
        // replace the element
        if (o.type === "async") {
          this.context.placeholder.replaceWith(...(o.nodes as Node[]));
        } else {
          this.replaceWith(...(o.nodes as Node[]));
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
        if (this.childNodes.length) {
          this.renderSlots();
        }
        oc.renderTexts(true);
        this.replaceWith(...(o.nodes as Node[]));
      }
    }
    renderSlots(this: BCE & this) {
      const o = this.ogone;
      if (!o.nodes) return;
      const slots = Array.from(this.querySelectorAll("[slot]"));
      for (
        let node of o.nodes.filter((n) => (n as HTMLElement).nodeType === 1)
      ) {
        // d for default slots
        const d = (node as HTMLElement).querySelector("slot:not([name])");
        if (d) {
          d.replaceWith(...Array.from(this.childNodes));
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
    setOgone(this: BCE & this, def: NestedOgoneParameters) {
      this.ogone = {
        isRemote: false,
        isRoot: false,
        isImported: false,
        position: [0],
        index: 0,
        level: 0,
        uuid: '{{ root.uuid }}',
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
      // this function generates all the childNodes or the template
      this.ogone.render = Ogone.render[this.extends];
      if (!this.ogone.isTemplate) {
        this.type = `${this.type}-node`;
      }
      this.ogone.type = this.type as NestedOgoneParameters["type"];
      if (this.type === "router" && def.routes) {
        this.ogone.locationPath = location.pathname;
        this.ogone.routes = def.routes;
        this.ogone.routeChanged = true;
        this.ogone.historyState = (() => {
          const url = new URL(location.href);
          // @ts-ignore
          const query = new Map(url.searchParams.entries());
          return { query };
        })();
      }
      this.construct();
    }

    saveUntilRender(this: BCE & this, f: Function): void {
      this.ogone.methodsCandidate.push(f);
    }

    setEvents(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      if (!o.flags || !o.getContext || !oc || !o.nodes) return;
      const position = this.isComponent
        ? oc.positionInParentComponent
        : o.position;
      const c = this.isComponent ? oc.parent : oc;
      for (let node of o.nodes) {
        for (let flag of o.flags.events) {
          if (flag.type === "wheel") {
            /* for wheel events */
            // @ts-ignore
            if (node.ogone) {
              // check if it's an ogone element
              // if it's one
              // node.ogone.nodes can be empty at this moment
              // so we need to save the following function and remove it
              node.saveUntilRender((nr: HTMLElement) => {
                nr.hasWheel = true;
                nr.addEventListener(flag.type, (ev) => {
                  const foundWheel = ev.path.find((n: HTMLElement) =>
                    // @ts-ignore
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
                  // @ts-ignore
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
              node.saveUntilRender((nr: HTMLElement) => {
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
            /*
        } else if (flag.name === 'router-dev-tool' && flag.eval)  { // special for router-dev-tool flag
          node.addEventListener("click", (ev) => {
            Ogone.router.openDevTool();
          });
        */
          } else if (flag.name === "event" && flag.type.startsWith('animation')) {
            if (node.ogone) {
              node.saveUntilRender((nr: HTMLElement) => {
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
              node.saveUntilRender((nr: HTMLElement) => {
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
    bindValue(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      if (!o.flags || !o.flags.bind || !oc || !o.nodes) return;
      function r(n: TextElements, dependency: boolean | string) {
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
        (n as TextElements).addEventListener("keydown", (ev: Event) => {
          const k = o.flags.bind;
          const evl = o.getContext({
            position: o.position,
            getText: k,
          });
          if (evl !== (n as TextElements).value) {
            const ctx = o.getContext({
              position: o.position,
            });
            const values = Object.values(ctx);
            const keys = Object.keys(ctx);
            const fn = new Function(...keys, "n", `this.${k} = n.value;`);
            fn.bind(oc.data)(...values, n);
            oc.update(k, ev);
          }
        });
        (n as TextElements).addEventListener("keyup", (ev: Event) => {
          const k = o.flags.bind;
          const evl = o.getContext({
            position: o.position,
            getText: k,
          });
          if (evl !== (n as TextElements).value) {
            const ctx = o.getContext({
              position: o.position,
            });
            const values = Object.values(ctx);
            const keys = Object.keys(ctx);
            const fn = new Function(...keys, "n", `this.${k} = n.value;`);
            fn.bind(oc.data)(...values, n);
            oc.update(k, ev);
          }
        });
        (n as TextElements).addEventListener("change", (ev: Event) => {
          const k = o.flags.bind;
          const evl = o.getContext({
            position: o.position,
            getText: k,
          });
          if (evl !== (n as TextElements).value) {
            const ctx = o.getContext({
              position: o.position,
            });
            const values = Object.values(ctx);
            const keys = Object.keys(ctx);
            const fn = new Function(...keys, "n", `this.${k} = n.value;`);
            fn.bind(oc.data)(...values, n);
            oc.update(k, ev);
          }
        });
        oc.react.push((dependency: string | boolean) =>
          r((n as TextElements), dependency)
        );
        r((n as TextElements), true);
      }
    }
    bindClass(this: BCE & this) {
      const o = this.ogone, oc = o.component;
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
    bindHTML(this: BCE & this) {
      const o = this.ogone, oc = o.component;
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
    bindStyle(this: BCE & this) {
      const o = this.ogone, oc = o.component;
      if (!o.flags || !o.flags.style || !oc || !o.nodes) return;
      function r(n: HTMLElement) {
        const vl: string | ({ [k: string]: boolean }) = o.getContext({
          position: o.position,
          getText: o.flags.style,
        });
        if (typeof vl === "string") {
          // @ts-ignore
          n.style = vl;
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
    insertElement(
      this: BCE & this,
      p: "beforebegin" | "afterbegin" | "beforeend" | "afterend",
      el: HTMLElement,
    ) {
      if (!this.firstNode) {
        this.insertAdjacentElement(p, el);
        return;
      }
      let target;
      switch (p) {
        case "beforebegin":
          target = this.firstNode;
          break;
        case "afterbegin":
          target = this.firstNode;
          break;
        case "beforeend":
          target = this.lastNode;
          break;
        case "afterend":
          target = this.lastNode;
          break;
      }
      return (!!(target as Template).ogone
        ? ((target as Template).context.list[
          (target as Template).context.list.length - 1
        ]).insertElement(p, el)
        : (target as HTMLElement).insertAdjacentElement(p, el));
    }
  };
export default getClassComponent.toString();
