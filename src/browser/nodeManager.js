function NodeManager(component, node, opts) {
  this.state = 3;
    /*
      3 created
      2 paused
      1 node has parentNode
      0 dead
    */
  this.type = opts.type;
  this.isRootNode = !opts.querySelector.length;
  this.parentId = opts.parentId;
  this.templateId = opts.templateId;
  this.templateUuid = opts.templateUuid;
  this.querySelector = opts.querySelector;
  this.uuid = opts.uuid;
  this.component = component;
  this.node = node;
  this.nodes = [node];
  this.array = opts.array;
  this.componentUuid = opts.componentUuid;
  this.placeholder = new Comment('');
  this.position = `${this.parentId} [${this.uuid}]`;
  this.texts = {};
  this.getContext = null;
  this.tree = opts.position;
  this.level = opts.level;
  this.positions = {};
  this.amount = 1;
  this.childs = [];
  this.parentNodeManager = opts.parentNodeManager;
  this.requirement = opts.requirement;
  this.props = opts.props;
  this.dependencies = opts.dependencies;
  if (this.isRootNode) {
    this.component.nms.root = this;
  } else {
    if (this.component.nms[this.position]) {
      this.component.nms[this.position].state = 0
    }
    this.component.nms[this.position] = this;
  }
}
NodeManager.prototype.render = function() {
  if (this.state !== 1 || this.amount === undefined) return;
  for (let i = this.nodes.length, a = this.amount; i > a; i--) {
    if (this.nodes.length === 1) {
      const firstEl = this.nodes[0];
      if (firstEl) {
        const { parentNode } = firstEl;
        parentNode.insertBefore(this.placeholder, firstEl);
      }
    }
    const removedEl = this.nodes.pop();
    removedEl.remove();
  }
  if (this.nodes.length < this.amount) {
    if (this.nodes.length === 1) {
      this.nodes[0].replaceWith(this.placeholder);
      this.nodes[0].remove();
      this.nodes.shift();
    }
  }
  for (let i = this.nodes.length, a = this.amount;i < a; i++) {
    Ogone.templates[`${this.templateId}`](this.component, {
      nodeManager: this,
      hasNodeManager: false, 
      index: i,
      parentId: this.parentId,
      position: this.tree,
      level: this.level,
      callback: (el, uuid) => {
        if (i === 0) {
          this.placeholder.replaceWith(el);
        } else {
          this.nodes[i-1].insertAdjacentElement('afterend', el);
        }
        this.nodes.push(el);
        this.component.nms[`${this.parentId} [${uuid}]`] = this;
      }, 
    });  
  }

}
NodeManager.prototype.addEventListeners = function() {};
NodeManager.prototype.updateProps = function(dependency) {
  if (!this.requirement) return;
  this.requirement.map(([key, constructors]) => {
    const prop = this.props.find((prop) => prop.savedName === key);
    const isAny = constructors.includes(null);
    if (!prop && !isAny) {
      const UndefinedPropertyForComponentException = new Error(`[Ogone] ${key} is required as property but undefined in template. Please use following syntax\n\t\t<component :${key}="..."></component>`);
      throw UndefinedPropertyForComponentException;
    }
    const value = this.parentNodeManager.getContext({
      getText: `${prop.value}`,
      position: this.tree,
    });
    if ((value === undefined || value === null)  && !isAny) {
      const NullishPropertyException = new Error(`[Ogone] ${key} is required as property but can\'t be null. Please use following syntax\n\t\t<component :${key}="${constructors.join(' | ')}"></component>`);
      throw NullishPropertyException;
    }
    if (!constructors.includes(value.constructor.name)) {
      const PropertyDontMatchWithConstructorsException = new Error(`[Ogone] ${key} is required as property but it's value is not one of ${constructors.join(' | ')}`);
      throw PropertyDontMatchWithConstructorsException;
    }
    if (value !== this.component.data[key]) {
      this.component.data[key] = value;
      this.component.update(key);
    }
  })
};
NodeManager.prototype.update = function(dependency) {
  // manage NM states and force render
  this.updateProps(dependency);
  if (!(dependency instanceof Boolean) &&
    this.dependencies.length &&
    !this.dependencies.includes(dependency)) {
    return;
  }
  switch(true) {
    case this.state === 3 /* created */
      && !this.isRootNode:
      this.state = 1; /* inserted */
      this.setAmountOfNodes();
      this.render();
      this.getTexts();
      this.addEventListeners();
    break;
    case this.state === 1 && !this.isRootNode:
      this.setAmountOfNodes();
      this.render();
      this.getTexts();
      break;
    }
    this.updateChilds(dependency);
}
NodeManager.prototype.updateChilds = function(dependency) {
  this.childs.forEach((nmChild) => {
    if (nmChild.state === 0) return;
    nmChild.update(dependency);
  });
}
NodeManager.prototype.getTexts = function() {
  // get nm text
  Object.values(this.texts).forEach((text) => {
    const value = this.getContext({
      getText: `\`${text.rawText}\``,
      position: this.positions[text.uuid],
    });
    if (text.data !== value) {
      text.data = value;
    }
  })
}
NodeManager.prototype.setAmountOfNodes = function() {
  if (!this.getContext) return;
  this.amount = this.getContext({
    query: this.querySelector,
    getLength: true,
  });
}