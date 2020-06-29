export default (opts: any) => `
Ogone.DiagnosticsPanelManager = new (class {
    constructor() {
        this.renderedDiagnosticsPanel = false;
        this.panels = null; // array
        this.diagnostics = null; // HTMLElement
        this.diagContainer = null; // HTMLDivElement
        this.treeContainer = null; // HTMLDivElement
        this.itemTypeNode = null // HTMLDivElement
        this.itemName = null // HTMLDivElement
    }
    set subject(item) {
      this.renderDiagPanel(item);
      this.renderTreePanel(item);
    }
    set data(value) {

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
            title: 'Component',
            open: false,
            el: el.cloneNode(true),
          },
          {
            title: 'Async Components',
            open: false,
            el: el.cloneNode(true),
          },
          {
            title: 'Router',
            open: false,
            el: el.cloneNode(true),
          },
          {
            title: 'Store',
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
        name.append(item.type === 'root' ? 'root-component' :\`$\{item.name}\`);
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
          const clone = this.treeContainer.cloneNode(false);
          precedingClone.style.cursor = 'pointer';
          precedingClone.insertAdjacentElement('beforebegin', clone);
          clone.append(parent.type === 'root' ? 'root-component' :\`$\{parent.name}\`);
          clone.addEventListener('mousemove', () => {
            Ogone.ComponentCollectionManager.treeRendering(key, true);
          });
          clone.addEventListener('mouseleave', () => {
            Ogone.ComponentCollectionManager.treeRendering(key, false);
          });
          parent = parent.parent;
          precedingClone = clone;
        }

      }
    }
    renderDiagPanel(item) {
      if (!this.diagContainer) {
        this.diagContainer = Ogone.DevTool.document.createElement('div');
        this.diagContainer.classList.add('diagnostics-container');
        const panel = this.panels.find((p) => p.title === 'Diagnostics');
        panel.el.append(this.diagContainer);
      }
      if (this.diagContainer) {
        this.diagContainer.innerText = item.type === 'root' ? '< root-component >' : \`< $\{item.name} >\`;
        this.itemTypeNode.className = \`diagnostics-$\{item.type}\`;
        this.itemName.innerHTML = '';
        this.itemName.append(item.type === 'root' ? '< root-component >' : \`< $\{item.name} >\`);
      }
    }
})();
`;