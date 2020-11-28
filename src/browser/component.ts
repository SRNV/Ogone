import type {
  OnodeComponent,
  OnodeComponentRenderOptions,
} from "../../types/component.ts";
import type { OgoneBrowser } from "../../types/ogone.ts";
import type { Template } from "../../types/template.ts";

let Ogone: OgoneBrowser;

function OComponent(this: OnodeComponent): OnodeComponent {
  this.key = null;
  this.data = null;
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
  this.startLifecycle = (params?: any, event?: Event) => {
    if (!this.activated) return;
    if (this.type === "store") {
      this.initStore();
    }
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
    // @ts-ignore
    const [key, client] = Ogone.clients.find(([key]) => key === this.key);
    if (client) {
      // use the namespace, the dependency or property that should change
      // @ts-ignore
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
  this.updateProps = (dependency: string) => {
    if (!this.activated) return;
    if (this.type === "store") return;
    if (!this.requirements || !this.props) return;
    this.requirements.forEach(([key,]: [string, any[]]) => {
      const prop = this.props.find((prop: [string, ...any[]]) =>
        prop[0] === key
      );
      if (!prop) return;
      const value = this.parentContext({
        getText: `${prop[1]}`,
        position: this.positionInParentComponent,
      });
      if (this.data && value !== this.data[key]) {
        this.data[key] = value;
        this.update(key);
        if (this.type === "async") {
          if (!this.dependencies) return;
          if (
            dependency &&
            this.dependencies.find((d: string) => d.indexOf(dependency) > -1)
          ) {
            // let the user rerender
            this.runtime("async:update", {
              updatedParentProp: dependency,
            });
          }
        }
      }
    });
  };
  this.render = (
    Onode: Template, /** original node */
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
      let node;
      // @ts-ignore
      node = document.createElement(context.name, { is: Onode.extends });
      let ogoneOpts: any = {
        index: i,
        originalNode: false,
        level: Onode.ogone.level,
        position: Onode.ogone.position.slice(),
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
      node.setOgone(ogoneOpts);
      ogoneOpts = null;
      let previous = node;
      if (i === 0) {
        context.placeholder.replaceWith(node);
      } else {
        let lastEl = context.list[i - 1];
        if (lastEl && lastEl.isConnected) {
          lastEl.insertElement("afterend", node);
          // @ts-ignore
        } else if (Onode && Onode.parentNode && !Onode.renderedList) {
          Onode.parentNode.insertBefore(node, Onode.nextElementSibling);
          // @ts-ignore
          Onode.renderedList = true;
          previous = node;
          // @ts-ignore
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
        let firstEl = context.list[0];
        if (firstEl && firstEl.firstNode && firstEl.isConnected) {
          firstEl.insertElement("beforebegin", context.placeholder);
        } else if (Onode.parentNode) {
          const { parentNode } = context;
          parentNode.insertBefore(context.placeholder, Onode);
        }
      }
      const rm = context.list.pop();
      // don't use destroy here
      // if rm.destroy is used, it will not allow empty list to rerender
      rm.removeNodes().remove();
    }
  };
  return this;
}
export default OComponent.toString();
