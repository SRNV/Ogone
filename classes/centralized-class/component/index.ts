// @ts-nocheck
import { NestedOgoneParameters } from '../../../types/template.ts';
const getClassComponent = (klass) => class extends (Ogone.classes.extends(klass)) {
  constructor() {
    super();
    if (!Ogone.root) {
      this.setOgone({ isRoot: true, isTemplate: true });
      Ogone.root = this;
    }
    this.type = "component";
  }
  construct() {
    const o = this.ogone;
    this.dependencies = o.dependencies;
    if (o.isTemplate) {
      this.positionInParentComponent = [];
      o.component = new Ogone.components[o.uuid]();
      o.component.requirements = o.requirements;
      o.component.dependencies = o.dependencies;
      o.component.type = o.type;
      // define runtime for hmr
      // Ogone.run[o.uuid] = Ogone.run[o.uuid] || [];
    }
    // define templates of hmr
    // Ogone.mod[this.extends] = Ogone.mod[this.extends] || [];
  }
  connectedCallback (){
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
    if (o.isTemplate) {
      this.setProps();
      o.component.updateProps();
    }
    this.renderingProcess();

    // now ... just render ftw!
    switch(true) {
      case o.type === "router": this.renderRouter(); break;
      case o.type === "store": this.renderStore(); break;
      case o.type === "async": this.renderAsync(); break;
      default: this.render(); break;
    }
  }
  setContext() {
    const o = this.ogone, oc = o.component;
    if (o.isTemplate) /*infinite loop*/ {
      oc.key = o.key;
      oc.dependencies = o.dependencies;
      if (o.parentComponent) {
        oc.parent = o.parentComponent;
        oc.parent.childs.push(oc);
      }
      if (Ogone.contexts[o.parentCTXId]) /*infinite loop*/ {
        const gct = Ogone.contexts[o.parentCTXId].bind(o.parentComponent.data);
        oc.parentContext = gct;
        o.getContext = gct;
      }
    } else if (Ogone.contexts[this.extends]) {
      o.getContext = Ogone.contexts[this.extends].bind(o.component.data);
    }
    if (o.type === "store") {
      oc.namespace = this.getAttribute('namespace') || null;
      oc.parent.store[oc.namespace] = oc;
    }
  };
  setHMRContext() {
    const o = this.ogone, oc = o.component;
    // register to hmr
    if (o.isTemplate) {
      Ogone.run[o.uuid].push(oc);
    }
    Ogone.mod[this.extends].push((pragma) => {
      Ogone.render[this.extends] = eval(pragma);
      if (o.isTemplate) {
        return true;
      } else {
        o.render = Ogone.render[this.extends];
        const invalidatedNodes = o.nodes.slice();
        this.renderingProcess();
        invalidatedNodes.forEach((n, i) => {
          if (n.ogone) {
            if (i === 0) n.firstNode.replaceWith(...o.nodes);
            n.destroy();
          } else {
            if (i === 0) n.replaceWith(...o.nodes);
            n.remove();
          }
        });
        oc.renderTexts(true);
        return true;
      }
    });
  }
  setDevToolContext() {
    const o = this.ogone, oc = o.component;
    const ocp = oc.parent;
    const tree = o.tree ? o.tree
      .replace('null', this.isComponent ? ocp.key : oc.key)
      .split('>') : [o.key];
    Ogone.ComponentCollectionManager.read({
      tree,
      key: o.key,
      parentNodeKey: o.parentNodeKey,
      name: o.name || tree[tree.length - 1],
      ctx: oc,
      isRoot: o.isRoot,
      parentCTX: ocp,
      type: o.isTemplate ? o.isRoot ? 'root' : oc.type : "element",
    });
  };
  renderingProcess() {
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

    // set the events
    this.setEvents();

    // bind classList
    this.bindClass();

    // bind style
    this.bindStyle();

    // bind value
    this.bindValue();

    // set history state and trigger default code for router
    if (o.type === "router") {
      this.triggerLoad();
    }
  };
  setPosition() {
    const o = this.ogone, oc = o.component;
    o.position[o.level] = o.index;
  };
  setProps() {
    const o = this.ogone, oc = o.component;
    if (!o.index) {
      o.index = 0;
    }
    o.component.props = o.props;
    o.component.positionInParentComponent = o.positionInParentComponent;
    o.positionInParentComponent[
      o.levelInParentComponent] = o.index;
    o.component.updateProps();
  };
  setNodes() {
    const o = this.ogone, oc = o.component;
    if (o.isTemplate) {
      o.nodes = Array.from(o.render(o.component).childNodes);
    } else {
      o.nodes = [o.render(o.component, o.position, o.index, o.level)];
    }
    // set parentKey to template
    // ogone: {{ nodes.devtool.parentKey }}
  };
  setDeps() {
    const o = this.ogone, oc = o.component;
    if (o.originalNode && o.getContext) {
      (this.isComponent ? o.component.parent : o.component).react.push(() => this.renderContext());
      this.renderContext();
    }
  };
  renderContext() {
    const o = this.ogone, oc = o.component;
    const key = o.key;
    const length = o.getContext({ getLength: true, position: o.position });
    (o.isTemplate ? o.component.parent : o.component).render(this, {
      callingNewComponent: o.isTemplate,
      key,
      length,
    });
    return true;
  };
  removeNodes() {
    const o = this.ogone, oc = o.component;
    /* use it before removing template node */
    if (o.actualTemplate) {
      o.actualTemplate.forEach((n) => {
        if (n.ogone) {
          n.destroy();
        } else {
          n.remove();
        }
      })
    }
    o.nodes.forEach((n) => {
      if (n.ogone) {
        n.destroy();
      } else {
        n.remove();
      }
    });
    return this;
  };
  destroy() {
    const o = this.ogone, oc = o.component;
    this.context.list.forEach((n) => {
      n.removeNodes().remove();
    });
    this.removeNodes();
    if (o.isTemplate) {
      o.component.runtime('destroy');
      o.component.activated = false;
    }
    // ogone: {{ destroy.devTool }}
    this.remove();
  };
  render() {
    const o = this.ogone, oc = o.component;
    if (o.isTemplate) {
      // update Props before replace the element
      oc.updateProps();
      if (this.childNodes.length) {
        this.renderSlots();
      }
      // replace the element
      if (o.type === "async") {
        this.context.placeholder.replaceWith(...o.nodes);
      } else {
        this.replaceWith(...o.nodes);
      }
      // template/node is already connected
      // ask the component to evaluate the value of the textnodes
      oc.renderTexts(true);

      // trigger the init case of the component
      // we can pass the parameters of the router into the ctx
      if (o.type !== "async") {
        oc.startLifecycle(o.params, o.historyState);
      }
    } else if (oc) {
      if (this.childNodes.length) {
        this.renderSlots();
      }
      oc.renderTexts(true);
      this.replaceWith(...o.nodes);
    }
  };
  renderSlots() {
    const o = this.ogone, oc = o.component;
    const slots = this.querySelectorAll('[slot]');
    for (let node of o.nodes.filter(n => n.nodeType === 1)) {
      // d for default slots
      const d = node.querySelector('slot:not([name])');
      if (d) {
        d.replaceWith(...this.childNodes);
      }
    }
    for (let slotted of slots) {
      // sn for slotName
      const sn = slotted.getAttribute('slot');
      for (let n of o.nodes) {
        const s = n.querySelector(`slot[name="${sn}"]`);
        if (s) {
          slotted.removeAttribute('slot');
          s.replaceWith(slotted);
        }
      }
    }
  };
  setOgone(def: NestedOgoneParameters = {}) {
    this.ogone = {
      // int[]
      position: [0],

      // int[]
      positionInParentComponent: [0],

      // int
      levelInParentComponent: 0,

      // int
      index: 0,

      // int, position[level] = index
      level: 0,

      // define component
      component: null,

      // get from router the parameters
      params: null,

      // define parentComponent
      parentComponent: null,

      // jsx function
      render: null,

      // register all nodes of template or custom element
      nodes: [],

      // {}[]
      flags: null,

      // replacer is used for --ifElse flag
      replacer: null,

      // critical function
      getContext: null,

      // set as false by the component, preserves from maximum call stack
      originalNode: true,

      // promise for await flag
      promise: null,
      dependencies: [],

      // set unique key
      key: 'n' + `${Math.random()}`,

      // set routes if component is a router
      routes: null,

      // set the location
      locationPath: null,

      // set the actualTemplate of the router
      actualTemplate: null,

      // save the route
      actualRouteName: null,
      actualRoute: null,

      // whenever the route change
      routeChanged: null,

      // set state to pass it through the history.state
      historyState: null,
      uuid: '{{ root.uuid }}',
      extends: '-nt',
      // overwrite properties
      ...def,
    };
    // use the jsx function and save it into o.render
    // this function generates all the childNodes or the template
    this.ogone.render = Ogone.render[this.extends];
    if (!this.ogone.isTemplate) {
      this.type = `${this.type}-node`;
    }
    this.ogone.type = this.type;
    if (this.type === "router") {
      this.ogone.locationPath = location.pathname;
      this.ogone.routes = def.routes;
      this.ogone.routeChanged = true;
      this.ogone.historyState = {
        ...(() => {
          const url = new URL(location.href);
          const query = new Map(url.searchParams.entries());
          return { query }
        })(),
      };
    }
    this.construct();
  };
  setEvents() {
    const o = this.ogone, oc = o.component;
    if (!o.flags) return;
    const position = this.isComponent ? oc.positionInParentComponent : o.position;
    const c = this.isComponent ? oc.parent : oc;
    for (let node of o.nodes) {
      for (let flag of o.flags.events) {
        if (flag.type === 'wheel') /* for wheel events */ {
          node.hasWheel = true;
          node.addEventListener(flag.type, (ev) => {
            const foundWheel = ev.path.find(n => n && n.hasWheel);
            if (foundWheel && !foundWheel.isSameNode(node)) return;
            const filter = o.getContext({
              getText: `${flag.filter}`,
              position,
            });
            const ctx = o.getContext({
              position,
            });
            switch (true) {
              case filter === 'right' && ev.wheelDeltaX < 0:
                c.runtime(flag.case, ctx, ev);
                break;
              case filter === 'left' && ev.wheelDeltaX > 0:
                c.runtime(flag.case, ctx, ev);
                break;
              case filter === 'up' && ev.wheelDeltaY > 0:
                c.runtime(flag.case, ctx, ev);
                break;
              case filter === 'down' && ev.wheelDeltaY < 0:
                c.runtime(flag.case, ctx, ev);
                break;
              case filter === null:
                c.runtime(flag.case, ctx, ev);
                break;
            }
          });
        } else if (flag.type.startsWith("key")) /* all keyboard event */ {
          document.addEventListener(flag.type, (ev) => {
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
          });
        } else if (flag.name === 'router-go' && flag.eval) /* special for router-go flag */ {
          node.addEventListener("click", (ev) => {
            Ogone.router.go(
              o.getContext({
                getText: `${flag.eval}`,
                position,
              }), history.state);
          });
          /*
        } else if (flag.name === 'router-dev-tool' && flag.eval)  { // special for router-dev-tool flag
          node.addEventListener("click", (ev) => {
            Ogone.router.openDevTool();
          });
        */
        } else /* DOM L3 */ {
          node.addEventListener(flag.type, (ev) => {
            const ctx = o.getContext({
              position,
            });
            c.runtime(flag.case, ctx, ev);
          });
        }
      }
    }
  }
  bindValue() {
    const o = this.ogone, oc = o.component;
    if (!o.flags || !o.flags.bind) return;
    function r(n, dependency) {
      const k = o.flags.bind;
      const evl = o.getContext({
        position: o.position,
        getText: k,
      });
      if (dependency === true) {
        // force binding
        n.value = evl;
      }
      if (typeof k === 'string'
        && k.indexOf(dependency) > -1
        && evl !== undefined && n.value !== evl) {
        n.value = evl;
      }
      return n.isConnected;
    }
    for (let n of o.nodes) {
      n.addEventListener('keydown', (ev) => {
        const k = o.flags.bind;
        const evl = o.getContext({
          position: o.position,
          getText: k,
        });
        if (evl !== n.value) {
          const ctx = o.getContext({
            position: o.position,
          });
          const values = Object.values(ctx);
          const keys = Object.keys(ctx);
          const fn = new Function(...keys, 'n', `this.${k} = n.value;`)
          fn.bind(oc.data)(...values, n);
          oc.update(k, ev);
        }
      });
      n.addEventListener('keyup', (ev) => {
        const k = o.flags.bind;
        const evl = o.getContext({
          position: o.position,
          getText: k,
        });
        if (evl !== n.value) {
          const ctx = o.getContext({
            position: o.position,
          });
          const values = Object.values(ctx);
          const keys = Object.keys(ctx);
          const fn = new Function(...keys, 'n', `this.${k} = n.value;`)
          fn.bind(oc.data)(...values, n);
          oc.update(k, ev);
        }
      });
      n.addEventListener('change', (ev) => {
        const k = o.flags.bind;
        const evl = o.getContext({
          position: o.position,
          getText: k,
        });
        if (evl !== n.value) {
          const ctx = o.getContext({
            position: o.position,
          });
          const values = Object.values(ctx);
          const keys = Object.keys(ctx);
          const fn = new Function(...keys, 'n', `this.${k} = n.value;`)
          fn.bind(oc.data)(...values, n);
          oc.update(k, ev);
        }
      });
      oc.react.push((dependency) => r(n, dependency));
      r(n, true);
    }
  };
  bindClass() {
    const o = this.ogone, oc = o.component;
    if (!o.flags || !o.flags.class) return;
    function r(n) {
      const vl = o.getContext({
        position: o.position,
        getText: (o.flags.class),
      });
      if (typeof vl === 'string') {
        n.classList.value = vl;
      } else if (typeof vl === 'object') {
        const keys = Object.keys(vl);
        n.classList.add(...keys.filter((key) => vl[key]));
        n.classList.remove(...keys.filter((key) => !vl[key]));
      } else if (Array.isArray(vl)) {
        n.classList.value = vl.join(' ');
      }
      return n.isConnected;
    }
    for (let node of o.nodes) {
      oc.react.push(() => r(node));
      r(node);
    }
  };
  bindStyle(value) {
    const o = this.ogone, oc = o.component;
    if (!o.flags || !o.flags.style) return;
    function r(n) {
      const vl = o.getContext({
        position: o.position,
        getText: o.flags.style,
      });
      if (typeof vl === 'string') {
        n.style = vl;
      } else if (typeof vl === 'object') {
        Object.entries(vl).forEach(([k, v]) => n.style[k] = v);
      }
      return n.isConnected;
    }
    for (let n of o.nodes) {
      oc.react.push(() => r(n));
      r(n);
    }
  }
  insertElement(p, el) {
    const o = this.ogone, oc = o.component;
    if (!this.firstNode) {
      this.insertAdjacentElement(p, el);
      return;
    }
    let target;
    switch (p) {
      case 'beforebegin':
        target = this.firstNode;
        break;
      case 'afterbegin':
        target = this.firstNode;
        break;
      case 'beforeend':
        target = this.lastNode;
        break;
      case 'afterend':
        target = this.lastNode;
        break;
    }
    return (!!target.ogone ?
      (target.context.list[
        target.context.list.length - 1
      ]).insertElement(p, el) :
      target.insertAdjacentElement(p, el));
  }
};
export default getClassComponent.toString();