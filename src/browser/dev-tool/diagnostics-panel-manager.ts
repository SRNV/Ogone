Ogone.DiagnosticsPanelManager = new (class {
  constructor() {
      this.renderedDiagnosticsPanel = false;
      this.panels = null; // array
      this.diagnostics = null; // HTMLElement
      this.compContainer = null; // HTMLDivElement
      this.treeContainer = null; // HTMLDivElement
      this.itemTypeNode = null // HTMLDivElement
      this.itemName = null // HTMLDivElement
      this.data = null;
      this.actualItem = null; // ComponentCollectionManager
  }
  set subject(item) {
    this.renderCompPanel(item);
    this.renderTreePanel(item);
  }
  renderDiagnostics(item) {
    if (!item) return;
    this.setDiagnosticsPanel();
    this.data = JSON.stringify(item.ctx.data, null, '  ');
    this.subject = item;
  }
  setDiagnosticsPanel() {
    if (!this.renderedDiagnosticsPanel) {
      this.renderedDiagnosticsPanel = true;
      const el = Ogone.DevTool.document.createElement('div');
      el.classList.add('diagnostics-panel');
      this.panels = [
        {
          title: 'Tree',
          open: true,
          el: el.cloneNode(true),
        },
        {
          title: 'Component',
          open: false,
          el: el.cloneNode(true),
        },
        {
          title: 'Diagnostics',
          open: false,
          el: el.cloneNode(true),
        },
        {
          title: 'Application',
          open: false,
          el: el.cloneNode(true),
        },
        {
          title: 'DOM Actions',
          open: false,
          el: el.cloneNode(true),
        },
        {
          title: 'Files',
          open: false,
          el: el.cloneNode(true),
        },
      ];
      if (this.diagnostics) {
        const openClose = (title) => {
          this.panels.forEach((p) => {
            if (title) {
              if (p.title !== title) {
                p.el.classList.remove('diagnostics-panel-open');
                p.open = false;
              } else if(p.title === title && p.open) {
                p.el.classList.remove('diagnostics-panel-open');
                p.open = false;
              } else {
                p.el.classList.add('diagnostics-panel-open');
                p.open = true;
              }
            } else if (p.open) {
              p.el.classList.add('diagnostics-panel-open');
              p.open = true;
            }
          })
        }
        this.itemTypeNode = Ogone.DevTool.document.createElement('div');
        this.itemName = Ogone.DevTool.document.createElement('div');
        this.diagnostics.prepend(this.itemTypeNode);
        this.diagnostics.prepend(this.itemName);
        this.panels.forEach((p) => {
          const h5 = Ogone.DevTool.document.createElement('h5');
          h5.classList.add('title');
          h5.addEventListener('click', () => {
            openClose(p.title);
          });
          const text = new Text(' ');
          text.data = p.title;
          h5.append(text);
          this.diagnostics.append(h5);
          this.diagnostics.append(p.el);
        });
        openClose();
      }
    }
  }
  renderTreePanel(item) {
    if (!this.treeContainer) {
      this.treeContainer = Ogone.DevTool.document.createElement('div');
      this.treeContainer.classList.add('diagnostics-container');
    }
    if (this.treeContainer) {
      const panel = this.panels.find((p) => p.title === 'Tree');
      panel.el.innerHTML = '';
      this.treeContainer.innerHTML = '';
      panel.el.append(this.treeContainer);
      let parent = item.parent;
      const name = this.treeContainer.cloneNode();
      const typeFigure = Ogone.DevTool.document.createElement('span');
      typeFigure.classList.add('diagnostics-tree-type-figure');
      name.append(typeFigure);
      name.append(item.type === 'root' ? 'root-component' :`${item.name}`);
      name.addEventListener('mousemove', () => {
        Ogone.ComponentCollectionManager.treeRendering(item.key, true);
      });
      name.addEventListener('mouseleave', () => {
        Ogone.ComponentCollectionManager.treeRendering(item.key, false);
      });
      this.treeContainer.append(name);
      let precedingClone = name;
      while(parent) {
        const { key } = parent;
        const clone = Ogone.DevTool.document.createElement('div');
        clone.classList.add('diagnostics-container');
        precedingClone.style.cursor = 'pointer';
        precedingClone.insertAdjacentElement('beforebegin', clone);
        const cloneTypeFigure = typeFigure.cloneNode();
        cloneTypeFigure.classList.add(`diagnostics-${parent.type}`);
        clone.append(cloneTypeFigure);
        clone.append(parent.type === 'root' ? 'root-component' :`${parent.name}`);
        clone.addEventListener('mousemove', () => {
          Ogone.ComponentCollectionManager.treeRendering(key, true);
        });
        clone.addEventListener('mouseleave', () => {
          Ogone.ComponentCollectionManager.treeRendering(key, false);
        });
        clone.addEventListener('click', () => {
          this.renderDiagnostics(
            Ogone.ComponentCollectionManager.getItem(key)
          );
        });
        parent = parent.parent;
        precedingClone = clone;
      }
      typeFigure.classList.add(`diagnostics-${item.type}`);
    }
  }
  recursiveDetails(obj, prop = 'undefined') {
    const details = Ogone.DevTool.document.createElement('details');
    const summary = Ogone.DevTool.document.createElement('summary');
    const span = Ogone.DevTool.document.createElement('span');
    const div = Ogone.DevTool.document.createElement('div');
    const constructName = Ogone.DevTool.document.createElement('span');
    summary.append(prop);
    details.append(summary);
    span.classList.add(typeof obj);
    constructName.classList.add('constructor');
    details.classList.add('diagnostics-data-details');
    div.classList.add('diagnostics-data-container');
    switch(true) {
      case typeof obj === 'function':
        span.append('fn');
        div.append(prop, span);
        return div;
      case Array.isArray(obj):
        constructName.append(`${obj.constructor.name} (${obj.length})`);
        summary.classList.add('array');
        details.append(constructName, ' [');
        obj.forEach((value, i) => {
          const detail = this.recursiveDetails(value, i);
          detail.classList.add('array');
          details.append(
            detail
          );
        });
        details.append(']');
        break;
      case typeof obj === 'object':
        summary.classList.add(typeof obj);
        constructName.append(obj.constructor.name);
        details.append(constructName, ' {');
        Object.entries(obj).forEach(([key, value]) => {
          const detail = this.recursiveDetails(value, key)
          detail.classList.add('object');
          details.append(
            detail
          );
        });
        details.append('}');
        break;
      case typeof obj === 'string':
        span.append(obj);
        div.append(prop, span);
        return div;
      case typeof obj === 'boolean':
        span.append(obj);
        div.append(prop, span);
        return div;
      default:
        span.append(obj);
        div.append(prop, span);
        return div;
    }
    return details;
  }
  renderCompPanel(item) {
    if (!this.compContainer) {
      this.compContainer = Ogone.DevTool.document.createElement('div');
      this.compContainer.classList.add('diagnostics-container');
      const panel = this.panels.find((p) => p.title === 'Component');
      panel.el.append(this.compContainer);
    }
    if (this.compContainer) {
      this.compContainer.innerHTML = '';
      Object.entries(item.ctx.data)
        .forEach(([key, value]) => {
          let element = this.recursiveDetails(value, key);
          this.compContainer.append(
            element
          );
          item.ctx.react.push((dependency) => {
            if (this.actualItem !== item) return false;
            let newelement = this.recursiveDetails(item.ctx.data[key], key);
            if (dependency.indexOf(key) > -1) {
              element.replaceWith(newelement);
              element = newelement
            }
            return this.actualItem === item;
          })
        });
      this.itemTypeNode.className = `diagnostics-${item.type}`;
      this.itemName.innerHTML = '';
      this.itemName.append(item.type === 'root' ? '< root-component >' : `< ${item.name} >`);
    }
  }
})();