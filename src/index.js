const { parse } = require('node-html-parser');
const uuid = require('uuid-node');

function OComponent(entrypoint, querySelector, o, websocket) {
  const component = o.components.get(entrypoint);
  if (!component) return;
  this.ws = websocket;
  this.uuid = uuid.generateUUID().split('-')[0];
  this.path = `/${this.uuid}`;
  this.id = `data-${this.uuid}`;
  this.item = Object.assign(component, {});
  this.rootNode = parse(this.item.rootNodePure.toString());
  this.data = { ...this.item.data };
  this.modules = component.modules;
  this.textNodes = [];
  this.watchers = {};
  this.reactivity = true;
  this.contexts = {};
  const texts = this.item.dom.filter((item) => item.type === 3 && item.rawText.length);
  texts.forEach((t) => {
    const query = t.querySelector.trim();
    const node = query.length !== 0 ?
      this.rootNode.querySelector(query) :
      this.rootNode;
      if (node) {
        const text = node.childNodes[t.id];
        if (text && text.nodeType === 3) {
          text.querySelector = t.querySelector;
          text.id = t.id;
          this.textNodes.push(text);
        }
    }
  });
  this.reactive = this.item.reactive;
  this.proxy = new Proxy(this.data, {
    get(obj, prop) {
      return obj[prop];
    },
    set: (obj, prop, value) => {
      if (this.ws.readyState === 3) {
        Reflect.deleteProperty(obj, prop);
        return true;
      }
      if (obj[prop] === value || this.ws.readyState !== 1) {
        return true;
      }
      const oldValue = obj[prop];
      obj[prop] = value;
      if (!this.reactivity) return true;
      if (prop in this.watchers && typeof this.watchers[prop] === 'function') {
        this.watchers[prop](oldValue, value);
      }
      this.textNodes
        .forEach((t) => {
          if (t.data.indexOf(prop) === -1) return;
          try {
            const newtext = (function() { return eval(`\`${t.data}\``) }).bind(obj)();
            if (newtext !== t.text) {
              this.send({
                value: newtext.trim(),
                textId: t.id,
                id: this.id,
                type: 'text',
                querySelector: t.querySelector
              })
              t.text = newtext;
            }
          } catch(textNodeEvaluationException) {
            throw textNodeEvaluationException;
          }
        });
        if (this.reactive[prop]) {
          this.reactive[prop].forEach((query, i) => {
            this.send({
              value,
              querySelector: query,
              type: 'bind',
              id: this.id,
            });
          });
        }
    },
  });
  this.runtime = (event) => {
    if (!this.item.scripts[event]) return;
    try {
      const Render = (ref, html) => {
        try {
          if (ref.length && !this.item.refs[ref]) {
            return;
          }
          const querySelector = this.item.refs[ref] || false;
          let result = html;
          if (Array.isArray(html)) {
            result = html.join('');
          }
          if (html instanceof Function) {
            result = html();
          }
          const oElementId = `o-${(querySelector || '').trim().replace(/([^a-zA-Z0-9]*)+/gi, '') || ''}-rd`;
          this.send({
            id2: oElementId,
            html: result.replace(/%%id%%/gi, `${this.id} ${oElementId}`),
            querySelector: !!querySelector ? 
              `[${this.item.uuid}][${this.id}] > ${querySelector.trim()}`:
              null,
            type: 'render',
            id: this.id,
          });
        } catch(e) {
          throw e;
        }
      };
      const Pragma = (name, attr, ...childs) => {
        try {
          let attrs = [];
          if (attr) {
            attrs = Object.entries(attr).map(([key, value]) => {
              if (key.slice(0, 2) === '$$') {
                return;
              }
              return `${key}="${value}"`
            })
          }
          const element = `<${name} %%id%% ${component.uuid} ${attrs.join(' ')}>${childs.flat().join(' ')}</${name}>`
          // direct rendering with $$ references
          if (attr) {
            const ref = Object.entries(attr).find(([key]) => key.slice(0, 2) === '$$');
            if (ref) {
              const id = ref[0].slice(2);
              Render(id, element);
              return id;
            }
          }
          return element;
        } catch(e) {
          throw e;
        }
      };
      const oc = this;
      const Watcher = function(prop, w){
        oc.watchers[prop] = w;
      };
      this.item.scripts[event].bind(this.proxy)(
        Pragma, 
        Render,
        Watcher,
        this.modules);
    } catch(e) {
      throw e;
    }
  };
  this.send = (json) => {
    if(this.ws.readyState === 1){
      this.ws.send(JSON.stringify(json));
    }
  };
  this.render = () => {
    this.send({
      querySelector,
      type: 'component',
      attr: this.item.uuid,
      id: this.id,
      html: this.rootNode.toString(),
      data: this.data,
    });
  };

  this.load = () => {
    this.reactivity = false;
    Object.entries(this.item.data).forEach(([key, value]) => {
      this.proxy[key] = value;
    });
    this.reactivity = true;
  };
  this.textNodes.forEach((el) => {
    el.data = el.rawText;
    const text = (function() {
      try {
        const val = eval(`\`${el.rawText}\``)
        return val;
      } catch(e) {
        throw e;
      }
    }).bind(this.proxy)();
    el.rawText = text;
    el.text = text;
  });
  this.renderSubComp = () => {
    const entries = Object.entries(this.item.imports);
    entries.forEach(([path, querySelector]) => {
      const nodes = this.rootNode.querySelectorAll(querySelector);
      if (nodes && nodes.length) {
        nodes.forEach((node) => {
          new OComponent(path, `[${this.id}][${this.item.uuid}] ${querySelector}`, o, websocket);
        });
      }
    })
  };
  this.sendEvents = () => {
    this.send({
      type: 'events',
      events: this.item.directives,
      id: this.id,
    });
  };
  this.triggerEvent = (msg) => {
    const node = this.item.directives
      .find((d) => d.querySelector === msg.querySelector);
    if (node) {
      const event = node.directives.find((d) => d[0] === msg.event);
      if (event && event[1] instanceof Function) {
        switch(event[0]) {
          case 'model':
            event[1].bind(this.proxy)(msg.value);
            break;
          default: 
            event[1].bind(this.proxy)();
            break;
        }
      }
    }
  };
  o.onclose.push(() => {
    this.runtime('o-close');
  });
  o.onmessage[this.id] = (msg) => {
    switch(msg.type) {
      case 'load':
        this.load();
        break;
      case 'o-inserted':
        this.sendEvents();
        break;
      case 'event':
      this.triggerEvent(msg);
        break;
      default:
        this.runtime(msg.type);
        break;

    }
  };
  this.startRenderForDirective = () => {
    const dir = this.item.directives;
    dir.forEach(({ querySelector, directives }) => {
      const forDirectives = directives.filter((directive) => directive[0] === 'for');
      forDirectives.forEach(([type, context]) => {
        this.renderForDirective(querySelector, context.array);
      })
    })
  };
  this.renderForDirective = (querySelector, arrayName) => {
    const forD = this.item.for;
    const el = forD[querySelector];
    const array = el.getter.bind(this.proxy)(querySelector, this);
    if (array === null) {
      const invalidArrayNameException = new Error(`[Ogone] ${arrayName} is not an instance of Array | Object | Iterator`);
      console.error(invalidArrayNameException);
      return;
    }
    const entries = Object.entries(el.context);
    for(i = 0; i < array.length; i++) {
      entries.forEach(([key, value]) => {
        const newvalue = value.bind(this.proxy)(i, array);
        if (newvalue === null || newvalue === undefined) {
          return;
        }
        if (!this.contexts[key]) {
          this.contexts[key] = [];
        }
        this.contexts[key][i] = newvalue;
      });
    }
    console.warn(this.contexts);
  };
  this.render();
  this.runtime('o-init');
  this.startRenderForDirective();
  this.renderSubComp();
};
module.exports = OComponent;