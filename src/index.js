const path = require('path');
const { parse } = require('node-html-parser');
const fs = require('fs');
const uuid = require('uuid-node');
const OgoneHTML = new Map();
const Ogone = new Map();
const directives = [
  'o-if',
  'o-else',
  'o-for',
  'o-click',
  'o-mousemove',
  'o-mousedown',
  'o-mouseup',
  'o-mouseleave',
  'o-dblclick',
  'o-drag',
  'o-dragend',
  'o-dragstart',
  'o-model',
  'o-transform',
  'o-html',
  'o-input',
];

function OComponent(entrypoint, ws, id) {
  const htmlPath = `${entrypoint}/index.html`;
  const dataPath = `${entrypoint}/index.json`;
  const normalizedPath = path.normalize(htmlPath);
  let html, configData = {};
  if (!fs.existsSync(htmlPath)) return null;
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, { encoding: 'utf8' });
    configData = JSON.parse(data);
  }
  if (!OgoneHTML.has(normalizedPath)) {
    html = fs.readFileSync(htmlPath, { encoding: 'utf8' });    
    OgoneHTML.set(normalizedPath, html)
  } else {
    html = OgoneHTML.get(normalizedPath);
  }
  this.id = id || `data-${uuid.generateUUID().split('-')[0]}`;
  Ogone.set(this.id, {
    validate: false,
    html: '',
    texts: [],
  });
  this.reactive = {};
  Object.entries(configData).forEach(([key, value]) => {
    this.reactive[key] = [];
  });
  this.proxy = new Proxy(configData, {
    get(obj, prop) {
      return obj[prop];
    },
    set: (obj, prop, value) => {
      if (obj[prop] === value || ws.readyState !== 1) {
        return true;
      }
      const item = Ogone.get(this.id);
      item.validate = false;
      obj[prop] = value;
      item.texts
        .filter(t => t.data.indexOf(prop) !== -1)
        .forEach((t) => {
          const newtext = (function() { return eval(`\`${t.data}\``) }).bind(obj)();
          if (newtext !== t.text) {
            const json = JSON.stringify({
              data: newtext,
              type: 'text',
              querySelector: t.query,
              id: t.id,
              renderUUID: this.id,
            });
            ws.send(json);
          }
        });
      if (this.reactive[prop]) {
        this.reactive[prop].forEach((querySelector) => {
          const reaction = JSON.stringify({
            querySelector,
            value,
            type: 'bind',
          });
          ws.send(reaction);
        });
      }
      return true;
    }
  });
  const mapped = normalizedPath.replace(/([\.\\]*)+/gi, '');
  this.renderUUID = `data-${mapped}`;
  this.setRootNode = (h, options) => {
    this.rootNode = parse(h, options);
  };
  this.render = () => {
    const item = Ogone.get(this.id);
    if (ws.readyState !== 1) {
      return item.html;
    }
    if (item.validate) {
      return item.html;
    }
    const render = this.rootNode.toString();
    item.html = render;
    item.validate = true;
    return render;
  };
  this.renderSubComponents = () => {
    const comments = this.rootNode.childNodes.filter(node => node.nodeType === 8);
    const reg = /([a-zA-Z0-9\-]*)+(\s)(from)(\s)([\.\/a-zA-Z0-9]*)+/gi;
    comments
      .filter(comment => comment.rawText.match(reg))
      .forEach((imported) => {
        const instruction = imported.rawText;
        const importSyntax =  /([a-zA-Z0-9\-]*)+(\s)(from)(\s)([\.\/a-zA-Z0-9]*)+/gi.exec(instruction);
        if (!importSyntax) return;
        const elements = this.rootNode.querySelectorAll(importSyntax[1]);
        const pathComponent = importSyntax[5];
        elements.forEach((element) => {
          const pathC = `${entrypoint}/${pathComponent}`;
          const component = new OComponent(pathC, ws);
          element.setAttribute(component.id, '');
          element.setAttribute(component.renderUUID, '');
          const json = JSON.stringify({
            type: 'render',
            html: component.render(),
            querySelector: `[${component.id}]`,
            on: this.id,
            renderUUID: component.id,
          });
          ws.send(json);
        });
      });
  };
  this.renderScripts = () => {
    const scripts = this.rootNode.childNodes.filter(node => node.tagName === 'script');
    scripts.forEach((element) => {
      const script = element.innerHTML;
      if (element.hasAttribute('abstract')) {
        (function(){ eval(script) }).bind(this.proxy)();
      }
    });
  };
  this.cleanRender = () => {
    this.rootNode.childNodes.forEach((node, id) => {
      if (node.tagName === 'style') this.rootNode.childNodes.splice(id, 1);
      if (node.tagName === 'script') this.rootNode.childNodes.splice(id, 1);
      if (node.nodeType === 8) this.rootNode.childNodes.splice(id, 1);
    });
  };
  this.renderStyles = () => {
    const styles = this.rootNode.childNodes.filter(node => node.tagName === 'style');
    styles.forEach((element) => {
      const css = element.text.replace(/(\[)(scope)(\])/gi, `[${this.renderUUID}]`);
      const json = JSON.stringify({
        type: 'style',
        cssUUID: this.renderUUID,
        css,
      });
      ws.send(json);
    });
  };
  this.inspectTextChanges = (node, structure = '') => {
    let query = '';
    if (node.tagName) {
      query = `${structure} ${node.tagName}`;
    } else {
      query = `[${this.id}]`
    }
    if (node.childNodes.length) {
      node.childNodes
        .forEach((el, id) => {
          if (['script', 'style'].includes(el.tagName)) return;
          if (el.nodeType === 3 && el.rawText.trim().length) {
            const text = (function() {
              return eval(`\`${el.rawText}\``)
            }).bind(this.proxy)();
            Ogone.get(this.id).texts.push({
              id,
              text,
              query,
              data: el.rawText,
            });
            el.rawText = text;
          } else if (el.nodeType === 1) {
            this.inspectTextChanges(el, query);
          }
        });
    }
  };
  this.inspectNodes = (node, structure = '') => {
    let query = '';
    if (node.tagName) {
      query = `${structure} ${node.tagName}`;
    } else {
      query = `[${this.id}]`
    }
    if (node.rawAttrs && node.rawAttrs.trim().length) {
      directives.forEach((directive) => {
        if (node.hasAttribute(directive)) {
          const onevent = node.getAttribute(directive);
          let trigger = null
          const payload = {
            type: 'event',
            event: directive.slice(2),
            querySelector: query,
            on: this.id,
          };
          if (directive === 'o-model' && ['input', 'textarea'].includes(node.tagName)) {
            if (onevent in this.proxy) {
              this.reactive[onevent].push(query);
            }
            trigger = (function([event, query, value]) {
              if (onevent in this && this[onevent] !== value) { this[onevent] = value; }
            }).bind(this.proxy);
          } else {
            trigger = (function() {
              eval(onevent);
            }).bind(this.proxy);
          }
          const json = JSON.stringify(payload);
          ws.OGONE_EVENTS.set(`${payload.event}:${query}`, trigger);
          ws.send(json);
          node.removeAttribute(directive);
        }
      });
    }
    if (node.childNodes.length) {
      node.childNodes
        .filter(el => el.nodeType === 1 && !['script', 'style'].includes(el.tagName))
        .forEach((el) => {
          this.inspectNodes(el, query);
        });
    }
  };
  this.setRootNode(html, {
    comment: true,
    style: true,
    script: true,
  });
  this.renderStyles();
  this.renderScripts();
  this.renderSubComponents();
  this.inspectNodes(this.rootNode);
  this.inspectTextChanges(this.rootNode);
  this.cleanRender();
};
module.exports = OComponent;