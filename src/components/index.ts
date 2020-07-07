import constructorMethods from "./component/constructor.ts";
import setEventsMethod from "./component/setEvents.ts";
import bindStyleMethod from "./component/bindStyle.ts";
import bindClassMethod from "./component/bindClass.ts";
import bindValueMethod from "./component/bindValue.ts";
import setOgoneMethod from "./component/ogone.ts";
import slotsMethods from "./component/slots.ts";
import routerMethods from "./router/index.ts";
import storeMethods from "./store/index.ts";
import asyncMethods from "./async/index.ts";
import utilsMethods from "./utils/index.ts";
import Env from "../../lib/env/Env.ts";
import { Bundle, Component, XMLNodeDescription } from "./../../.d.ts";
import contextMethods from "./utils/context.ts";

export default function getWebComponent(
  bundle: Bundle,
  component: Component,
  node: XMLNodeDescription,
) {
  if (!component) return "";
  const isTemplate = node.tagName === null;
  const isImported = node.tagName ? component.imports[node.tagName] : false;
  const isRouter = isTemplate && component.type === "router";
  const isStore = isTemplate && component.type === "store";
  const isAsync = isTemplate && component.type === "async";
  const isProduction = Env.env === "production";
  const isRemote = !!component.remote;
  const isAsyncNode = !isTemplate && !isImported && node.flags &&
    node.flags.await;
  const hasDevtool = Env.devtool === true;
  const opts = {
    isTemplate,
    isAsync,
    isRouter,
    isStore,
    isAsyncNode,
    isImported,
    isProduction,
    isRemote,
    hasDevtool,
  };
  const componentPragma = node.pragma
    ? node.pragma(
      component.uuid,
      true,
      Object.keys(component.imports),
      (tagName: string): string | null => {
        if (component.imports[tagName]) {
          const newcomponent = bundle.components.get(
            component.imports[tagName],
          );
          if (!newcomponent) return null;
          return newcomponent.uuid;
        }
        return null;
      },
    )
    : "";
  // no definition for imported component
  if (isImported) {
    return "";
  }
  const OnodeClassExtension = isTemplate
    ? "HTMLTemplateElement"
    : `HTMLElement`;
  const OnodeClassId = isTemplate
    ? `${component.uuid}-nt`
    : `${component.uuid}-${node.id}`;
  let componentExtension = `
  Ogone.classes['${OnodeClassId}'] = class extends ${OnodeClassExtension} {
    ${constructorMethods(component, node, opts)}

    // set the modifier object for Ogone fe atures
    ${setOgoneMethod(bundle, component, node, opts)}

    // use bindStyle method
    // this method allow --style flag
    ${bindStyleMethod(component, node, opts)}

    // use bindClass method
    // this method allow --class flag
    ${bindClassMethod(component, node, opts)}

    // use bindValue method
    // this method allow --bind flag
    ${bindValueMethod(component, node, opts)}

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

    // setContext and setHMRContext
    ${contextMethods(component, node, opts)}

    connectedCallback() {
      // set position of the template/component
      this.setPosition();


      // set the context of the node
      this.setContext();

      ${!isProduction ? "this.setHMRContext();" : ""}

      // parse the route that match with location.pathname
      ${isRouter ? "this.setActualRouterTemplate()" : ""}

      // set the props required by the node
      ${
    isTemplate ? "this.setProps(); this.ogone.component.updateProps();" : ""
    }
      this.renderingProcess();

      // now ... just render ftw!
      ${
    isRouter
      ? "this.renderRouter();"
      : isStore
        ? "this.renderStore();"
        : isAsync
          ? "this.renderAsync();"
          : "this.render();"
    }
    }
    renderingProcess() {
      // use the jsx renderer only for templates
      this.setNodes();
      // render DevTools
      ${hasDevtool ? "this.setDevToolContext();" : ""}
      // set Async context for Async nodes
      ${isAsyncNode ? "this.setNodeAsyncContext();" : ""}
      // use the previous jsx and push the result into ogone.nodes
      // set the dependencies of the node into the component
      this.setDeps();

      // set the events
      this.setEvents();

      // bind classList
      this.bindClass();

      // bind style
      this.bindStyle();

      // bind value
      this.bindValue();

      // set history state and trigger default code for router
      ${isRouter ? "this.triggerLoad();" : ""}
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
    setNodes() {
      const o = this.ogone;
      ${
    isTemplate
      ? // using array.from to copy NodeList that will get empty.
      // so we need to keep the childnodes
      "o.nodes = Array.from(o.render(o.component).childNodes);"
      : "o.nodes = [o.render(o.component, o.position, o.index, o.level)];"
    }
    // set parentKey to template
    ${
    hasDevtool
      ? `
    // TODO PERFORMANCE OPTIMISATION
    function recursiveAssignement(nodes) {
      nodes.filter((n) => n.ogone)
        .forEach((n) => {
          n.ogone.parentNodeKey = o.key;
        });
      nodes.forEach((n) => {
        if (n.childNodes.length) {
          recursiveAssignement(Array.from(n.childNodes));
        }
      })
    }
      recursiveAssignement(o.nodes);

    `
      : ""
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
      const o = this.ogone, oc = o.component;
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
      if (this.ogone.actualTemplate) {
        this.ogone.actualTemplate.forEach((n) => {
          if (n.ogone) {
            n.destroy();
          } else {
            n.remove();
          }
        })
      }
      this.ogone.nodes.forEach((n) => {
        if (n.ogone) {
          n.destroy();
        } else {
          n.remove();
        }
      });
      return this;
    }
    destroy() {
      this.context.list.forEach((n) => {
        n.removeNodes().remove();
      });
      this.removeNodes();
      ${
    isTemplate
      ? `
        this.ogone.component.runtime('destroy');
        this.ogone.component.activated = false;
        `
      : ""
    }
    ${
    hasDevtool
      ? `
      Ogone.ComponentCollectionManager.destroy(this.ogone.key);
    `
      : ""
    }
      this.remove();
    }
    render() {
      const o = this.ogone, oc = o.component;
      if (${isTemplate}) {
        // update Props before replace the element
        oc.updateProps();

        if (this.childNodes.length) {
          this.renderSlots();
        }
        // replace the element
        ${
    isAsync
      ? "this.context.placeholder.replaceWith(...o.nodes);"
      : "this.replaceWith(...o.nodes);"
    }
        // template/node is already connected
        // ask the component to evaluate the value of the textnodes
        oc.renderTexts(true);

        // trigger the init case of the component
        // we can pass the parameters of the router into the ctx
        ${!isAsync ? "oc.startLifecycle(o.params, o.historyState);" : ""}
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
  let definition =
    `customElements.define('${component.uuid}-nt', Ogone.classes['${component.uuid}-nt'], { extends: 'template' });`;

  if (!isTemplate) {
    definition =
      `customElements.define('${component.uuid}-${node.id}', Ogone.classes['${component.uuid}-${node.id}']);`;
  }
  if (!isProduction) {
    // for HMR
    // asking if the customElement is already defined
    definition = `
      if (!customElements.get("${component.uuid}-${node.id}")) {
        ${definition}
      }
    `;
  }
  const render = `Ogone.render['${component.uuid}-${node.id}'] = ${
    componentPragma
      .replace(/\n/gi, "")
      .replace(/\s+/gi, " ")
    }`;
  bundle.customElements.push(definition);
  bundle.render.push(render);
  if (["controller"].includes(component.type)) {
    return `Ogone.classes['${component.uuid}-nt'] = class extends HTMLTemplateElement {
      constructor(){super();}
      setOgone() {}
      connectedCallBack(){this.remove()} };`
  }
  return componentExtension;
}
