const beautify = require('js-beautify');
const beautifyOptions = require('./beautify.config');
const terser = require('terser');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = require('express-ws-routes')();
const uuid = require('uuid-node');
const oInspect = require('./src/ogone/oInspect');
const renderApp = require('./src/ogone/renderApp');
const oRender =  require('./src/ogone/oRender');
const oRenderStyles =  require('./src/ogone/oRenderStyles');
const oRenderScripts =  require('./src/ogone/oRenderScripts');
const oRenderImports =  require('./src/ogone/oRenderImports');
const oStartRenderingDOM =  require('./src/ogone/oStartRenderingDOM');
const oTopLevelTextNodeException = require('./src/ogone/oTopLevelTextNodeException');
const oCleanPureRootNode = require('./src/ogone/oCleanPureRootNode');
const Ogone = require('./src/ogone/');
let template = fs.readFileSync('./ogone.html', { encoding: 'utf8' });
const appVarName = `${uuid.generateUUID().replace(/[^a-zA-Z]/gi, '')}`;

if (!fs.existsSync(path.join(process.cwd(), Ogone.config.entrypoint))) {
  const CantFindEntrypointException = new Error('[Ogone] can\'t find entrypoint, please specify a correct path');
  throw CantFindEntrypointException;
}

oInspect();
oRender();
oRenderImports();
oRenderScripts();
oTopLevelTextNodeException();
oCleanPureRootNode();
oRenderStyles();
oStartRenderingDOM();

const styles = Array.from(Ogone.components.entries()).map(([p, component]) => component.style.join('\n'));
const style = `<style>${styles.join('\n')}</style>`;
const rootComponent =  Ogone.components.get(Ogone.main);
const firstInstanciation = `

`;
const script = beautify(`
  ${Ogone.datas.join('\n')}
  ${Ogone.contexts.join('\n')}
  ${Ogone.templates.join('\n')}
  const root = new Ogone.components['${rootComponent.uuid}']();
  root.read({
    id: 'root',
    attr: '${rootComponent.uuid}',
    type: 'component',
    querySelector: '#app',
  });
`, beautifyOptions);
const DOM = `
<script>
${true ? terser.minify(script).code : script}
</script>`;

template = template
  .replace(/%%styles%%/, style)
  .replace(/%%scripts%%/, DOM)
  .replace(/\$APPWS_REPLACED_VAR\$___/gi, appVarName)
  .replace(/\/\/%%on-open%%/gi, firstInstanciation);

if (Ogone.config.prefixStatic) {
  app.use(Ogone.config.prefixStatic, express.static(Ogone.config.static || 'public'))
} else {
  app.use(express.static(Ogone.config.static || 'public'));
}

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
      // new OComponent(Ogone.main, '#app', Ogone, ws);  
      ws.on('message', (msg) => {
        const ev = JSON.parse(msg);
        if (ev.id && ev.id in Ogone.onmessage) {
          // Ogone.onmessage[ev.id](ev);
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
  res.send(renderApp(template,  req.oid));
})
app.listen(Ogone.config.port || 8080, () => {
  console.warn('[Ogone] Success', `http://localhost:${Ogone.config.port || 8080}/`);
});