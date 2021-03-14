// import HMR from "../lib/hmr/index.ts";
import { serve, join, fetchRemoteRessource } from "../../deps/deps.ts";
import { Utils } from '../classes/Utils.ts';
import Workers from '../enums/workers.ts';

const registry = {
  application: '',
  webview_application: '',
}

self.onmessage = async (e: any): Promise<void> => {
  Utils.trace(`Worker: Dev Server received a message`);
  const { application, Configuration, type } = e.data;
  if (type === Workers.UPDATE_APPLICATION) {
    registry.application = application;
    return;
  }
  if (type === Workers.LSP_UPDATE_SERVER_COMPONENT) {
    registry.webview_application = `
    <style>
      body {
        background: #FFFFFF00 !important;
      }
    </style>
    <script>const LSP_HSE_RUNNING = true;</script>
      ${application}`;
    return;
  }
  let port: number = 533;
  // open the server
  const server = serve({ port });
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
          console.warn(req);
          break;
      case req.url === '/hse/live':
          req.respond({ body: 'ok' });
          break;
      case !!component:
        req.respond({ body: registry.webview_application });
        break;
    }
  }
}
export { };