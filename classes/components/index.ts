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
import { Bundle, Component, XMLNodeDescription } from "./../../.d.ts";
import contextMethods from "./utils/context.ts";
import { Utils } from '../utils/index.ts';

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
    const templateSlots = {
      ...opts,
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
    let componentExtension = `
    Ogone.classes['{{ classId }}'] = class extends {{ extension }} {
      {{ methods.constructor }}

      // set the modifier object for Ogone fe atures
      {{ methods.setOgone }}

      // use bindStyle method
      // this method allow --style flag
      {{ methods.bindStyle }}

      // use bindClass method
      // this method allow --class flag
      {{ methods.bindClass }}

      // use bindValue method
      // this method allow --bind flag
      {{ methods.bindValue }}

      // set events on the node
      // this method allow all DOM level 3 events
      {{ methods.setEvents }}

      // methods for routers components
      {{ methods.router }}

      // methods for stores components
      {{ methods.store }}

      // methods for all components
      // this allow the use of <slot> tag
      {{ methods.slots }}

      // methods for async components
      {{ methods.async }}

      // global methods for components
      // mainly getters and setters
      {{ methods.utils }}

      // setContext and setHMRContext
      {{ methods.context }}

      connectedCallback() {
        // set position of the template/component
        this.setPosition();

        // set the context of the node
        this.setContext();
        {{ connectedCallback.hmr }}

        // parse the route that match with location.pathname
        {{ connectedCallback.router }}

        // set the props required by the node
        {{ connectedCallback.props }}
        this.renderingProcess();

        // now ... just render ftw!
        {{ connectedCallback.render }}
      }
      renderingProcess() {
        // use the jsx renderer only for templates
        this.setNodes();
        // render DevTools
        {{ render.devTool }}
        // set Async context for Async nodes
        {{ render.async }}
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
        {{ render.router }}
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
        {{ nodes.settings }}
        // set parentKey to template
        {{ nodes.devtool.parentKey }}
      }
      setDeps() {
        const o = this.ogone;
        if (o.originalNode && o.getContext) {
            o.component{{ deps.isTemplate }}.react.push(() => this.renderContext());
            this.renderContext();
        }
      }
      renderContext() {
        const o = this.ogone, oc = o.component;
        const key = o.key;
        const length = o.getContext({ getLength: true, position: o.position });
        o.component{{ deps.isTemplate }}.render(this, {
          callingNewComponent: {{ isTemplate }},
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
        {{ destroy.runtime }}
        {{ destroy.devTool }}
        this.remove();
      }
      render() {
        const o = this.ogone, oc = o.component;
        {{ render.statements }}
      }
    }
  `;
    let definition =
      `customElements.define('{{ classId }}', Ogone.classes['{{ classId }}'], { extends: 'template' });`;

    if (!isTemplate) {
      definition =
        `customElements.define('{{ classId }}', Ogone.classes['{{ classId }}']);`;
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
    const render = `Ogone.render['{{ classId }}'] = ${
      componentPragma
        .replace(/\n/gi, "")
        .replace(/\s+/gi, " ")
      }`;
    bundle.customElements.push(this.template(definition, templateSlots));
    bundle.render.push(this.template(render, templateSlots));
    if (["controller"].includes(component.type)) {
      return `Ogone.classes['${component.uuid}-nt'] = class extends HTMLTemplateElement {
        constructor(){super();}
        setOgone() {}
        connectedCallBack(){this.remove()} };`;
    }
    return this.template(componentExtension, templateSlots);
  }
}
