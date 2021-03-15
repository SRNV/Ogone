import { getHeaderContentTypeOf } from "../../utils/extensions-resolution.ts";
import { existsSync } from "../../utils/exists.ts";
// import HMR from "../lib/hmr/index.ts";
import { serve, join, fetchRemoteRessource } from "../../deps/deps.ts";
import { Utils } from '../classes/Utils.ts';
import Workers from '../enums/workers.ts';
import TSTranspiler from "../classes/TSTranspiler.ts";
import transformPathFileToUUID from '../../utils/transformPathFileToUUID.ts';

const registry = {
  application: '',
  webview_application: '',
}
export interface Controller {
  namespace: string;
  protocol: any;
  runtime: any;
  file: string;
}
export type Controllers = {
  [k: string]: Controller;
}
let controllers: Controllers = {};

async function control(req: any): Promise<boolean> {
  const ns = req.url.slice(1).split("/")[0];
  if (req.url.indexOf("/") > -1 && req.url.startsWith(`/${ns}/`)) {
    const controller = controllers[ns] || controllers[`/${ns}`];
    if (controller) {
      const route = req.url.replace(`/${ns}`, "");
      const t = req.method;
      let response = await controller.runtime(`${t}:${route}`, req);
      if (response) {
        switch (true) {
          case typeof response === "object":
            response = JSON.stringify(response);
            break;
        }
        req.respond({
          body: response,
        });
        return true;
      }
    }
  }
  return false;
}
async function resolveAndReadText(path: string) {
  const isFile = path && (path.startsWith("/") ||
    path.startsWith("./") ||
    path.startsWith("../") ||
    !path.startsWith("http://") ||
    !path.startsWith("https://"));
  const isTsFile = isFile && path.endsWith(".ts");
  if (Deno.build.os !== "windows") {
    Deno.chmodSync(path, 0o777);
  }
  const text = Deno.readTextFileSync(path);
  return isTsFile
    ? // @ts-ignore
    await TSTranspiler.transpile(text)
    : text;
}

async function initControllers(data: { controllers: Controllers }): Promise<void> {
  Utils.trace('Controllers initialization');
  controllers = { ...data.controllers };
  const entries = Object.entries(data.controllers)
  for await (const [key, controller] of entries) {
    const protocol = await TSTranspiler.transpile(controller.protocol);
    controllers[key].protocol = (eval(protocol));
    const run = eval(controller.runtime);
    if (typeof run === 'function') {
      const instance = new controllers[key].protocol();
      controllers[key].runtime = run.bind(instance);
    }
  }
}
function isFreePort(port: number): boolean {
  try {
    const listener = Deno.listen({
      port: port,
    });
    listener.close();

    return true;
  } catch (err) {
    if (err instanceof Deno.errors.AddrInUse) {
      return false;
    }

    throw err;
  }
}
async function cache(file: string): Promise<string> {
  const cachePath = '.ogone/.cache/';
  const fileContent = Deno.readTextFileSync(file);
  const uuid = transformPathFileToUUID(file);
  const fileCachePath = `${cachePath}${uuid}`;
  if (!existsSync(cachePath)) {
    Deno.mkdirSync(cachePath);
  }
  let currentText = existsSync(fileCachePath)
      ? Deno.readTextFileSync(fileCachePath)
      : '';
  if (currentText !== fileContent) {
    currentText = await TSTranspiler.transpile(fileContent);
    Deno.writeTextFileSync(fileCachePath, currentText);
  }
  return currentText;
}
self.onmessage = async (e: any): Promise<void> => {
  Utils.trace(`Worker: Dev Server received a message`);
  const { application, Configuration, type } = e.data;
  if (type === Workers.INIT_MESSAGE_SERVICE_DEV) {
    registry.application = application;
    await initControllers(e.data);
  }
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
    <script>window.LSP_HSE_RUNNING = true;</script>
      ${application}`;
    return;
  }
  let port: number = Configuration.port || 8080;
  while (!isFreePort(port)) {
    port = Math.floor(Math.random() * 9000 + 1000)
  }
  // open the server
  const server = serve({ port });
  // close the server when the window is unloaded
  // or the worker is killed
  self.addEventListener("unload", () => {
    server.close();
  })
  // start rendering Ogone system
  if (!Configuration.entrypoint || !existsSync(Configuration.entrypoint)) {
    server.close();
    Utils.error(
      `can't find entrypoint, please specify a correct path. input: ${Configuration.entrypoint}`,
    );
  }
  Utils.trace(`Worker: Dev Server available on http://localhost:${port}/`);
  Utils.exposeSession(port, Configuration.entrypoint)
  self.postMessage({
    type: Workers.SERVICE_DEV_READY
  });
  self.postMessage({
    type: Workers.SERVICE_DEV_GET_PORT,
    port,
  });

  for await (const req of server) {
    const pathToPublic: string = `${Deno.cwd()}/${Configuration.static ? Configuration.static.replace(/^\//, '') : ''
      }/${req.url}`.replace(/\/+/gi, '/');
    const params = new URLSearchParams('?' + req.url.split("?")[1]);
    // for imported modules
    const importedFile = params.get('import');
    const serveModule = params.get('serve_module');
    // for lsp
    const component = params.get('component');
    const keyPort = params.get('port');
    const controllerRendered = await control(req);
    if (controllerRendered) {
      continue;
    }
    let isUrlFile: boolean = existsSync(pathToPublic);
    const realUrl = req.url.split('?')[0];
    switch (true) {
      case !!serveModule:
        req.respond({
          body: await TSTranspiler.bundle(serveModule!),
          headers: new Headers([
            getHeaderContentTypeOf('file.js'),
          ]),
        });
        break;
      case existsSync(realUrl) && (realUrl.endsWith('.ts') || realUrl.endsWith('.js')):
        const file = await cache(
          realUrl
        );
        req.respond({
          body: file,
          headers: new Headers([
            getHeaderContentTypeOf(realUrl!),
          ]),
        });
        break;
      case component && port === parseFloat(keyPort as string):
        req.respond({ body: registry.webview_application });
        break;
      case importedFile && existsSync(importedFile as string) && Deno.statSync(importedFile as string).isFile:
        // TODO fix HMR
        // use std websocket
        // HMR(denoReqUrl);
        req.respond({
          body: await resolveAndReadText(importedFile!),
          headers: new Headers([
            getHeaderContentTypeOf(importedFile!),
            ["X-Content-Type-Options", "nosniff"],
          ]),
        });
        break;
      case isUrlFile && Deno.statSync(pathToPublic).isFile:
        if (Deno.build.os !== "windows") {
          Deno.chmodSync(pathToPublic, 0o777);
        }
        req.respond({
          body: Deno.readTextFileSync(pathToPublic),
          headers: new Headers([
            getHeaderContentTypeOf(req.url),
            ["X-Content-Type-Options", "nosniff"],
          ]),
        });
        break;
      default:
        req.respond({ body: registry.application });
        break;
    }
  }
}
export { };