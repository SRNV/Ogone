// @ts-nocheck
const getClassExtends = (klass) => (class extends (klass) {
    get firstNode() {
      const o = this.ogone, oc = o.component;
      return o.nodes[0];
    }
    get lastNode() {
      const o = this.ogone;
      return o.nodes[o.nodes.length - 1];
    }
    get extends() {
      const o = this.ogone;
      return `${o.uuid}${o.extends}`;
    }
    get name() {
      const o = this.ogone, oc = o.component;
      return this.isComponent ? 'template' : this.tagName.toLowerCase();
    }
    get isComponent() {
      const o = this.ogone;
      return o.isTemplate;
    }
    get isRecursiveConnected() {
      return this.firstNode.isConnected && this.lastNode.isConnected;
    }
    get isConnected() {
      if (!this.firstNode) {
        return false;
      }
      return !!this.ogone.nodes.find((n) => n.isConnected);
    }
    get context() {
      const o = this.ogone, oc = o.component;
      if (!oc.contexts.for[o.key]) {
        oc.contexts.for[o.key] = {
          list: [this],
          placeholder: document.createElement('template'),
          parentNode: this.parentNode,
          name: this.name,
        };
      }
      return oc.contexts.for[o.key];
    }
    constructor () {
      super();
      if (!Ogone.root) {
        this.setOgone({ isRoot: true, isTemplate: true });
        Ogone.root = this;
      }
    };
    construct() {
      const o = this.ogone;
      this.dependencies = o.dependencies;
      if (o.isTemplate) {
        this.positionInParentComponent = [];
        o.component = new Ogone.components[o.uuid]();
        o.component.requirements = o.requirements;
        o.component.dependencies = o.dependencies;
        o.component.type = o.type;
        // define runtime for hmr
        // Ogone.run[o.uuid] = Ogone.run[o.uuid] || [];
      }
      // define templates of hmr
      // Ogone.mod[this.extends] = Ogone.mod[this.extends] || [];
    }
    connectedCallback (){
      const o = this.ogone;
      // set position of the template/component
      this.setPosition();

      // set the context of the node
      this.setContext();
      // this.setHMRContext();

      // parse the route that match with location.pathname
      if (o.type === "router") {
        this.setActualRouterTemplate();
      }

      // set the props required by the node
      if (o.isTemplate) {
        this.setProps();
        o.component.updateProps();
      }
      this.renderingProcess();

      // now ... just render ftw!
      switch(true) {
        case o.type === "router": this.renderRouter(); break;
        case o.type === "store": this.renderStore(); break;
        case o.type === "async": this.renderAsync(); break;
        default: this.render(); break;
      }
    }
  });
  export default getClassExtends.toString();