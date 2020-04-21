const express = require('express');
// const app = express();
// const expressWs = require('express-ws')(app);
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const app = require('express-ws-routes')();
const uuid = require('uuid-node');
const pse = require('postcss-scopeify-everything');
const OComponent = require('./src/');
const { parse } = require('node-html-parser');
const BABEL = require("@babel/core");

const template = fs.readFileSync('./ogone.html', { encoding: 'utf8' });
const json = fs.readFileSync('./ogone.config.json', { encoding: 'utf8' });
const config = JSON.parse(json);
const scriptType = [
  'o-init',
  'o-created',
  'o-before-insert',
  'o-close',
  'o-inserted'
];
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

const Ogone = {
  files: [],
  directories: [],
  components: new Map(),
  main: path.join(__dirname, config.entrypoint),
  sockets: [],
  pragma: `o${uuid.generateUUID().split('-')[0]}`,
  onmessage: [],
  onclose: [],
};
const renderApp = (app, styles, id) => {
  return template.replace(/%%styles%%/, styles).replace(/%%id%%/gi, id);
};
function startRecursiveInspection(p) {
  const stats = fs.statSync(p);
  if (stats.isFile()) {
    Ogone.files.push(p);
  } 
  if (stats.isDirectory()) {
    const dir = fs.readdirSync(p);
    Ogone.directories.push(p);
    dir.forEach((f) => {
      const pathTo = path.join(p, f);
      startRecursiveInspection(pathTo);
    });
  }
};

function oInspect() {
  const { src } = config;
  const pathToSrc = path.join(__dirname, src);
  if (fs.existsSync(pathToSrc)) {
    startRecursiveInspection(pathToSrc);
  } else {
    const OgoneSrcFileNotFoundException = new Error(`[Ogone] src file doesn't exist \n\t${pathToSrc}`)
    throw OgoneSrcFileNotFoundException;
  }
}
function oRenderForDirective(directiveValue) {
  const result = {
    type: 'for',
  };
  if (directiveValue.indexOf(':') === -1) {
    const OgoneForDirectiveSyntaxException = new Error(`[Ogone] Syntax Error: ${directiveValue}, no (:) found \n\tPlease follow this o-for syntax. arrayName:(item, i) `);
    throw OgoneForDirectiveSyntaxException;
  }
  const oForRegExp = /([\S]*)+:\(([^,\s\n\t]*)+,{0,1}\s{0,1}(([^,\s\n\t]*)+){0,1}\)/gi.exec(directiveValue);
  if (!oForRegExp) {
    const OgoneForDirectiveSyntaxException = new Error(`[Ogone] Syntax Error: ${directiveValue} \n\tPlease follow this o-for syntax. arrayName:(item, i) `);
    throw OgoneForDirectiveSyntaxException;
  }
  const [context, arrayName, item, i] = oForRegExp;
  result.array = arrayName;
  result.context = {
    item,
    content: context,
    index: i
  };
  return result;
}
function oRender() {
  Ogone.directories.forEach((dir) => {
    const index = path.join(dir, 'index.html');
    if (fs.existsSync(index)) {
      const html = fs.readFileSync(index, { encoding: 'utf8' });
      const rootNode = parse(html, {
        comment: true,
        script: true,
        style: true
      });
      const rootNodePure = parse(html, {
        comment: false,
        script: false,
        style: false
      });
      let data = null;
      let modules = {};
      const pathToData = path.join(dir, 'describe.yml');
      if (fs.existsSync(pathToData)) {
        const dataYML = fs.readFileSync(pathToData, { encoding: 'utf8' });
        const description = YAML.parse(dataYML);
        if (description.data) {
          data = description.data;
        }
        if (description.modules) {
          Object.entries(description.modules)
            .forEach(([name, path]) => {
              modules[name] = require(path);
            })
        }
      }
      Ogone.components.set(dir, {
        uuid: `data-${uuid.generateUUID().split('-')[0]}`,
        html: rootNode.toString(),
        file: dir,
        rootNode,
        rootNodePure,
        data,
        modules,
        style: [],
        scripts: {},
        dom: [],
        imports: {},
        directives: [],
        for: {},
        refs: {},
        reactive: {},
      });
    } else {
      console.warn('[Ogone] passed', dir);
    }
  });
}
function oRenderStyles() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const styles = component.rootNode.childNodes.filter(node => node.tagName === 'style');
    styles.forEach((element) => {
      const id = `data-${uuid.generateUUID().split('-')[0]}`;
      const scopeify = pse.api({ elements: false, scopeifyFn: () => name => `${name}[${id}]`, });
      const getCss = pse.getCss;
      const scopeified = scopeify(element.text).sync();
      const css = getCss(scopeified);
      component.uuid = id;
      component.style.push(css);
    });
  })
}
function oRenderScripts() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const scripts = component.rootNode.childNodes.filter(node => node.tagName === 'script');
    scripts.forEach((element) => {
      const { code } = BABEL.transformSync(element.rawText, {
        code: true,
        plugins: [
          // "@babel/plugin-transform-flow-strip-types",
          // "@babel/plugin-transform-modules-umd",
          ["@babel/plugin-transform-react-jsx", { pragma: Ogone.pragma }],
        ],
      });
      const anonymousFunction = `try {\n ${code}\n} catch(e) {\n  console.error(e);\n}`;
      const script = new Function(Ogone.pragma,'Render', 'Watcher', 'Modules', anonymousFunction);
      scriptType.forEach((t) => {
        if (element.hasAttribute(t)) {
          component.scripts[t] = script;
        }
      })
    });
  })
}
function* gen(i) {
  yield i;
  while (true)
    yield i++;
} 
const iterator = gen(0);
function oRenderDOM(keyComponent, node, structure = '', id = null, legacy = {}) {
  const component = Ogone.components.get(keyComponent);
  let query = '';
  const nUuid = `o-${iterator.next().value}`;
  let contextLegacy = {};
  if (legacy) {
    contextLegacy = Object.assign(legacy, {});
  }
  if (node.tagName) {
    node.setAttribute(nUuid, '');
    node.setAttribute(component.uuid, '');
    query = `${structure} [${nUuid}]`.trim();
  } else {
    query = `${structure}`.trim();
  }
  const dom = {
    id,
    rawText: node.rawText.trim(),
    tagName: node.tagName,
    querySelector: query,
    type: node.nodeType,
  };
  const domDirective = {
    querySelector: query,
    directives: [],
  };
  if (node.rawAttrs && node.rawAttrs.trim().length) {
    // get the directives
    directives.forEach((directive) => {
      if (node.hasAttribute(directive)) {
        const onevent = node.getAttribute(directive);
        const payload = [directive.slice(2)];
        switch(true) {
          case directive === 'o-model' && ['input', 'textarea'].includes(node.tagName):
            if (onevent in component.data) {
              if (!component.reactive[onevent]) {
                component.reactive[onevent] = [];
              }
              component.reactive[onevent].push(query);
            } else {
              const undefinedDataInComponentException = new Error(`[Ogone] ${onevent} is not defined. This error is thrown before binding this missing data. please define it in \n\t\t ${component.file} -> describe.yml`)
              throw undefinedDataInComponentException;
            }
            payload.push(function bounded(value) {
              if (this[onevent] !== value) { this[onevent] = value; }
            });
            break;
          case directive === 'o-for':
            const oForDirective = oRenderForDirective(onevent);
            const { context, array } = oForDirective;
            const { item, index } = context;
            if (legacy[item]) {
              const ItemNameAlreadyInUseException = new Error(`[Ogone] '${item}' is already defined in the template, as item`);
              throw ItemNameAlreadyInUseException;
            }
            if (legacy[index]) {
              const IndexAlreadyInUseException = new Error(`[Ogone] '${index}' is already defined in the template, as index`);
              throw IndexAlreadyInUseException;
            }
            const getter = `
            try {
              if ('${array}' in this) {
                return this.${array};
              }
              if (!component.item || !component.item.for[query]) {
                return null;
              }
              const index = '${array.split(/\b/)[0]}';
              if (index in component.item.for[query].context) {
                return component.contexts[index]${array.split(/\b/).slice(1).join('')};
              } else {
                return null;
              }
            } catch(e) {
              console.error(e);
            }
            `;
            const anonymousFunctionItem = `
              if (Array.isArray(getter)){
                return getter[index];
              }
              if (typeof getter === 'object') {
                return Object.values(getter)[index];
              }
              return Array.from(getter)[index];
            `;
            const anonymousFunctionIndex = `
              if (Array.isArray(getter)){
                return index;
              }
              if (typeof getter === 'object') {
                return Object.keys(getter)[index];
              }
            `;
            contextLegacy[item] = new Function('index', 'getter', anonymousFunctionItem);
            contextLegacy[index] = new Function('index', 'getter', anonymousFunctionIndex);
            component.for[query] = {
              getter: new Function('query', 'component', getter),
              context: contextLegacy,
            };
            payload.push(oForDirective);
            break;
          default:
            payload.push(new Function(onevent));
            break;
        }
        domDirective.directives.push(payload);
        node.removeAttribute(directive);
      }
    });
    // get any reference
    if (node.hasAttribute('ref')) {
      const ref = node.getAttribute('ref');
      component.refs[ref] = query;
      node.removeAttribute('ref');
    }
  }
  if(domDirective.directives.length) component.directives.push(domDirective);
  if (id !== null) component.dom.push(dom);
  if (node.childNodes.length) {
    node.childNodes
      .forEach((el, i) => {
        oRenderDOM(keyComponent, el, query, i, { ...contextLegacy });
      });
  }
}
function oStartRenderingDom() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([path, component]) => {
    oRenderDOM(path, component.rootNodePure);
  });
}
function oRenderImports() {
  const entries = Array.from(Ogone.components.entries());
  entries.forEach(([pathToComponent, component]) => {
    const comments = component.rootNode.childNodes.filter(node => node.nodeType === 8);
    const reg = /([a-zA-Z0-9\-]*)+(\s)(from)(\s)([\.\/a-zA-Z0-9]*)+/gi;
    comments
      .filter(comment => comment.rawText.match(reg))
      .forEach((imported) => {
        const instruction = imported.rawText;
        const importSyntax =  /([a-zA-Z0-9\-]*)+(\s)(from)(\s)([\.\/a-zA-Z0-9]*)+/gi.exec(instruction);
        if (!importSyntax) return;
        const pathComponent = path.join(pathToComponent, importSyntax[5]);
        component.imports[pathComponent] = importSyntax[1];
      });
  })
};
function oCleanPureRootNode() {
  Ogone.components.forEach((c) => {
    c.rootNodePure.childNodes = c.rootNodePure.childNodes.filter((node) => {
      return node.tagName !== 'style' &&
      node.tagName !== 'script' &&
      node.nodeType !== 8 ||
      (node.nodeType === 3 && !node.rawText.trim().length)
    })
  });
}
function oTopLevelTextNodeException() {
  Ogone.components.forEach((c) => {
    c.rootNodePure.childNodes.forEach((node, id) => {
      if (node.nodeType === 3 && node.rawText.trim().length) {
        const TopLevelTextNodeException = new Error(`[Ogone] Top level text are not allowed, please wrap this text into an element:\t${node.rawText.trim()}\n\tcomponent: ${c.file}`)
        throw TopLevelTextNodeException;
      }
    });
  });
}
oInspect();
oRender();
oTopLevelTextNodeException();
oCleanPureRootNode();
oRenderImports();
oRenderStyles();
oRenderScripts();
oStartRenderingDom();

const styles = Array.from(Ogone.components.entries()).map(([p, component]) => component.style.join('\n'));
const style = `<style>${styles.join('\n')}</style>`;
app.use((req, res, next) => {
  if (req.method === 'WEBSOCKET') {
    next();
    return;
  }
  req.oid = uuid.generateUUID();
  const router = express.Router();
  router.sockets = [];
  router.websocket(`/${req.oid}`, (info, cb, next, ) => {
    cb((ws) => {
      new OComponent(Ogone.main, '#app', Ogone, ws);  
      ws.on('message', (msg) => {
        const ev = JSON.parse(msg);
        if (ev.id && ev.id in Ogone.onmessage) {
          Ogone.onmessage[ev.id](ev);
        }
      });
      ws.on('close', () => {
        Ogone.onclose.forEach((closeHandler) => {
          closeHandler();
        });
      });
    });
  });
  app.use('', router);
  next();
});
app.get('*', (req, res) => {
  res.send(renderApp(config.app, style, req.oid));
})
app.listen(config.port || 8080, () => {
  console.warn('[Ogone] Success')
});