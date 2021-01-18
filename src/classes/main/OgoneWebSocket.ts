import OgoneError from "./OgoneError.ts";
import { Document, Location } from '../../ogone.dom.d.ts';
import Env from "../Env.ts";
declare const document: Document;
declare const location: Location;
export default class OgoneWebSocket extends OgoneError {
  static readonly websocketPort: number = 3434;
  static showPanel(panelName: 'infos' | 'error' | 'success' | 'warn', time: number | undefined) {
    const panel = panelName === 'infos' ?
      OgoneWebSocket.infosPanel :
      panelName === 'success' ?
        OgoneWebSocket.successPanel :
        panelName === 'warn' ?
          OgoneWebSocket.warnPanel :
          OgoneWebSocket.errorPanel;
    if (panel) {
      document.body.append(panel);
      if (time) {
        setTimeout(() => {
          const f = document.createDocumentFragment();
          f.append(panel);
        }, time);
      }
    }
  }
  static infosMessage(opts: { message: string; }) {
    if (!OgoneWebSocket.infosPanel) {
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.opacity = "0.85";
      container.style.bottom = "0px";
      container.style.left = "0px";
      container.style.background = "var(--o-header, #333333)";
      container.style.padding = "5px";
      container.style.paddingRight = "15px";
      container.style.width = "max-content";
      container.style.color = "var(--o-grey, #cecece)";
      container.style.fontSize = "10pt";
      container.style.fontFamily = "sans-serif";
      container.style.borderLeft = "3px solid var(--o-secondary, #61c3aa)";
      container.style.zIndex = "400000";
      OgoneWebSocket.infosPanel = container;
    }
    OgoneWebSocket.infosPanel!.innerHTML = opts.message;
    OgoneWebSocket.showPanel("infos", 2000);
  }
  static async hmr(url: string) {
    try {
      const mod = await import(`${url}?p=\${performance.now()}`);
      const keys = Object.keys(OgoneWebSocket.mod);
      keys.filter((key) => key === url).forEach((key) => {
        OgoneWebSocket.mod[key] = mod;
      });
      OgoneWebSocket.mod["*"]
        .forEach(([key, f]: [string, any], i, arr) => {
          key === url && f && !f(mod) ? delete arr[i] : 0;
        });
      return mod;
    } catch (err) {
      OgoneWebSocket.displayError(err.message, "HMR-Error", new Error(`
      module's url: ${url}
      `));
      throw err;
    }
  }
  static async hmrTemplate(uuid: string | number, pragma: any) {
    try {
      const templates = OgoneWebSocket.mod[uuid];
      if (templates) {
        templates.forEach((f: (arg0: any) => any, i: string | number, arr: { [x: string]: any; }) => {
          f && !f(pragma) ? delete arr[i] : 0;
        });
      }
      return templates;
    } catch (err) {
      OgoneWebSocket.displayError(err.message, "HMR-Error", err);
      throw err;
    }
  }
  static async hmrRuntime(uuid: string | number, runtime: { bind: (arg0: any) => any; }) {
    try {
      const components = OgoneWebSocket.instances[uuid];
      if (components) {
        components.forEach((c, i, arr) => {
          if (c.activated) {
            c.runtime = runtime.bind(c.data);
            c.runtime(0);
            c.renderTexts(true);
          } else {
            delete arr[i];
          }
        });
      }
      return components;
    } catch (err) {
      OgoneWebSocket.displayError(err.message, "HMR-Error", err);
      throw err;
    }
  }
  static startConnection() {
    if (Env._env === 'production') return;
    if (OgoneWebSocket.isDeno) {
      // OgoneWebSocket.createServer();
    } else {
      OgoneWebSocket.createClient();
    }
  }
  static createClient() {
    const ws = new WebSocket(`ws://localhost:${OgoneWebSocket.websocketPort}/`);
    ws.onmessage = (msg) => {
      const { url, type, uuid, pragma, ctx, style, runtime } = JSON.parse(
        msg.data,
      );
      if (type === "javascript") {
        OgoneWebSocket.hmr(url).then(() => {
          console.warn("[Ogone] hmr:", url);
          OgoneWebSocket.infosMessage({
            message: `[HMR] module updated: ${url}`,
          });
        });
      }
      if (type === "template" && pragma && uuid) {
        eval(ctx);
        OgoneWebSocket.hmrTemplate(uuid, pragma).then(() => {
          OgoneWebSocket.infosMessage({
            message: `[HMR] template updated: ${uuid}`,
          });
        });
      }
      if (type === "reload") {
        console.warn("[Ogone] hmr: reloading the application");
        OgoneWebSocket.infosMessage({
          message: `[HMR] socket lost. Reloading your application`,
        });
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
      if (type === "style") {
        const styleElement = document.querySelector(`style[id="${uuid}"]`);
        if (styleElement) styleElement.innerHTML = style;
        OgoneWebSocket.infosMessage({
          message: `[HMR] style updated: ${uuid}`,
        });
      }
      if (type === "runtime") {
        const r = eval(runtime);
        OgoneWebSocket.hmrRuntime(uuid, (r || function () { })).then(() => {
          OgoneWebSocket.infosMessage({
            message: `[HMR] component updated: ${uuid}`,
          });
        });
      }
    };

    ws.onclose = () => {
      setTimeout(() => {
        console.warn("[Ogone] ws closed: reloading");
        location.reload();
      }, 1000);
    };
    return ws;
  }
}