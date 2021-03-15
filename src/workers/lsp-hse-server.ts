// import HMR from "../lib/hmr/index.ts";
import { serve, join, fetchRemoteRessource } from "../../deps/deps.ts";
import { Utils } from '../classes/Utils.ts';
import Workers from '../enums/workers.ts';

interface LSPHSECache {
  port: number;
  updateResponse: Function | null;
}
const cache: LSPHSECache = {
  port: 0,
  updateResponse: null,
};
let serverOpened = false;
self.onmessage = async (e: any): Promise<void> => {
  Utils.trace(`Worker: HSE Server received a message`);
  const { application, Configuration, type, port: configPort } = e.data;
  if (cache.updateResponse && type === Workers.LSP_CURRENT_COMPONENT_RENDERED) {
    cache.updateResponse();
    cache.updateResponse = null;
    return;
  }
  if (type === Workers.INIT_MESSAGE_SERVICE_DEV) {
    cache.port = configPort;
  }
  if (serverOpened) {
    return;
  }
  let port: number = 5330;
  // open the server
  const server = serve({ port });
  serverOpened = true;
  // close the server when the window is unloaded
  // or the worker is killed
  self.addEventListener("unload", () => {
    server.close();
  })
  self.postMessage({
    type: Workers.SERVICE_DEV_READY
  });
  self.postMessage({
    type: Workers.SERVICE_DEV_GET_PORT,
    port,
  });

  for await (const req of server) {
    const params = new URLSearchParams('?' + req.url.split("?")[1]);
    // for imported modules
    const importedFile = params.get('import');
    const serveModule = params.get('serve_module');
    // for lsp
    const component = params.get('component');
    switch (true) {
      case req.method === 'POST' && req.url === '/hse/update':
          const buf: Uint8Array = await Deno.readAll(req.body);
          const text = new TextDecoder().decode(buf);
          const data = Object.assign(JSON.parse(text),
            { type: Workers.LSP_UPDATE_CURRENT_COMPONENT });
          self.postMessage(data);
          cache.updateResponse = () => req.respond({ body: 'ok' });
          break;
      case req.url === '/hse/live':
          req.respond({ body: 'ok' });
          break;
      case req.url === '/hse/port':
        req.respond({ body: JSON.stringify(cache.port) });
        break;
    }
  }
}
export { };