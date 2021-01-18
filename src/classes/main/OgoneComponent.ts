import Ogone from './Ogone.ts';
import {
  HTMLOgoneElement,
  OnodeComponent,
  OnodeComponentRenderOptions,
  OgoneParameters
} from '../../ogone.main.d.ts';
import { Document } from "../../ogone.dom.d.ts";
import OgoneRouter from './OgoneRouter.ts';

declare const document: Document;
export default class OgoneComponent extends OgoneRouter {
  createComponent(this: OnodeComponent): OnodeComponent {
    this.key = null;
    this.data = null;
    this.pluggedWebComponentIsSync = false;
    this.dependencies = null;
    this.state = 0;
    this.activated = true;
    this.namespace = null;
    this.store = {};
    this.contexts = {
      for: {},
    };
    // for async context
    this.promises = [];
    this.resolve = null;
    this.async = {
      then: null,
      catch: null,
      finally: null,
    };
    this.dispatchAwait = null;
    this.promiseResolved = false;
    // events describers
    // this.events = {};
    // all nodes that's are dynamics will save a function into this property
    // like if we have
    //  <node --for="(el, i) of array" />
    // this node will register a function() { ... } that will be triggered each time there is an update
    //this.rerenderAsync = null;
    this.react = [];
    this.texts = [];
    this.childs = [];
    this.startLifecycle = (params?: any, event?: Event | OgoneParameters['historyState']) => {
      if (!this.activated) return;
      if (this.type === "store") {
        this.initStore();
      }
      this.updateProps();
      this.runtime(0, params, event);
    };
    this.update = (dependency?: string) => {
      if (this.type === "store") {
        this.updateStore(dependency);
        return;
      }
      this.runtime(`update:${dependency}`);
      this.reactTo(dependency as string);
      this.renderTexts(dependency as string);
      this.childs.filter((c: OnodeComponent) => c.type !== "store").forEach(
        (c: OnodeComponent) => {
          c.updateProps(dependency as string);
        },
      );
    };
    this.renderTexts = (dependency: string) => {
      if (!this.activated) return;
      this.texts.forEach((t: Function, i: number, arr: Function[]) => {
        // if there is no update of the texts
        // this can be the reason why
        if (t && !t(dependency)) delete arr[i];
      });
    };
    this.reactTo = (dependency: string) => {
      this.react.forEach((t: Function, i: number, arr: Function[]) => {
        if (t && !t(dependency)) delete arr[i];
      });
    };
    this.initStore = () => {
      if (!Ogone.stores[this.namespace as string]) {
        Ogone.stores[this.namespace as string] = {
          ...this.data,
        };
      }
      // save the component's reaction into Ogone.clients with the key of the component
      // and a function
      Ogone.clients.push([this.key as string, (namespace, key, overwrite) => {
        if (
          namespace === this.namespace &&
          this.data &&
          this.parent &&
          this.parent.data
        ) {
          if (!overwrite) {
            this.data[key] = Ogone.stores[this.namespace][key];
          } else {
            Ogone.stores[this.namespace][key] = this.data[key];
          }
          if (this.parent.data[key] !== this.data[key]) {
            this.parent.data[key] = this.data[key];
            this.parent.update(key);
          }
        }
        return this.activated;
      }]);
    };
    this.updateStore = (dependency: string) => {
      // find the reaction of this store module with the key
      // @ts-ignore VSCode error on iterators
      const [key, client] = Ogone.clients.find(([key]) => key === this.key);
      if (client) {
        // use the namespace, the dependency or property that should change
        client(this.namespace, dependency, true);
        // update other modules
        Ogone.clients.filter(([key]) => key !== this.key).forEach(
          ([key, f], i, arr) => {
            if (f && !f(this.namespace as string, dependency, false)) {
              delete arr[i];
            }
          },
        );
      }
    };
    this.updateService = (key: string, value: unknown, force?: boolean) => {
      if (this.data && value !== this.data[key] || force && this.data) {
        const previous = this.data[key];
        this.data[key] = value;
        /**
         * for recycle Webcomponent feature
         * pluggedWebComponent is a WebComponent that is used
         * by the end user
         */
        if (this.pluggedWebComponentIsSync) {
          if (this.pluggedWebComponent && typeof this.pluggedWebComponent.beforeUpdate === 'function') {
            this.pluggedWebComponent.beforeUpdate(key, this.data[key], value)
          }
          /**
           * update the webcomponent
           */
          if (this.pluggedWebComponent && value !== this.pluggedWebComponent[key]) {
            this.pluggedWebComponent[key] = value;
          }
        }
        if (this.pluggedWebComponent && typeof this.pluggedWebComponent.attributeChangedCallback === 'function') {
          this.pluggedWebComponent.attributeChangedCallback(key, previous, value);
        }
        this.update(key);
        if (this.type === "async") {
          if (!this.dependencies) return;
          if (
            key &&
            this.dependencies.find((d: string) => d.indexOf(key) > -1)
          ) {
            // let the user rerender
            this.runtime("async:update", {
              updatedParentProp: key,
            });
          }
        }
      }
    };
    this.updateProps = (dependency: string) => {
      if (!this.activated) return;
      if (this.type === "store") return;
      if (!this.requirements || !this.requirements.length || !this.props) return;
      this.requirements.forEach(([key]: [string, string]) => {
        const prop = this.props.find((prop: [string, ...any[]]) =>
          prop[0] === key
        );
        if (!prop) return;
        const value = this.parentContext({
          getText: `${prop[1]}`,
          position: this.positionInParentComponent,
        });
        this.updateService(key, value, !!dependency);
      });
    };
    /**
     * this is used to update the attributes of the webcomponent
     * when a prop is updated
     */
    this.plugWebComponent = (wc: any, isSync: boolean) => {
      this.pluggedWebComponent = wc;
      this.pluggedWebComponentIsSync = isSync;
    };
    this.destroyPluggedWebcomponent = () => {
      if (this.pluggedWebComponent && typeof this.pluggedWebComponent.beforeDestroy === 'function') {
        this.pluggedWebComponent.beforeDestroy();
      }
      if (this.pluggedWebComponent) {
        this.pluggedWebComponent = false;
        this.pluggedWebComponentIsSync = false;
      }
    };
    this.render = (
      Onode: HTMLOgoneElement, /** original node */
      opts: OnodeComponentRenderOptions,
    ) => {
      if (!Onode || !opts) return;
      // Onode is a web component
      // based on the user token
      // this web component is a custom Element
      // at the first call of this function Onode is not "rendered" (replaced by the required element)
      let { callingNewComponent, length: dataLength } = opts;
      typeof dataLength === "object" ? dataLength = 1 : [];
      const context = Onode.context;
      // no need to render if it's the same
      if (context.list.length === dataLength) return;
      // first we add missing nodes
      for (let i = context.list.length, a = dataLength; i < a; i++) {
        let node: HTMLOgoneElement;
        node = document.createElement(context.name, { is: Onode.extends }) as HTMLOgoneElement;
        let ogoneOpts: any = {
          index: i,
          originalNode: false,
          level: Onode.ogone.level,
          position: Onode.ogone.position!.slice(),
          flags: Onode.ogone.flags,
          original: Onode,
          isRoot: false,
          name: Onode.ogone.name,
          tree: Onode.ogone.tree,
          namespace: Onode.ogone.namespace,
          isTemplate: Onode.ogone.isTemplate,
          isImported: Onode.ogone.isImported,
          isAsync: Onode.ogone.isAsync,
          isAsyncNode: Onode.ogone.isAsyncNode,
          isRouter: Onode.ogone.isRouter,
          isStore: Onode.ogone.isStore,
          isRemote: Onode.ogone.isRemote,
          extends: Onode.ogone.extends,
          uuid: Onode.ogone.uuid,
          routes: Onode.ogone.routes,

          parentNodeKey: Onode.ogone.parentNodeKey,
          ...(!callingNewComponent ? {
            component: this,
            nodeProps: Onode.ogone.nodeProps,
          } : {
              props: Onode.ogone.props,
              dependencies: Onode.ogone.dependencies,
              requirements: Onode.ogone.requirements,
              params: Onode.ogone.params,
              parentComponent: Onode.ogone.parentComponent,
              parentCTXId: Onode.ogone.parentCTXId,
              positionInParentComponent: Onode.ogone.positionInParentComponent ? Onode.ogone.positionInParentComponent
                .slice() : [],
              levelInParentComponent: Onode.ogone.levelInParentComponent,
            }),
        };
        Ogone.setOgone(node, ogoneOpts);
        ogoneOpts = null;
        let previous = node;
        if (i === 0) {
          context.placeholder.replaceWith(node);
        } else {
          let lastEl = context.list[i - 1];
          if (lastEl && lastEl.isConnected) {
            Ogone.insertElement(lastEl as HTMLOgoneElement, "afterend", node);
          } else if (Onode && Onode.parentNode && !Onode.renderedList) {
            Onode.parentNode.insertBefore(node, Onode.nextElementSibling);
            Onode.renderedList = true;
            previous = node;
          } else if (Onode && Onode.parentNode && Onode.renderedList) {
            Onode.parentNode.insertBefore(node, previous.nextElementSibling);
            previous = node;
          }
        }
        context.list.push(node);
      }
      // no need to remove if it's the same
      if (context.list.length === dataLength) return;
      // now we remove the extra elements
      for (let i = context.list.length, a = dataLength; i > a; i--) {
        if (context.list.length === 1) {
          // get the first element of the webcomponent
          let firstEl = context.list[0] as HTMLOgoneElement;
          if (firstEl && firstEl.firstNode && firstEl.isConnected) {
            Ogone.insertElement(firstEl, "beforebegin", context.placeholder);
          } else if (Onode.parentNode) {
            const { parentNode } = context;
            parentNode.insertBefore(context.placeholder, Onode);
          }
        }
        const rm = context.list.pop() as HTMLOgoneElement;
        // don't use destroy here
        // if rm.destroy is used, it will not allow empty list to rerender
        Ogone.removeNodes(rm);
        rm.remove();
      }
    };
    return this;
  }
}