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
import Env from "../env/Env.ts";
import type { Bundle, Component, XMLNodeDescription } from "./../../.d.ts";
import contextMethods from "./utils/context.ts";
import { Utils } from "../utils/index.ts";

export default class WebComponentTemplater extends Utils {
  protected render(
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
    const isProduction = Env._env === "production";
    const isRemote = !!component.remote;
    const isAsyncNode = !isTemplate && !isImported && node.flags &&
      node.flags.await;
    const hasDevtool = Env._devtool === true;
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
      ? node.pragma(bundle, component, true)
      : "";
    // no definition for imported component
    if (isImported) {
      return "";
    }
    const templateSlots = {
      ...opts,
      component,
      classId: isTemplate
        ? `${component.uuid}-nt`
        : `${component.uuid}-${node.id}`,
      extension: isTemplate ? "HTMLTemplateElement" : `HTMLElement`,
      methods: {
        setOgone: setOgoneMethod(bundle, component, node, opts),
        constructor: constructorMethods(component, node, opts),
        bindStyle: bindStyleMethod(component, node, opts),
        bindClass: bindClassMethod(component, node, opts),
        bindValue: bindValueMethod(component, node, opts),
        setEvents: setEventsMethod(component, node, opts),
        router: routerMethods(component, node, opts),
        store: storeMethods(component, node, opts),
        async: asyncMethods(component, node, opts),
        slots: slotsMethods(component, node, opts),
        utils: utilsMethods(component, node, opts),
        context: contextMethods(component, node, opts),
      },
      connectedCallback: {
        hmr: !isProduction ? "this.setHMRContext();" : "",
        router: isRouter ? "this.setActualRouterTemplate()" : "",
        props: isTemplate
          ? "this.setProps(); this.ogone.component.updateProps();"
          : "",
        render: isRouter ? "this.renderRouter();" : isStore
          ? "this.renderStore();"
          : isAsync
            ? "this.renderAsync();"
            : "this.render();",
      },
      render: {
        devTool: hasDevtool ? "this.setDevToolContext();" : "",
        async: isAsyncNode ? "this.setNodeAsyncContext();" : "",
        router: isRouter ? "this.triggerLoad();" : "",
        notAsyncStart: !isAsync
          ? "oc.startLifecycle(o.params, o.historyState);"
          : "",
        replacement: isAsync
          ? "this.context.placeholder.replaceWith(...o.nodes);"
          : "this.replaceWith(...o.nodes);",
        statements: isTemplate
          ? `
        // update Props before replace the element
        oc.updateProps();

        if (this.childNodes.length) {
          this.renderSlots();
        }
        // replace the element
        {{ render.replacement }}
        // template/node is already connected
        // ask the component to evaluate the value of the textnodes
        oc.renderTexts(true);

        // trigger the init case of the component
        // we can pass the parameters of the router into the ctx
        {{ render.notAsyncStart }}`
          : `
        if (this.childNodes.length) {
          this.renderSlots();
        }
        oc.renderTexts(true);
        this.replaceWith(...o.nodes);`,
      },
      nodes: {
        settings: isTemplate
          ? "o.nodes = Array.from(o.render(o.component).childNodes);"
          : "o.nodes = [o.render(o.component, o.position, o.index, o.level)];",
        devtool: {
          parentKey: hasDevtool
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
            : "",
        },
      },
      deps: {
        isTemplate: isTemplate ? ".parent" : "",
      },
      destroy: {
        runtime: isTemplate
          ? `
          this.ogone.component.runtime('destroy');
          this.ogone.component.activated = false;
          `
          : "",
        devTool: hasDevtool
          ? `Ogone.ComponentCollectionManager.destroy(this.ogone.key);`
          : "",
      },
    };
    let componentExtension = ``;
    let definition =
      `customElements.define('{{ classId }}', Ogone.classes['{{ component.type }}']({{ extension }}), { extends: 'template' });`;

    if (!isTemplate) {
      definition =
        `customElements.define('{{ classId }}', Ogone.classes['{{ component.type }}']({{ extension }}));`;
    }
    if (!isProduction) {
      // for HMR
      // asking if the customElement is already defined
      definition = `
        if (!customElements.get("{{ classId }}")) {
          ${definition}
        }
      `;
    }
    const render = `Ogone.render['{{ classId }}'] = ${componentPragma
        .replace(/\n/gi, "")
        .replace(/\s+/gi, " ")
      }`;
    bundle.customElements.push(this.template(definition, templateSlots));
    bundle.render.push(this.template(render, templateSlots));
    if (["controller"].includes(component.type)) {
      return `class extends HTMLTemplateElement {
        constructor(){super();}
        setOgone() {}
        connectedCallBack(){this.remove()} };`;
    }
    return this.template(componentExtension, templateSlots);
  }
}
