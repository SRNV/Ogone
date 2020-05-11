
function OComponent() {
  this.contexts = {
    for: {},
  };
  /* events describers */
  this.events = {};
  /*
    all nodes that's are dynamics will save a function into this property
    like if we have
      <node --for="array as (el, i)" />
    this node will register a function() { ... } that will be triggered each time there is an update
  */
  this.react = [];
  this.directRenders = {};
  this.texts = [];
  this.childs = [];
  this.read = (ev) => {
    switch(ev.type) {
      case 'component':
        this.id = ev.id;
    }
  }
  this.startLifecycle = () => {
    // WIP
    this.runtime('init');
    Object.seal(this.data);
  };
  this.update = (dependency) => {
    this.reactTo(dependency);
    this.renderTexts(dependency);
    this.childs.forEach((c) => {
      c.updateProps(dependency);
    })
  }
  this.renderTexts = (dependency) => {
    this.texts.forEach((t, i, arr) => {
      // if there is no update of the texts
      // this can be the reason why
      if (t && !t(dependency)) delete arr[i];
    });
  }
  this.reactTo = (dependency) => {
    this.react.forEach((t, i, arr) => {
      if (t && !t(dependency)) delete arr[i];
    })
  }
  this.updateProps = (dependency) => {
    if (!this.requirements || !this.props) return;
    this.requirements.forEach(([key, constructors]) => {
      const prop = this.props.find((prop) => prop[0] === key);
      const isAny = constructors.includes(null);
      if (!prop && !isAny) {
        const UndefinedPropertyForComponentException = new Error(`[Ogone] ${key} is required as property but undefined in template. Please use following syntax\n\t\t<component :${key}="..."></component>`);
        throw UndefinedPropertyForComponentException;
      }
      console.warn(this.positionInParentComponent, this);
      const value = this.parentContext({
        getText: `${prop[1]}`,
        position: this.positionInParentComponent,
      });
      if ((value === undefined || value === null)  && !isAny) {
        const NullishPropertyException = new Error(`[Ogone] ${key} is required as property but can\'t be null. Please use following syntax\n\t\t<component :${key}="${constructors.join(' | ')}"></component>`);
        throw NullishPropertyException;
      }
      if (!constructors.includes(value.constructor.name)) {
        const PropertyDontMatchWithConstructorsException = new Error(`[Ogone] ${key} is required as property but it's value is not one of ${constructors.join(' | ')}`);
        throw PropertyDontMatchWithConstructorsException;
      }
      if (value !== this.data[key]) {
        this.data[key] = value;
        this.update(key);
      }
    })
  }
  this.render = (Onode /** original node */, opts) => {
    // Onode is a web component
    // based on the user token
    // this web component is a custom Element
    // not an extension of an element cause the attr "is" is not dynamic
    // at the first call of this function Onode is not "rendered" (replaced by the required element)
    const { key, callingNewComponent, length: dataLength } = opts;
    if (!this.contexts.for[key]) {
      this.contexts.for[key] = [Onode];
      this.contexts.for[key].placeholder = new Comment();
      this.contexts.for[key].name = Onode.name;
    }
    const context = this.contexts.for[key];
    // first we add missing nodes, we use cloneNode to generate the web-component
    for (let i = context.length, a = dataLength;i < a; i++) {
      const node = document.createElement(context.name);
      node.index = i;
      node.ogone.originalNode = false;
      node.position = Onode.position;
      node.level = Onode.level;
      if (callingNewComponent) {
        node.props = Onode.props;
        node.parentComponent = Onode.parentComponent;
        node.parentCTXId = Onode.parentCTXId;
        node.positionInParentComponent = Onode.positionInParentComponent.slice();
        node.levelInParentComponent = Onode.level;
      } else {
        node.component = this;
      }
      if (i === 0) {
        context.placeholder.replaceWith(node);
      } else {
        let lastEl = context[i-1].lastNode;
        if (lastEl && lastEl.isConnected) {
          lastEl.insertAdjacentElement('afterend', node);
        } else if (Onode && Onode.isConnected) {
          Onode.insertAdjacentElement('afterend', node);
        }
      }
      context.push(node);
    }
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
      context.pop().removeNodes().remove();
    }
  }
}
