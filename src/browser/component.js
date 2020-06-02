function OComponent() {
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
  this.events = {};
  // all nodes that's are dynamics will save a function into this property
  // like if we have
  //  <node --for="array as (el, i)" />
  // this node will register a function() { ... } that will be triggered each time there is an update
  this.rerenderAsync = null;
  this.react = [];
  this.directRenders = {};
  this.texts = [];
  this.childs = [];
  this.read = (ev) => {
    switch (ev.type) {
      case "component":
        this.id = ev.id;
    }
  };
  this.startLifecycle = (params, event) => {
    if (!this.activated) return;
    if (this.type === "store") {
      this.initStore();
    }
    // WIP
    Object.seal(this.data);
    this.runtime(0, params, event);
    this.state = 1; // component is rendered
  };
  this.update = (dependency) => {
    if (!this.activated) return;
    if (this.type === "store") {
      this.updateStore(dependency);
      return;
    }
    this.runtime(`update:${dependency}`);
    this.reactTo(dependency);
    this.renderTexts(dependency);
    this.childs.filter((c) => c.type !== "store").forEach((c) => {
      c.updateProps(dependency);
    });
  };
  this.renderTexts = (dependency) => {
    if (!this.activated) return;
    this.texts.forEach((t, i, arr) => {
      // if there is no update of the texts
      // this can be the reason why
      if (t && !t(dependency)) delete arr[i];
    });
  };
  this.reactTo = (dependency) => {
    if (!this.activated) return;
    this.react.forEach((t, i, arr) => {
      if (t && !t(dependency)) delete arr[i];
    });
  };
  this.initStore = () => {
    if (!Ogone.stores[this.namespace]) {
      Ogone.stores[this.namespace] = {
        ...this.data,
      };
    }
    // save the component's reaction into Ogone.clients with the key of the component
    // and a function
    Ogone.clients.push([this.key, (namespace, key, overwrite) => {
      if (namespace === this.namespace && key in this.parent.data) {
        if (!overwrite) {
          this.data[key] = Ogone.stores[this.namespace][key];
        } else {
          Ogone.stores[this.namespace][key] = this.data[key];
        }
        this.parent.data[key] = this.data[key];
        this.parent.update(key);
      }
      return true;
    }]);
  };
  this.updateStore = (dependency) => {
    // find the reaction of this store module with the key
    const [key, client] = Ogone.clients.find(([key]) => key === this.key);
    if (client) {
      // use the namespace, the dependency or property that should change
      client(this.namespace, dependency, true);
      // update other modules
      Ogone.clients.filter(([key]) => key !== this.key).forEach(
        ([key, f], i, arr) => {
          if (f && !f(this.namespace, dependency, false)) {
            delete arr[i];
          }
        },
      );
    }
  };
  this.updateProps = (dependency) => {
    if (!this.activated) return;
    if (this.type === "store") return;
    if (!this.requirements || !this.props) return;
    this.requirements.forEach(([key, constructors]) => {
      const prop = this.props.find((prop) => prop[0] === key);
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
      const value = this.parentContext({
        getText: `${prop[1]}`,
        position: this.positionInParentComponent,
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
      if (value !== this.data[key]) {
        this.data[key] = value;
        this.update(key);
        if (this.type === "async") {
          if (!this.dependencies) return;
          if (
            dependency &&
            this.dependencies.find((d) => d.indexOf(dependency) > -1)
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
  this.render = (Onode, /** original node */ opts) => {
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
    if (context.length === dataLength) return;
    // first we add missing nodes, we use cloneNode to generate the web-component
    for (let i = context.length, a = dataLength; i < a; i++) {
      let node;
      node = document.createElement(context.name, { is: Onode.extends });
      node.setOgone({
        index: i,
        originalNode: false,
        level: Onode.ogone.level,
        position: Onode.ogone.position,
        directives: Onode.ogone.directives,
        orinal: Onode,
        ...(!callingNewComponent ? { component: this } : {
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
        let lastEl = context[i - 1].lastNode;
        if (lastEl && lastEl.isConnected) {
          lastEl.insertAdjacentElement("afterend", node);
        } else if (Onode && Onode.isConnected) {
          Onode.insertAdjacentElement("afterend", node);
        }
      }
      context.push(node);
    }
    // no need to remove if it's the same
    if (context.length === dataLength) return;
    // now we remove the extra elements
    for (let i = context.length, a = dataLength; i > a; i--) {
      if (context.length === 1) {
        // get the first element of the webcomponent
        let firstEl = context[0];
        if (firstEl && firstEl.firstNode && firstEl.firstNode.isConnected) {
          const { parentNode } = firstEl.firstNode;
          parentNode.insertBefore(context.placeholder, firstEl.firstNode);
        } else if (Onode.parentNode) {
          const { parentNode } = Onode;
          parentNode.insertBefore(context.placeholder, Onode);
        }
      }
      const rm = context.pop();
      // deactivate all the reactions of the component
      rm.removeNodes().remove();
    }
  };
}
