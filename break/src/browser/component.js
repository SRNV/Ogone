const host = location.host;
function OComponent() {
  this.contexts = {};
  this.context = {};
  this.events = {}; /* events describers */
  this.arrays = {}; /* data describer o-for */
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
    let gen = this.runtime();
    gen.next();
    const v = gen.next('init');
    Object.seal(this.data);
    const w = gen.next('mounted');
    const watchers = gen.next();
  };
  this.update = (dependency) => {
    this.texts.forEach((t) => t(dependency));
    this.childs.forEach((c) => {
      c.updateProps(dependency);
    })
    /*
    const nms = Object.values(this.nms);
    nms.filter((nm) => nm.state).reverse().forEach((nm) => {
      nm.update(dependency);
    });
    */
  }
  this.updateProps = (dependency) => {
    if (!this.requirements || !this.props) return;
    this.requirements.forEach(([key, constructors]) => {
      const prop = this.props.find((prop) => prop.name === key);
      const isAny = constructors.includes(null);
      if (!prop && !isAny) {
        const UndefinedPropertyForComponentException = new Error(`[Ogone] ${key} is required as property but undefined in template. Please use following syntax\n\t\t<component :${key}="..."></component>`);
        throw UndefinedPropertyForComponentException;
      }
      const value = this.parentContext({
        getText: `${prop.value}`,
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
  this.renderElements = (html) => {
    const template = document.createElement('template');
    template.insertAdjacentHTML('beforeend', html);
    return Array.from(template.childNodes).filter((c) => c.nodeType !== 3);
  };
  this.renderDirectRender = (item) => {
    if (!item) return;
    if (this.directRenders[item.id2]) {
      const newel = this.renderElements(item.html)[0];
      this.directRenders[item.id2].replaceWith(newel);
      this.directRenders[item.id2] = newel;
      return;
    }
    if (item.querySelector === null) {
      const el = this.rootNode[0];
      const newel = this.renderElements(item.html)[0];
      el.replaceWith(newel);
      this.directRenders[item.id2] = newel;
      this.rootNode.slice(1).forEach((c) => c.remove());
      return;
    }
    this.rootNode.every((child) => {
      const el = child.querySelector(item.querySelector);
      if (el) {
        const newel = this.renderElements(item.html)[0];
        el.replaceWith(newel);
        this.directRenders[item.id2] = newel;
        return;
      }
    })
  }
}