import Ogone from "../../index.ts";
import allConstructors from "./templating/extensions.js";

export default function getWebComponent(component, node) {
  if (!component) return "";
  const isTemplate = node.tagName === null;
  const isDynamic = node.hasDirective && node.tagName;
  const isImported = component.imports[node.tagName];
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
        this.setModifier();
      }
      console.warn(this);
    }
    // set the modifier object for Ogone features
    setModifier(def = {}) {
      this.ogone = {

        // int[]
        position: ${isTemplate} ? [0] : null,

        // int[]
        positionInParentComponent: [0],

        // int
        levelInParentComponent: 0,

        // int
        index: ${isTemplate} ? 0 : null,

        // int, position[level] = index
        level: ${isTemplate} ? 0 : null,

        // define component
        component: ${isTemplate} ? this.component : null,

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

        // overwrite properties
        ...def,
      };

      // use the jsx function and save it into prop
      this.ogone.render = ${componentPragma}
    }
    connectedCallback() {
      // set position of the template/component
      this.setPosition();

      // set the props required by the node
      if (${isTemplate}) this.setProps();

      // set the context of the node
      this.setContext();

      // use the jsx renderer only for templates
      this.setNodes();

      // use the previous jsx and push the result into ogone.nodes
      // set the dependencies of the node into the component
      this.setDeps();

      // set the events
      this.setEvents();

      // set the if directive into component
      if (this.ogone.directives) this.setIfDir();

      // now ... just render ftw!
      this.render();
    }

    setPosition() {
      console.warn(this.ogone)
      this.ogone.position[this.ogone.level] = this.ogone.index;
    }

    setProps() {
      if (!this.ogone.index) {
        this.ogone.index = 0;
      }
      this.ogone.positionInParentComponent[
        this.ogone.levelInParentComponent] = this.ogone.index;
    }
    setContext() {
      const oc = this.ogone.component;
      if (${isTemplate}) {
        if (this.ogone.parentComponent) {
          oc.parent = this.ogone.parentComponent;
          oc.parent.childs.push(oc);
        }
        if (Ogone.contexts[this.ogone.parentCTXId]) {
          const gct = Ogone.contexts[this.ogone.parentCTXId].bind(this.ogone.parentComponent.data);
          oc.parentContext = gct;
          this.ogone.getContext = gct;
        }
      } else {
        this.ogone.getContext = Ogone.contexts['${component.uuid}-${node.id}'].bind(this.ogone.component.data);
      }
    }
    setNodes() {
      if (${isTemplate}) {
        this.ogone.nodes = Array.from(this.ogone.render(this.ogone.component).childNodes);
      } else {
        this.ogone.nodes.push(
          this.ogone.render(this.ogone.component,
            this.ogone.position,
            this.ogone.index,
            this.ogone.level
          ),
        );
      }
    }
    setDeps() {
      if (this.ogone.originalNode) {
        if (this.ogone.getContext) {
          this.ogone.component${
    isTemplate ? ".parent" : ""
  }.react.push(() => this.directiveFor());
          this.directiveFor();
        }
      }
    }
    directiveFor() {
      const key = this.ogone.key;
      const length = this.ogone.getContext({ getLength: true });
      this.ogone.component${isTemplate ? ".parent" : ""}.render(this, {
        callingNewComponent: ${isTemplate},
        key,
        length,
      });
      return true;
    }

    setEvents() {
      if (!this.ogone.directives) return;
      this.ogone.directives.events.forEach((dir) => {
        for (let node of this.ogone.nodes) {
          node.addEventListener(dir.type, (ev) => {
            const oc = this.ogone.component;
            const ctx = this.ogone.getContext({
              position: ${isTemplate} ?
                oc.positionInParentComponent : this.ogone.position,
            });
            oc${isTemplate ? ".parent" : ""}.runtime(dir.case, ctx, ev);
          });
        }
      });
    }
    // WIP
    setIfDir() {
      this.ogone.replacer = [new Comment()];
      if (this.ogone.directives.if) {
        this.ogone.directives.replacers = this.ogone.nodes;
        this.ogone.directives.dfrag = document.createDocumentFragment();
        this.getAllElseDir();
      }
      this.ogone.component.react.push(() => this.directiveIf());
    }
    // WIP
    getAllElseDir() {
      let nxt = this.nextElementSibling;
      this.ogone.directives.ifelseBlock = nxt ? [] : null;
      while(nxt && nxt.directives && (nxt.directives.elseIf || nxt.directives.else)) {
        this.ogone.directives.ifelseBlock.push(nxt);
        const elseDir = !!nxt.directives.else;
        nxt = nxt.nextElementSibling;
        if (elseDir && nxt && nxt.directives && (!!nxt.directives.else || !!nxt.directives.elseIf)) {
          throw new Error('[Ogone] else directive has to be the last in if-else-if blocks, no duplicate of --else are allowed.');
        }
      }
      if (this.ogone.directives.ifelseBlock) {
          for (let ond of this.ogone.directives.ifelseBlock) {
              this.ogone.directives.dfrag.append(ond);
          }
      }
    }
    // WIP
    directiveIf() {
      const evl = this.ogone.directives.if;
      if (!evl) return;
      const c = this.ogone.replacer;
      const nd = this.ogone.nodes;
      const oc = this.ogone.component;
      const v = this.ogone.getContext({
        position: this.ogone.position,
        getText: evl,
      });
      let nb = null; // Onode that should replace
      const replacers = this.ogone.directives.replacers;
      if (!v && this.ogone.directives.ifelseBlock) {
        this.ogone.directives.ifelseBlock.filter((n) => !n.ogone).forEach((n) => document.body.append(n));
        for (let ond of this.ogone.directives.ifelseBlock) {
            this.ogone.directives.dfrag.append(ond);
        }
        nb = this.ogone.directives.ifelseBlock.find((n) => n.ogone && n.ogone.getContext({
            position: n.ogone.position,
            getText: n.ogone.directives.elseIf || n.ogone.directives.else || false,
        }) || (n.firstNode && n.firstNode.isConnected));
      }
      // nb && !nb.firstNode ? document.body.append(nb) : null;
      const replacer = v ? this.ogone.nodes : nb ? nb.ogone.nodes : c;
      if (replacers !== replacer) {
        let replaced = replacers.find((n) => n.isConnected);
        while(replaced) {
            replaced.replaceWith(...replacer);
            replaced = replacers.find((n) => n.isConnected);
        }
        this.ogone.directives.replacers = replacer;
      }
      return oc.activated;
    }
    removeNodes() {
      /* use it before removing template node */
      this.ogone.nodes.forEach((n) => n.remove());
      return this;
    }
    render() {
      const oc = this.ogone.component;
      if (${isTemplate}) {
        // update Props before replace the element
        oc.updateProps();

        // replace the element
        this.replaceWith(...this.ogone.nodes);

        // template/node is already connected
        // ask the component to evaluate the value of the textnodes
        oc.renderTexts(true);

        oc.startLifecycle();

      } else {
        oc.renderTexts(true);
        this.replaceWith(...this.ogone.nodes);
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
      if (${isTemplate}) return 'template';
      return this.tagName.toLowerCase();
    }
    get extends() {
      if (${isTemplate}) return '${component.uuid}-nt';
      return '${component.uuid}-${node.id}';
    }
  }
  if (${isTemplate}) {
    customElements.define('${component.uuid}-nt', Ogone.classes['${component.uuid}'], { extends: 'template' });
  } else {
    customElements.define('${component.uuid}-${node.id}', Ogone.classes['${component.uuid}-${node.id}'], { extends: '${extensionId}' });
  }`;

  return componentExtension;
}
