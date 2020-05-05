import beautify from 'js-beautify';
import beautifyOptions from './beautify.config';
import terser from 'terser';
import express from 'express';
import fs from 'fs';
import path from 'path';
import express from 'express-ws-routes';
import uuid from 'uuid-node';
import oInspect from './src/ogone/oInspect';
import renderApp from './src/ogone/renderApp';
import oRender from './src/ogone/oRender';
import oRenderStyles from './src/ogone/oRenderStyles';
import oRenderScripts from './src/ogone/oRenderScripts';
import oRenderImports from './src/ogone/oRenderImports';
import oStartRenderingDOM from './src/ogone/oStartRenderingDOM';
import oTopLevelTextNodeException from './src/ogone/oTopLevelTextNodeException';
import oCleanPureRootNode from './src/ogone/oCleanPureRootNode';
import Ogone from './src/ogone/';
const app = express();
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