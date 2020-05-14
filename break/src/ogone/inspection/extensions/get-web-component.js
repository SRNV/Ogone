import Ogone from "../../index.ts";
import allConstructors from "./templating/extensions.js";

export default function getWebComponent(component, node) {
  if (!component) return "";
  const isTemplate = node.tagName === null;
  const isImported = component.imports[node.tagName];
  const isRouter = isTemplate && component.type === "router";
  const extensionId = node.tagName;
  const isExtension = !!allConstructors[node.tagName];
  if (isImported) {
    return "";
  }
  const componentPragma = node.pragma(
    component.uuid,
    true,
    Object.keys(component.imports),
    (tagName) => {
      if (component.imports[tagName]) {
        const newcomponent = Ogone.components.get(component.imports[tagName]);
        return newcomponent.uuid;
      }
      return null;
    },
  );
  const OnodeClassExtension = isTemplate
    ? "HTMLTemplateElement"
    : `${isExtension ? allConstructors[node.tagName] : "HTMLDivElement"}`;
  const OnodeClassId = isTemplate
    ? `${component.uuid}`
    : `${component.uuid}-${node.id}`;
  const componentExtension = `
  Ogone.classes['${OnodeClassId}'] = class extends ${OnodeClassExtension} {
    constructor() {
      super();
      //define dependencies of the node
      this.dependencies = (${JSON.stringify(node.dependencies)});
      this.positionInParentComponent = ${isTemplate} ? [] : null;


      // save external dependencies and required props to component
      // only if it's a template
      if (${isTemplate}) {
        // define component
        const component = new Ogone.components['${component.uuid}']();
        component.requirements = (${
    component.properties ? JSON.stringify(component.properties) : null
  });
        component.dependencies = (${JSON.stringify(node.dependencies)});
        this.component = component;
        this.component.type = '${component.type}';
        this.is();
      }
    }
    // set the modifier object for Ogone features
    is(def = {}) {
      this.ogone = {

        // int[]
        ${isTemplate ? "position: [0]," : ""}

        // int[]
        positionInParentComponent: [0],

        // int
        levelInParentComponent: 0,

        // int
        ${isTemplate ? "index: 0," : ""}

        // int, position[level] = index
        ${isTemplate ? "level: 0," : ""}

        // define component
        ${isTemplate ? "component: this.component," : ""}

        // define parentComponent
        parentComponent: null,

        // jsx function
        render: null,

        // register all nodes of template or custom element
        nodes: [],

        // {}[]
        directives: null,

        // replacer is used for --ifElse directive
        replacer: null,

        // critical function
        getContext: null,

        // set as false by the component, preserves from maximum call stack
        originalNode: true,

        // set unique key
        key: '${node.id}'+\`\${Math.random()}\`,

        // set routes if component is a router
        ${isRouter ? `routes: ${JSON.stringify(component.routes)},` : ""}

        // set the location
        ${isRouter ? `locationPath: location.pathname,` : ""}

        // set the actualTemplate of the router
        ${isRouter ? `actualTemplate: null,` : ""}

        // set state to pass it through the history.state
        ${isRouter ? `historyState: history.state || {},` : ""}

        // overwrite properties
        ...def,
      };
      // use the jsx function and save it into this.ogone.render
      // this function generates all the childNodes or the template
      this.ogone.render = ${
    componentPragma
      .replace(/\n/gi, "")
      .replace(/\s+/gi, " ")
  }
    }
    connectedCallback() {
      // set position of the template/component
      this.setPosition();


      // set the context of the node
      this.setContext();

      // parse the route that match with location.pathname
      ${isRouter ? 'this.setActualRouterTemplate()' : ''}

      // set the props required by the node
      ${isTemplate ? "this.setProps();" : ""}

      // use the jsx renderer only for templates
      this.setNodes();

      // use the previous jsx and push the result into ogone.nodes
      // set the dependencies of the node into the component
      this.setDeps();

      // set the events
      this.setEvents();

      // set the if directive into component
      if (this.ogone.directives) this.setIfDir();

      // set history state and trigger case 'load'
      ${isRouter ? 'this.triggerLoad();' : ''}

      // now ... just render ftw!
      ${isRouter ? 'this.renderRouter();' : 'this.render();'}
    }

    setPosition() {
      this.ogone.position[this.ogone.level] = this.ogone.index;
    }

    setProps() {
      const o = this.ogone
      if (!o.index) {
        o.index = 0;
      }
      o.component.props = o.props;
      o.component.positionInParentComponent = o.positionInParentComponent;
      o.positionInParentComponent[
        o.levelInParentComponent] = o.index;
    }
    setContext() {
      const o = this.ogone;
      const oc = o.component;
      if (${isTemplate}) {
        if (o.parentComponent) {
          oc.parent = o.parentComponent;
          oc.parent.childs.push(oc);
        }
        if (Ogone.contexts[o.parentCTXId]) {
          const gct = Ogone.contexts[o.parentCTXId].bind(o.parentComponent.data);
          oc.parentContext = gct;
          o.getContext = gct;
        }
      } else {
        o.getContext = Ogone.contexts['${component.uuid}-${node.id}'].bind(o.component.data);
      }
    }
    setNodes() {
      const o = this.ogone;
      if (${isTemplate}) {
        o.nodes = o.render(o.component).childNodes;
      } else {
        o.nodes.push(
          o.render(o.component,
            o.position,
            o.index,
            o.level
          ),
        );
      }
    }
    setDeps() {
      const o = this.ogone;
      if (o.originalNode) {
        if (o.getContext) {
          o.component${
    isTemplate ? ".parent" : ""
  }.react.push(() => this.directiveFor());
          this.directiveFor();
        }
      }
    }
    directiveFor() {
      const o = this.ogone;
      const key = o.key;
      const length = o.getContext({ getLength: true });
      o.component${isTemplate ? ".parent" : ""}.render(this, {
        callingNewComponent: ${isTemplate},
        key,
        length,
      });
      return true;
    }

    setEvents() {
      const o = this.ogone;
      if (!o.directives) return;
      o.directives.events.forEach((dir) => {
        for (let node of o.nodes) {
          node.addEventListener(dir.type, (ev) => {
            const oc = o.component;
            const ctx = o.getContext({
              position: ${isTemplate} ?
                oc.positionInParentComponent : o.position,
            });
            oc${isTemplate ? ".parent" : ""}.runtime(dir.case, ctx, ev);
          });
        }
      });
    }
    // WIP
    setIfDir() {
      const o = this.ogone;
      o.replacer = [new Comment()];
      if (o.directives.if) {
        o.directives.replacers = o.nodes;
        o.directives.dfrag = document.createDocumentFragment();
        this.getAllElseDir();
      }
      o.component.react.push(() => this.directiveIf());
    }
    // WIP
    getAllElseDir() {
      const o = this.ogone;
      let nxt = this.nextElementSibling;
      o.directives.ifelseBlock = nxt ? [] : null;
      while(nxt && nxt.directives && (nxt.directives.elseIf || nxt.directives.else)) {
        o.directives.ifelseBlock.push(nxt);
        const elseDir = !!nxt.directives.else;
        nxt = nxt.nextElementSibling;
        if (elseDir && nxt && nxt.directives && (!!nxt.directives.else || !!nxt.directives.elseIf)) {
          throw new Error('[Ogone] else directive has to be the last in if-else-if blocks, no duplicate of --else are allowed.');
        }
      }
      if (o.directives.ifelseBlock) {
          for (let ond of o.directives.ifelseBlock) {
              o.directives.dfrag.append(ond);
          }
      }
    }
    // WIP
    directiveIf() {
      const o = this.ogone;
      const evl = o.directives.if;
      if (!evl) return;
      const c = o.replacer;
      const nd = o.nodes;
      const oc = o.component;
      const v = o.getContext({
        position: o.position,
        getText: evl,
      });
      let nb = null; // Onode that should replace
      const replacers = o.directives.replacers;
      if (!v && o.directives.ifelseBlock) {
        o.directives.ifelseBlock.filter((n) => !n.ogone).forEach((n) => document.body.append(n));
        for (let ond of o.directives.ifelseBlock) {
            o.directives.dfrag.append(ond);
        }
        nb = o.directives.ifelseBlock.find((n) => n.ogone && n.ogone.getContext({
            position: n.ogone.position,
            getText: n.ogone.directives.elseIf || n.ogone.directives.else || false,
        }) || (n.firstNode && n.firstNode.isConnected));
      }
      // nb && !nb.firstNode ? document.body.append(nb) : null;
      const replacer = v ? o.nodes : nb ? nb.ogone.nodes : c;
      if (replacers !== replacer) {
        let replaced = replacers.find((n) => n.isConnected);
        while(replaced) {
            replaced.replaceWith(...replacer);
            replaced = replacers.find((n) => n.isConnected);
        }
        o.directives.replacers = replacer;
      }
      return oc.activated;
    }
    removeNodes() {
      /* use it before removing template node */
      this.ogone.nodes.forEach((n) => n.remove());
      return this;
    }
    triggerLoad() {
      const o = this.ogone;
      const oc = o.component;

      if (history.state === null) {
        history.pushState(o.historyState, '', '');
      }
      oc.runtime('load', history.state);
    }
    setActualRouterTemplate() {
      const o = this.ogone;
      const oc = o.component;

      oc.routes = o.routes;
      oc.locationPath = o.locationPath;
      const l = oc.locationPath;
      const rendered = oc.routes.find((r) => r.path === l) || oc.routes.find((r) => r.path === "/");
      if (rendered) {
        const { component: uuidC } = rendered;
        const co = document.createElement('template', { is: uuidC });
        o.actualTemplate = co;

        // don't spread o
        // some props of o can overwritte the template.ogone and create errors in context
        // like undefined data
        co.is({
          props: o.props,
          parentComponent: o.parentComponent,
          parentCTXId: o.parentCTXId,
          positionInParentComponent: o.positionInParentComponent
            .slice(),
          levelInParentComponent: o.levelInParentComponent,
          index: o.index,
          level: o.level,
          position: o.position,
          directives: o.directives,
        });
      }
    }
    renderRouter() {
      const o = this.ogone;
      const oc = o.component;

      // update Props before replace the element
      oc.updateProps();

      this.replaceWith(o.actualTemplate);
      oc.runtime(o.locationPath, history.state);
    }
    render() {
      const o = this.ogone;
      const oc = o.component;
      if (${isTemplate}) {
        // update Props before replace the element
        oc.updateProps();

        // replace the element
        this.replaceWith(...o.nodes);

        // template/node is already connected
        // ask the component to evaluate the value of the textnodes
        oc.renderTexts(true);

        oc.startLifecycle();

      } else {
        oc.renderTexts(true);
        this.replaceWith(...o.nodes);
        this.directiveIf();
      }
    }
    get firstNode() {
      return this.ogone.nodes[0];
    }
    get lastNode() {
      const o = this.ogone.nodes;
      return o[o.length - 1];
    }
    get name() {
      ${isTemplate ? 'return "template"' : "return this.tagName.toLowerCase();"}
    }
    get extends() {
      ${
    isTemplate
      ? `return '${component.uuid}-nt';`
      : `return '${component.uuid}-${node.id}';`
  }
    }
  }
  customElements.define('${component.uuid}-${
    isTemplate ? "nt" : node.id
  }', Ogone.classes['${component.uuid}${
    isTemplate ? "" : "-" + node.id
  }'], { extends: '${isTemplate ? "template" : extensionId}' });
`;

  return componentExtension;
}
