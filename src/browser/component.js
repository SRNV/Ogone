const host = location.host;
function OComponent() {
  this.contexts = {};
  this.context = {};
  this.nms = {}; /* NodeManager{} */
  this.events = {}; /* events describers */
  this.arrays = {}; /* data describer o-for */
  this.directRenders = {};
  this.texts = [];
  this.read = (ev) => {
    switch(ev.type) {
      case 'component':
          this.rootNode = ev.node || document.querySelector(`${ev.querySelector}:not([${ev.attr}])`);
          this.id = ev.id;
          this.render(ev);
          let gen = this.runtime();
          gen.next();
          const v = gen.next('init');
          Object.seal(this.data);
          const w = gen.next('mounted');
          const watchers = gen.next();
        break;
    }
  }
  this.update = (dependency) => {
    const nms = Object.values(this.nms);
    nms.filter((nm) => nm.state).reverse().forEach((nm) => {
      nm.update(dependency);
    });
  }
  this.render = (item) => {
    if (!item) return;
    if (this.rootNode) {
      Ogone.templates[item.attr](this, {
        ...item,
        hasNodeManager: true,
        parentNodeManager: item.parentNodeManager || this,
        nodeManager: null,
        index: 0,
        level: 0,
        position: [0],
        querySelector: this.id,
        callback: (template) => {
          this.rootNode.replaceWith(...template.childNodes);
        },
      });
      this.update(true);
    }
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