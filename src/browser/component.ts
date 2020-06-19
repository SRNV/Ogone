import { OnodeComponent, OnodeComponentRenderOptions } from '../../types/component.ts';
import { OgoneBrowser } from '../../types/ogone.ts';
import { Template } from '../../types/template.ts';

let Ogone: OgoneBrowser;
let _this: OnodeComponent;

function _OGONE_BROWSER_CONTEXT() {
  function OComponent(): OnodeComponent {
    _this.key = null;
    _this.data = null;
    _this.dependencies = null;
    _this.state = 0;
    _this.activated = true;
    _this.namespace = null;
    _this.store = {};
    _this.contexts = {
      for: {},
    };
    // for async context
    _this.promises = [];
    _this.resolve = null;
    _this.async = {
      then: null,
      catch: null,
      finally: null,
    };
    _this.dispatchAwait = null;
    _this.promiseResolved = false;
    // events describers
    // _this.events = {};
    // all nodes that's are dynamics will save a function into this property
    // like if we have
    //  <node --for="array as (el, i)" />
    // this node will register a function() { ... } that will be triggered each time there is an update
    //_this.rerenderAsync = null;
    _this.react = [];
    _this.texts = [];
    _this.childs = [];
    _this.startLifecycle = (params?: any, event?: Event) => {
      if (!_this.activated) return;
      if (_this.type === "store") {
        _this.initStore();
      }
      // WIP
      Object.seal(_this.data);
      _this.runtime(0, params, event);
      _this.state = 1; // component is rendered
    };
    _this.update = (dependency?: string) => {
      if (!_this.activated) return;
      if (_this.type === "store") {
        _this.updateStore(dependency);
        return;
      }
      _this.runtime(`update:${dependency}`);
      _this.reactTo(dependency as string);
      _this.renderTexts(dependency as string);
      _this.childs.filter((c: OnodeComponent) => c.type !== "store").forEach((c: OnodeComponent) => {
        c.updateProps(dependency as string);
      });
    };
    _this.renderTexts = (dependency: string) => {
      if (!_this.activated) return;
      _this.texts.forEach((t: Function, i: number, arr: Function[]) => {
        // if there is no update of the texts
        // this can be the reason why
        if (t && !t(dependency)) delete arr[i];
      });
    };
    _this.reactTo = (dependency: string) => {
      if (!_this.activated) return;
      _this.react.forEach((t: Function, i: number, arr: Function[]) => {
        if (t && !t(dependency)) delete arr[i];
      });
    };
    _this.initStore = () => {
      if (!Ogone.stores[_this.namespace as string]) {
        Ogone.stores[_this.namespace as string] = {
          ..._this.data,
        };
      }
      // save the component's reaction into Ogone.clients with the key of the component
      // and a function
      Ogone.clients.push([_this.key as string, (namespace, key, overwrite) => {
        if (namespace === _this.namespace
            && _this.data
            && _this.parent
            && _this.parent.data
            && key in _this.parent.data) {
          if (!overwrite) {
            _this.data[key] = Ogone.stores[_this.namespace][key];
          } else {
            Ogone.stores[_this.namespace][key] = _this.data[key];
          }
          _this.parent.data[key] = _this.data[key];
          _this.parent.update(key);
        }
        return true;
      }]);
    };
    _this.updateStore = (dependency: string) => {
      // find the reaction of this store module with the key
      // @ts-ignore
      const [key, client] = Ogone.clients.find(([key]) => key === _this.key);
      if (client) {
        // use the namespace, the dependency or property that should change
        // @ts-ignore
        client(_this.namespace, dependency, true);
        // update other modules
        Ogone.clients.filter(([key]) => key !== _this.key).forEach(
          ([key, f], i, arr) => {
            if (f && !f(_this.namespace as string, dependency, false)) {
              delete arr[i];
            }
          },
        );
      }
    };
    _this.updateProps = (dependency: string) => {
      if (!_this.activated) return;
      if (_this.type === "store") return;
      if (!_this.requirements || !_this.props) return;
      _this.requirements.forEach(([key, constructors] : [string, any[]]) => {
        const prop = _this.props.find((prop: [string, ...any[]]) => prop[0] === key);
        const isAny = constructors.includes(null);
        if (!prop && !isAny) {
          const UndefinedPropertyForComponentException =
            `${key} is required as property but still undefined. Please use this syntax\n\t\t<component :${key}="..."></component>`;
          const err = new Error(
            "[Ogone]  " + UndefinedPropertyForComponentException,
          );
          Ogone.error(
            UndefinedPropertyForComponentException,
            `Undefined property ${key}. But ${key} is required in component`,
            err,
          );
          throw err;
        }
        if (!prop) return;
        const value = _this.parentContext({
          getText: `${prop[1]}`,
          position: _this.positionInParentComponent,
        });
        if ((value === undefined || value === null) && !isAny) {
          const message =
            `${key} is required as property but can\'t be null. Please use this syntax\n\t\t<component :${key}="${
              constructors.join(" | ")
            }"></component>`;
          const NullishPropertyException = new Error("[Ogone]  " + message);
          Ogone.error(
            message,
            `Property ${key} can't be null for the component`,
            NullishPropertyException,
          );
          throw NullishPropertyException;
        }
        if (!constructors.includes(value.constructor.name)) {
          const message =
            `${key} is required as property but it's value is not one of ${
              constructors.join(" | ")
            }
            evaluated value: ${prop[1]}
            constructor: ${value.constructor.name}`;
          const PropertyDontMatchWithConstructorsException = new Error(
            "[Ogone] " + message,
          );
          Ogone.error(
            message,
            `TypeError for property ${key}`,
            PropertyDontMatchWithConstructorsException,
          );
          throw PropertyDontMatchWithConstructorsException;
        }
        if (_this.data && value !== _this.data[key]) {
          _this.data[key] = value;
          _this.update(key);
          if (_this.type === "async") {
            if (!_this.dependencies) return;
            if (
              dependency &&
              _this.dependencies.find((d: string) => d.indexOf(dependency) > -1)
            ) {
              // let the user rerender
              _this.runtime("async:update", {
                updatedParentProp: dependency,
              });
            }
          }
        }
      });
    };
    _this.render = (Onode: Template, /** original node */ opts: OnodeComponentRenderOptions) => {
      if (!Onode || !opts) return;
      // Onode is a web component
      // based on the user token
      // this web component is a custom Element
      // not an extension of an element cause the attr "is" is not dynamic
      // at the first call of this function Onode is not "rendered" (replaced by the required element)
      let { callingNewComponent, length: dataLength } = opts;
      typeof dataLength === "object" ? dataLength = 1 : [];
      const context = Onode.context;
      // no need to render if it's the same
      if (context.list.length === dataLength) return;
      let previousTemplate;
      // first we add missing nodes, we use cloneNode to generate the web-component
      for (let i = context.list.length, a = dataLength; i < a; i++) {
        let node;
        // @ts-ignore
        node = document.createElement(context.name, { is: Onode.extends });
        node.setOgone({
          index: i,
          originalNode: false,
          level: Onode.ogone.level,
          position: Onode.ogone.position.slice(),
          flags: Onode.ogone.flags,
          orinal: Onode,
          ...(!callingNewComponent ? { component: _this } : {
            props: Onode.ogone.props,
            params: Onode.ogone.params,
            parentComponent: Onode.ogone.parentComponent,
            parentCTXId: Onode.ogone.parentCTXId,
            positionInParentComponent: Onode.ogone.positionInParentComponent
              .slice(),
            levelInParentComponent: Onode.ogone.levelInParentComponent,
          }),
        });
        if (i === 0) {
          context.placeholder.replaceWith(node);
        } else {
          let lastEl = context.list[i - 1];
          if (lastEl && lastEl.isConnected) {
            lastEl.insertElement("afterend", node);
          } else if (Onode && Onode.parentNode) {
            Onode.parentNode.insertBefore(node, Onode.nextElementSibling);
          }
        }
        context.list.push(node);
        previousTemplate = node;
      }
      // no need to remove if it's the same
      if (context.list.length === dataLength) return;
      // now we remove the extra elements
      for (let i = context.list.length, a = dataLength; i > a; i--) {

        if (context.list.length === 1) {
          // get the first element of the webcomponent
          let firstEl = context.list[0];
          if (firstEl && firstEl.firstNode && firstEl.isConnected) {
            firstEl.insertElement('beforebegin', context.placeholder);
          } else if (Onode.parentNode) {
            const { parentNode } = context;
            parentNode.insertBefore(context.placeholder, Onode);
          }
        }
        const rm = context.list.pop();
        // deactivate all the reactions of the component
        rm.removeNodes().remove();
      }
    };
    return _this;
  }
}
export default _OGONE_BROWSER_CONTEXT.toString()
  .replace(/_this/gi, 'this')
  .replace('function _OGONE_BROWSER_CONTEXT() {', '')
  .slice(0, -1)
