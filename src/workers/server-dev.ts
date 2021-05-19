import { getHeaderContentTypeOf } from "../../utils/extensions-resolution.ts";
import { existsSync } from "../../utils/exists.ts";
// import HMR from "../lib/hmr/index.ts";
import { serve, absolute, fetchRemoteRessource } from "../../deps/deps.ts";
import { Utils } from '../classes/Utils.ts';
import Workers from '../enums/workers.ts';
import TSTranspiler from "../classes/TSTranspiler.ts";
import transformPathFileToUUID from '../../utils/transformPathFileToUUID.ts';
import WebviewEngine from '../classes/WebviewEngine.ts';

Utils.infos('worker for dev server created.');

const registry = {
  application: '',
  webview_application: '',
  port: 0,
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

async function control(req: any, baseURL: string): Promise<boolean> {
  const realUrl = req.url.replace(baseURL, '');
  const ns = realUrl
    .slice(1)
    .split("/")[0];
  if (realUrl.indexOf("/") > -1 && realUrl.startsWith(`/${ns}/`)) {
    const controller = controllers[ns] || controllers[`/${ns}`];
    if (controller) {
      const route = realUrl.replace(`/${ns}`, "");
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
    console.warn(controller.runtime);
    const run = eval(`
    async function controllers() {
      ${controller.runtime}
    }
    `);
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
      ${application}`;
    return;
  }
  let port: number = Configuration.port || 8080;
  while (!isFreePort(port)) {
    port = Math.floor(Math.random() * 9000 + 1000)
  }
  // open the server
  const server = serve({ port });
  registry.port = port;
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
  WebviewEngine.updateDevServerPortFile(port);
  for await (const req of server) {
    const pathToPublic: string = `${Deno.cwd()}/${getPublicPath(req.url, Configuration.static)}`.replace(/\/+/gi, '/');
    const params = new URLSearchParams('?' + req.url.split("?")[1]);
    // for imported modules
    const serveModule = params.get('serve_module');
    // for lsp
    const component = params.get('component');
    const keyPort = params.get('port');
    const controllerRendered = await control(req, Configuration.static);
    if (controllerRendered) {
      continue;
    }
    let isUrlFile: boolean = existsSync(pathToPublic);
    const realUrl = req.url.split('?')[0];
    switch (true) {
      case component && port === parseFloat(keyPort as string):
        req.respond({ body: registry.webview_application });
        break;
      case !!serveModule:
        req.respond({
          body: await TSTranspiler.bundle(serveModule!),
          headers: new Headers([
            getHeaderContentTypeOf('file.js'),
          ]),
        });
        break;
      case isUrlFile && Deno.statSync(pathToPublic).isFile && (realUrl.endsWith('.ts') || realUrl.endsWith('.js')):
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
function getPublicPath(path: string, publicPath: string) {
  let result = path.split('?')[0];
  if (!publicPath) return result;
  const regExp = new RegExp(`^${Deno.cwd()
    .replace(/'[\\\/\:\.]'/gi, '\$1')}\\b`, 'i');
  const publicReg = new RegExp(`${publicPath.replace(/'[\\\/\:\.]'/gi, '\$1')}`);
  // remove Deno.cwd()
  result = result.replace(regExp, '');
  // add public path if it's missing
  if (!result.match(publicReg)) {
    result = `${publicPath}${result}`;
  }
  return result;
}
export { };