import { serve } from 'https://deno.land/std@v0.42.0/http/server.ts';
import { getHeaderContentTypeOf } from './utils/extensions-resolution.ts';
import renderApp from './renderApp.ts';
import { browserBuild, template } from './src/browser/readfiles.ts';
import Ogone from './src/ogone/index.ts';
import { existsSync } from './utils/exists.ts';
import compile from './src/ogone/compilation/index.ts';

const port : number = 8000;
// open the server
const server = serve({ port });
// start rendering Ogone system
if (!existsSync(Ogone.config.entrypoint)) {
  server.close();
  throw new Error('[Ogone] can\'t find entrypoint, please specify a correct path');
}
//start compilation of o3 files
compile();
//
const styles = Array.from(Ogone.components.entries()).map(([p, component]) => component.style.join('\n'));
const esm = Array.from(Ogone.components.entries()).map(([p, component]) => component.esmExpressions).join('\n');
const exportsExpression = Array.from(Ogone.components.entries()).map(([p, component]) => component.exportsExpressions).join('\n');
const style = `<style>${styles.join('\n')}</style>`;
const rootComponent =  Ogone.components.get(Ogone.config.entrypoint);
const script = `
  ${esm}
  ${browserBuild}
  ${Ogone.datas.join('\n')}
  ${Ogone.contexts.join('\n')}
  ${Ogone.templates.join('\n')}
  ${Ogone.classes.join('\n')}
  ${Ogone.customElements.join('\n')}
`;
const DOM = `
<template-${rootComponent.uuid} />
<script type="module">
  ${script}
</script>
`;

let body = template
  .replace(/%%styles%%/, style)
  .replace(/%%scripts%%/, DOM);

// Ogone is now ready to serve
console.warn(`[Ogone] Success http://localhost:${port}/`)
for await (const req of server) {
  const pathToPublic: string = `${Deno.cwd()}/public${req.url}`;
  let isUrlFile: boolean = existsSync(pathToPublic);
  switch(true) {
    case req.url === '/':
        req.respond({ body: renderApp(body) });
    break;
    case isUrlFile:
      req.respond({
        body: Deno.readTextFileSync(pathToPublic),
        headers: new Headers([
          getHeaderContentTypeOf(req.url),
          ['X-Content-Type-Options', 'nosniff']
        ]),
      });
    break;
    default:
      req.respond({ body: '' });
    break;
  }
}