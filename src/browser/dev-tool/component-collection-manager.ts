// @ts-nocheck
// TODO fix all types here
export default class ComponentCollectionManager {
  static collection: Map<string, any> = new Map();
  static container: any = null;
  static informations: any = null;
  static isReady: boolean = false;
  static renderedDiagnosticsPanel: boolean = false;
  static getItem(key: string) {
      return this.collection.get(key);
  }
  static read(infos) {
    if (!this.collection.has(infos.key)) {
      this.subscribe(infos);
      if (Ogone.router.devtoolIsOpen) {
        this.update(infos.key);
      }
    } else {
      this.update(infos.key);
    }
  }
  static subscribe(infos) {
    let node;
    infos.childs = [];
    let parent = this.getItem(infos.parentNodeKey);
    infos.position = {
      x: 0,
      y: 0,
      delta: 0,
    };
    if (infos.type === 'root') {
      infos.position = {
        x: (720/2),
        y: 50,
      };
      node = createSVGComponent({
        href: '#component',
        position: infos.position,
        className: infos.type,
        modifier: infos.name || 'Root-Component',
      });
    } else if (infos.type !== 'element') {
      node = createSVGComponent({
        href: '#component',
        position: infos.position,
        className: infos.type,
        modifier: infos.name || 'Root-Component',
      });
    } else {
      node = createSVGComponent({
        href: '#element',
        position: infos.position,
        className: infos.type,
        modifier: infos.name,
      });
    }
    const item = {
        ...infos,
        parent,
        node,
    };
    this.collection.set(item.key, item);
    if (parent) {
      parent.childs.push(item);
    }
    this.saveReaction(item.key);
  }
  static setModifiers() {
    this.collection.forEach((item) => {
      this.setModifier(item.key);
    })
  }
  static setModifier(key) {
    if (!Ogone.DevTool) return;
    const modifier = Ogone.DevTool.document.createElement('div');
    modifier.classList.add('devtool-modifier');
    const text = new Text(' ');
    modifier.append(text);
    Ogone.DevTool.document.body.append(modifier);
    Ogone.DevTool.updateView = Ogone.DevTool.updateView || [];
    Ogone.DevTool.updateView.push((ev) => {
      const item = this.getItem(key);
      if (!item || !item.node || !Ogone.DevTool) return;
      const { figure } = item.node;
      if (!figure) return;
      if (!figure.getBoundingClientRect) return;
      const { sqrt, round } = Math;
      const bcr = figure.getBoundingClientRect();
      const lbcr = modifier.getBoundingClientRect();
      modifier.style.left = `${round(bcr.x - (lbcr.width/2) + (bcr.width / 2))}px`;
      modifier.style.top = `${round(bcr.y - (bcr.height * 1.7))}px`;
      const a = ev.clientX - bcr.x;
      const b = ev.clientY - bcr.y;
      const hyp = sqrt(a**2 + b**2);
      let name = item.type === 'root' ? '<root-component>' :`<$\{item.name}>`;
      if (text.data !== name) {
        text.data = name;
      }
      if (hyp < bcr.height * 2) {
        modifier.style.display  = 'block';
      } else {
        modifier.style.display = '';
      }
      return !!figure && figure.isConnected;
    });
  }
  static saveReaction(key) {
    const item = this.getItem(key);
    if (item && item.ctx && item.node && item.type !== 'element') {
      let timeout;
      item.ctx.react.push(() => {
        if (item.node) {
          clearTimeout(timeout);
          item.node.figure.classList.add('reaction');
          timeout = setTimeout(() => {
            item.node.figure.classList.remove('reaction');
          }, 1000);
        }
        return item.node && this.collection.has(item.key);
      })

    }
  }
  static update(key) {
    const item = this.getItem(key);
    if (item && item.node) {
      Ogone.ComponentCollectionManager.render();
    }
  }
  static updateDevToolView(ev) {
    if (!this.isReady) return;
    Ogone.DevTool.updateView.forEach((f, i, arr) => {
      if (f && !f(ev)) delete arr[i];
    })
  }
  static render() {
    const collection = Array.from(this.collection);
    const { PI, sin, cos, round, atan2 } = Math;
    collection.forEach(([,item]) => {
      let parent = item.parent;
      if (parent && parent.position && !parent.parent) {
        const { x, y } = setChildNodeAroundParent({
          parent,
          minRadius: 90,
          maxRadius: 1000,
          maxRadian: PI,
          child: item,
        });
        item.position.x = x;
        item.position.y = y;
        item.position.delta = parent.position.delta;
      }
      if (item.node) {
        if (this.container && !this.container.contains(item.node.element)) {
          this.container.append(item.node.element);
          item.node.element.addEventListener('mouseover', () => {
            this.informations.data = `${item.type}: $\{item.name} - id: $\{item.key} parent: $\{item.parentNodeKey}`;
          });
          item.node.element.addEventListener('dblclick', () => {
            if (Ogone.DiagnosticsPanelManager.actualItem === item) {
              Ogone.DiagnosticsPanelManager.diagnostics.classList.toggle('diagnostics-open');
            } else {
              Ogone.DiagnosticsPanelManager.actualItem = item;
              Ogone.DiagnosticsPanelManager.diagnostics.classList.add('diagnostics-open');
            }
            if (Ogone.DiagnosticsPanelManager.diagnostics.classList.contains('diagnostics-open')) {
              Ogone.DiagnosticsPanelManager.renderDiagnostics(item);
            }
          });
          item.node.element.addEventListener('click', () => {
            if (Ogone.DiagnosticsPanelManager.diagnostics.classList.contains('diagnostics-open')) {
              Ogone.DiagnosticsPanelManager.renderDiagnostics(item);
              Ogone.DiagnosticsPanelManager.actualItem = item;
            }
          });
          item.node.element.addEventListener('mousemove', () => {
            Ogone.ComponentCollectionManager.treeRendering(item.key, true);
          });
          item.node.element.addEventListener('mouseleave', () => {
            Ogone.ComponentCollectionManager.treeRendering(item.key, false);
          });
        }
        item.node.setPosition(item.position);
      }
    });
    function orientItem(item) {
      if (item.parent && item.parent.parent) {
        const parent = item.parent;
        const greatParent = item.parent.parent;
        const rad = atan2(
          parent.position.y - greatParent.position.y,
          parent.position.x - greatParent.position.x,
        );
        const radDecay = ((PI * 0.12) * (parent.childs.length));
        const { x, y } = setChildNodeAroundParent({
          parent,
          minRadius: 90 + (60 * item.childs.length),
          maxRadius: 1000 + (60 * item.childs.length),
          minRadian: rad * 2/3,
          maxRadian: PI - (PI - rad/2),
          child: item,
        });
        item.position.x = x;
        item.position.y = y;
        item.position.delta = parent.position.delta;
      }
      if (item.node) {
        item.node.setPosition(item.position);
      }
    }
    collection.forEach(([, item]) => {
      if (item.childs.length) {
        item.childs.forEach((c) => {
          orientItem(c)
        })
      }
      orientItem(item);
    });
    collection.forEach(([, item]) => {
      let parent = item.parent;
      if (item.node && parent) {
        const pointAroundParent = getPointAroundElementFromOrigin({
          destination: parent.position,
          origin: item.position,
          radius: 70,
          decay: PI,
        });
        const pointAroundChild = getPointAroundElementFromOrigin({
          origin: parent.position,
          destination: item.position,
          radius: 70,
          decay: PI,
        });
        if (!(Number.isNaN(pointAroundChild.x) && Number.isNaN(pointAroundChild.y))) {
          item.node.lineToParent.setAttribute('x1', pointAroundChild.x + 50/2);
          item.node.lineToParent.setAttribute('y1', pointAroundChild.y + 50/2);
        }
        if (!(Number.isNaN(pointAroundParent.x) && Number.isNaN(pointAroundParent.y))) {
          item.node.lineToParent.setAttribute('x2', pointAroundParent.x + 50/2);
          item.node.lineToParent.setAttribute('y2', pointAroundParent.y + 50/2);
        }
        item.node.lineToParent.classList.add(item.type);
      }
    })
    this.isReady = true;
  }
  treeRendering(key, styling) {
    const item = this.getItem(key);
    if (!item) return;
    let target = item;
    while(target) {
      if (styling) {
        target.node.figure.style.stroke = '#ceff50';
        target.node.lineToParent.style.stroke = '#ceff50';
        target.node.lineToParent.style.strokeWidth = '10px';
        target.node.figure.style.strokeWidth = '10px';
      } else {
        target.node.figure.style.stroke = '';
        target.node.lineToParent.style.stroke = '';
        target.node.lineToParent.style.strokeWidth = '';
        target.node.figure.style.strokeWidth = '';
      }
      target = target.parent;
    }
  }
  destroy(key) {
    const item = this.getItem(key);
    if (item && item.node && item.node.element) {
      item.node.element.remove();
      item.node.figure.remove();
    }
    if (item && item.childs.length) {
      item.childs.forEach((c, i, arr) => {
        this.destroy(c.key)
      });
      item.childs.splice(0);
      let parent = this.getItem(item.parentNodeKey ? item.parentNodeKey : '');
      if (!parent && item.parentCTX) {
        parent = this.getItem(item.parentCTX.key);
      }
      if (parent) {
        parent.childs.splice(
          parent.childs.indexOf(item),
          1
        );
      }
    }
    this.collection.delete(key);
  }
};