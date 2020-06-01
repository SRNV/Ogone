import Ogone from "../../index.ts";
import allConstructors from "./templating/extensions.js";
import setEventsMethod from "./methods/setEvents.ts";
import bindStyleMethod from "./methods/bindStyle.ts";
import bindClassMethod from "./methods/bindClass.ts";
import routerMethods from "./methods/router.ts";
import storeMethods from "./methods/store.ts";
import slotsMethods from "./methods/slots.ts";
import asyncMethods from "./methods/async.ts";
import utilsMethods from "./methods/utils.ts";
import constructorMethods from "./methods/constructor.ts";
import setOgoneMethod from "./methods/ogone.ts";

export default function getWebComponent(component, node) {
  if (!component) return "";
  const isTemplate = node.tagName === null;
  const isImported = component.imports[node.tagName];
  const isRouter = isTemplate && component.type === "router";
  const isStore = isTemplate && component.type === "store";
  const isAsync = isTemplate && component.type === "async";
  const isAsyncNode = !isTemplate && !isImported && node.directives &&
    node.directives.await;
  const extensionId = node.tagName;
  const isExtension = !!allConstructors[node.tagName];
  const opts = {
    isTemplate,
    isAsync,
    isRouter,
    isStore,
    isAsyncNode,
    isImported,
    isExtension,
  };
  // no definition for imported component
  if (isImported) {
    return "";
  }
  const OnodeClassExtension = isTemplate
    ? "HTMLTemplateElement"
    : `${isExtension ? allConstructors[node.tagName] : "HTMLDivElement"}`;
  const OnodeClassId = isTemplate
    ? `${component.uuid}`
    : `${component.uuid}-${node.id}`;
  const componentExtension = `
  Ogone.classes['${OnodeClassId}'] = class extends ${OnodeClassExtension} {
    ${constructorMethods(component, node, opts)}

    // set the modifier object for Ogone fe atures
    ${setOgoneMethod(component, node, opts)}

    // use bindStyle method
    // this method allow --style feature
    ${bindStyleMethod(component, node, opts)}

    // use bindClass method
    // this method allow --class feature
    ${bindClassMethod(component, node, opts)}

    // set events on the node
    // this method allow all DOM level 3 events
    ${setEventsMethod(component, node, opts)}

    // methods for routers components
    ${routerMethods(component, node, opts)}

    // methods for stores components
    ${storeMethods(component, node, opts)}

    // methods for all components
    // this allow the use of <slot> tag
    ${slotsMethods(component, node, opts)}

    // methods for async components
    ${asyncMethods(component, node, opts)}

    // global methods for components
    // mainly getters and setters
    ${utilsMethods(component, node, opts)}

    connectedCallback(rendered) {
      // set position of the template/component
      this.setPosition();


      // set the context of the node
      this.setContext();

      // parse the route that match with location.pathname
      ${isRouter ? "this.setActualRouterTemplate()" : ""}

      // set the props required by the node
      ${
    isTemplate ? "this.setProps(); this.ogone.component.updateProps();" : ""
  }

      // use the jsx renderer only for templates
      this.setNodes();


      // use the previous jsx and push the result into ogone.nodes
      // set the dependencies of the node into the component
      this.setDeps();

      // set the events
      this.setEvents();

      // bind classList
      this.bindClass();

      // bind style
      this.bindStyle();

      // set history state and trigger default code for router
      ${isRouter ? "this.triggerLoad();" : ""}

      // now ... just render ftw!
      switch(true) {
        case ${isRouter}: this.renderRouter(); break;
        case ${isStore}: this.renderStore(); break;
        case ${isAsync}: this.renderAsync(); break;
        default: this.render(); break;
      }
    }
    setPosition() {
      this.ogone.position[this.ogone.level] = this.ogone.index;
    }
    setProps() {
      const o = this.ogone;
      if (!o.index) {
        o.index = 0;
      }
      o.component.props = o.props;
      o.component.positionInParentComponent = o.positionInParentComponent;
      o.positionInParentComponent[
        o.levelInParentComponent] = o.index;
      o.component.updateProps();
    }
    setContext() {
      const o = this.ogone;
      const oc = o.component;
      if (${isTemplate}) {
        oc.key = o.key;
        oc.dependencies = o.dependencies;
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
      if (${isStore}) {
        oc.namespace = this.getAttribute('namespace') || null;
        oc.parent.store[oc.namespace] = oc;
      }
    }
    setNodes() {
      const o = this.ogone;
      if (${isTemplate}) {
        // using array.from to copy NodeList that will get empty.
        // so we need to keep the childnodes
        o.nodes = Array.from(o.render(o.component).childNodes);
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
      if (o.originalNode && o.getContext) {
            o.component${
    isTemplate ? ".parent" : ""
  }.react.push(() => this.renderContext());
            this.renderContext();
      }
    }
    renderContext() {
      const o = this.ogone;
      const key = o.key;
      const length = o.getContext({ getLength: true, position: o.position });
      o.component${isTemplate ? ".parent" : ""}.render(this, {
        callingNewComponent: ${isTemplate},
        key,
        length,
      });
      return true;
    }
    removeNodes() {
      /* use it before removing template node */
      this.ogone.nodes.forEach((n) => n.remove());
      this.ogone.component.runtime('destroy');
      this.ogone.component.activated = false;
      return this;
    }
    render() {
      const o = this.ogone;
      const oc = o.component;
      if (${isTemplate}) {
        // update Props before replace the element
        oc.updateProps();

        if (this.childNodes.length) {
          this.renderSlots();
        }
        // replace the element
        if (${isAsync}) {
          this.context.placeholder.replaceWith(...o.nodes);
        } else {
          this.replaceWith(...o.nodes);
        }
        // template/node is already connected
        // ask the component to evaluate the value of the textnodes
        oc.renderTexts(true);

        // trigger the init case of the component
        // we can pass the parameters of the router into the ctx
        if (${!isAsync}) {
          oc.startLifecycle(o.params, o.historyState);
        }
      } else {
        if (this.childNodes.length) {
          this.renderSlots();
        }
        oc.renderTexts(true);
        this.replaceWith(...o.nodes);
      }
    }
  }
`;
  const definition = `customElements.define('${component.uuid}-${
    isTemplate ? "nt" : node.id
  }', Ogone.classes['${component.uuid}${
    isTemplate ? "" : "-" + node.id
  }'], { extends: '${isTemplate ? "template" : extensionId}' });`;
  Ogone.customElements.push(definition);
  return componentExtension;
}
