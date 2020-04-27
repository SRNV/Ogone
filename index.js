const express = require('express');
const fs = require('fs');
const app = require('express-ws-routes')();
const uuid = require('uuid-node');
const OComponent = require('./src/component');
const oInspect = require('./src/ogone/oInspect');
const renderApp = require('./src/ogone/renderApp');
const oRender =  require('./src/ogone/oRender');
const oRenderStyles =  require('./src/ogone/oRenderStyles');
const oRenderScripts =  require('./src/ogone/oRenderScripts');
const oRenderImports =  require('./src/ogone/oRenderImports');
const oStartRenderingDOM =  require('./src/ogone/oStartRenderingDOM');
const oTopLevelTextNodeException = require('./src/ogone/oTopLevelTextNodeException');
const oTopLevelForDirectiveException = require('./src/ogone/oTopLevelForDirectiveException'); 
const oCleanPureRootNode = require('./src/ogone/oCleanPureRootNode');
const Ogone = require('./src/ogone/');
let template = fs.readFileSync('./ogone.html', { encoding: 'utf8' });
const appVarName = `${uuid.generateUUID().replace(/[^a-zA-Z]/gi, '')}`;

oInspect();
oRender();
oTopLevelTextNodeException();
oCleanPureRootNode();
oRenderImports();
oRenderStyles();
oRenderScripts();
oStartRenderingDOM();

const styles = Array.from(Ogone.components.entries()).map(([p, component]) => component.style.join('\n'));
const style = `<style>${styles.join('\n')}</style>`;
const rootComponent =  Ogone.components.get(Ogone.main);
const DOM = `<script>
  ${Ogone.datas.join('\n')}
  ${Ogone.contexts.join('\n')}
  ${Ogone.templates.join('\n')}
</script>`;
const firstInstanciation = `
          const root = new Ogone.components['${rootComponent.uuid}'](${appVarName});
          root.read({
            id: 'root',
            attr: '${rootComponent.uuid}',
            type: 'component',
            querySelector: '#app',
          });
`;
template = template
  .replace(/%%styles%%/, style)
  .replace(/%%scripts%%/, DOM)
  .replace(/\$APPWS_REPLACED_VAR\$___/gi, appVarName)
  .replace(/\/\/%%on-open%%/gi, firstInstanciation);
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