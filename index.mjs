import beautify from 'js-beautify';
import beautifyOptions from './beautify.config.js';
import terser from 'terser';
import expressM from 'express';
import fs from 'fs';
import path from 'path';
import express from 'express-ws-routes';
import uuid from 'uuid-node';
import rollup from 'rollup';
import oInspect from './src/ogone/oInspect.js';
import renderApp from './src/ogone/renderApp.js';
import oRender from './src/ogone/oRender.js';
import oRenderStyles from './src/ogone/oRenderStyles.js';
import oRenderScripts from './src/ogone/oRenderScripts.js';
import oRenderImports from './src/ogone/oRenderImports.js';
import oStartRenderingDOM from './src/ogone/oStartRenderingDOM.js';
import oTopLevelTextNodeException from './src/ogone/oTopLevelTextNodeException.js';
import oCleanPureRootNode from './src/ogone/oCleanPureRootNode.js';
import Ogone from './src/ogone/index.js';

const browserBuild = [
  fs.readFileSync('./src/browser/component.js', 'utf8'),
  fs.readFileSync('./src/browser/ogone.js', 'utf8'),
  fs.readFileSync('./src/browser/nodeManager.js', 'utf8'),
  fs.readFileSync('./src/browser/websocket.js', 'utf8'),
];
const app = expressM();
let template = fs.readFileSync('./ogone.html', { encoding: 'utf8' });

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
const esm = Array.from(Ogone.components.entries()).map(([p, component]) => component.esmExpressions).join('\n');
const exportsExpression = Array.from(Ogone.components.entries()).map(([p, component]) => component.exportsExpressions).join('\n');
const style = `<style>${styles.join('\n')}</style>`;
const rootComponent =  Ogone.components.get(Ogone.main);
const script = beautify(`
  ${esm}
  ${browserBuild.join('\n')}
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
<script type="module">
${false ? terser.minify(script).code : script}
</script>`;

template = template
  .replace(/%%styles%%/, style)
  .replace(/%%scripts%%/, DOM);

if (Ogone.config.prefixStatic) {
  app.use(Ogone.config.prefixStatic, expressM.static(Ogone.config.static || 'public'))
} else {
  app.use(expressM.static(Ogone.config.static || 'public'));
}
/*
app.use((req, res, next) => {
  if (req.method === 'WEBSOCKET') {
    next();
    return;
  }
  req.oid = uuid.generateUUID();
  const router = expressM.Router();
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
*/
const pathToExports = path.join(process.cwd(), '/exports/index.js');
if (fs.readFileSync(pathToExports, 'utf8') !== exportsExpression) {
  fs.writeFileSync(pathToExports, exportsExpression);
}
async function bdl(index, callback) {
  const bundle = await rollup.rollup({
    input: index,
    output: {
      file: 'bundle.js',
      format: 'cjs'
    },
  });
  const { output } = await bundle.generate({ });
  for( const chunk of output) {
    console.warn(chunk)
    if (chunk.type === 'asset') {

    } else {
      callback(chunk.code);
    }
  }
}
app.get('*', (req, res) => {
  switch(true) {
    case req._parsedUrl.href.startsWith('/node_modules/'):
      // res.sendFile(pathToExports);
      const pathToModule = './exports/index.js';
      bdl(pathToModule, (code) => {
        res.set({
          'Content-Type': 'application/javascript',
        });
        res.send(code);
      })
      break;
    default:
      res.send(renderApp(template));
      break;
  }
})
app.listen(Ogone.config.port || 8080, () => {
  console.warn('[Ogone] Success', `http://localhost:${Ogone.config.port || 8080}/`);
});