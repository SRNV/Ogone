const { parse } = require('node-html-parser');
const uuid = require('uuid-node');
const runtime = require('./runtime');
const send = require('./send');
const setTextNodes = require('./setTextNodes');
const render = require('./render');
const sendEvents = require('./sendEvents');
const renderSubComponent = require('./renderSubComponent');
const { renderContexts, setGetContext } = require('./renderContexts');
const triggerEvent = require('./triggerEvent');
const getProxy = require('./getProxy');
const clean = require('./clean');

function OComponent(entrypoint, querySelector, o, websocket) {
  const component = o.components.get(entrypoint);
  if (!component) return;
  try {
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
    this.getContext = {};
    this.intervals = [];
    this.timeouts = [];
    this.immediates = [];
    this.reactive = this.item.reactive;
    this.setTextNodes = setTextNodes.bind(this);
    this.runtime = runtime.bind(this);
    this.send = send.bind(this);
    this.render = render.bind(this);
    this.renderSubComp = renderSubComponent.bind(this);
    this.sendEvents = sendEvents.bind(this);
    this.triggerEvent = triggerEvent.bind(this);
    this.renderContexts = renderContexts.bind(this);
    this.setGetContext = setGetContext.bind(this);
    this.clean = clean.bind(this);
    o.onclose.push(() => {
      this.clean();
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
    this.load = () => {
      try {
        // this.reactivity = false;
        Object.entries(component.data).forEach(([key, value]) => {
          this.proxy[key] = value;
        });
        // this.reactivity = true;
      } catch (e) {
        console.error(e)
      }
    };
    this.proxy = getProxy.bind(this)();
    this.setGetContext();
    this.renderContexts();
    this.setTextNodes();
    
    // rendering the component
    this.render(querySelector);
    this.runtime('o-init');
    this.renderSubComp();
  } catch(ComponentException) {
    console.error(ComponentException);
  }
};
module.exports = OComponent;