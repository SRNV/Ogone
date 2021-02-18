import Ogone from '../main/OgoneBase.ts';
import { Document, HTMLIFrameElement } from '../ogone.dom.d.ts';
import { WebSocketServer, WS } from '../../deps/ws.ts';
import { HTMLOgoneElement } from '../ogone.main.d.ts';

declare const document: Document;
interface ModuleGraph {
  listeners: Function[];
  graph: string[];
}
export default class HMR {
  static FIFOMessages: string[] = [];
  static port = 3434;
  static components: { [k: string]: HTMLOgoneElement[] } = {};
  static server?: WebSocketServer;
  static client?: WebSocket;
  static ogone?: typeof Ogone;
  static listeners: Map<string, ModuleGraph> = new Map();
  static get connect (): string {
    return `ws://0.0.0.0:${this.port}/`
  }
  static startHandshake() {

  }
  static async sendError(error: string) {
    this.postMessage({
      error,
    });
  }
  static useOgone(ogone: typeof Ogone) {
    if (typeof document !== "undefined") {
      this.ogone = ogone;
      this.clientSettings();
    }
  }
  static clientSettings(): void {
    this.client = new WebSocket(this.connect);
    this.client.onmessage = (evt: any) => {
      const payload = JSON.parse(evt.data);
      const { uuid, output, error, errorFile, type, pathToModule, uuidReq } = payload;
      if (type === 'style') {
        let style = document.querySelector(`style#${uuid}`);
        if (style) {
          if (output !== style.innerHTML) style.innerHTML = output;
        } else {
          style = document.createElement('style');
          style.id = uuid;
          style.innerHTML = output;
          document.head.append(style);
        }
        return;
      }
      if (type === 'module') {
        this.getModule(pathToModule, uuidReq, uuid);
      }
      if (error) {
        console.error(error);
        Ogone.displayError(errorFile || 'Error found in application.', 'TypeError', new Error(error));
        return;
      }
      this.rerenderComponents(uuid, output);
    };
  }
  static rerenderComponents(uuid: string, output ?: string) {
    const savedComponents = this.components[uuid];
    if (savedComponents) {
      const components = savedComponents.filter((component) => component.isOriginalNode && component.isTemplate);
      if (output) {
        const replacement = eval(`((Ogone) => {
          ${output}
          console.warn('[Ogone] references are updated.');
        })`);
        replacement(Ogone);
      }
      console.warn('[Ogone] rendering new components.');
      components.forEach((component) => {
        component.rerender();
      });
    }
  }
  static async getModule(pathToModule: string, uuidReq: string, uuid: string) {
    const iframe = document.createElement('iframe') as HTMLIFrameElement;
    document.body.append(iframe);
    iframe.name = 'HMR_IFRAME';
    iframe.srcdoc = `
    < script>
      window.loadModule = async (listener, path) => {
        listener(await import(path));
      };
      window.postMessage('ready');
    </ script>
    `.replace(/\<(\/{0,1})\s+script/gi, '<$1script');
    iframe.addEventListener('load', () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('message', async () => {
          // @ts-ignore
          const { loadModule } = iframe.contentWindow!;
          if (this.listeners.has(pathToModule)) {
            const { listeners, graph } = this.listeners.get(pathToModule)!
            for (let listener of listeners) {
              await loadModule(listener, pathToModule + `?uuid_req=${uuidReq}`);
            }
          } else {
            const entries = Array.from(this.listeners.entries()) as [string, ModuleGraph][];
            const candidate = entries.find(([key, moduleGraph]: [string, ModuleGraph]) => {
              return moduleGraph.graph.includes(pathToModule);
            });
            if (candidate) {
              const [dependencyPath, dependency] = candidate;
              for (let listener of dependency.listeners) {
                await loadModule(listener, dependencyPath + `?uuid_req=${uuidReq}`)
              }
            } else {
              console.warn('[Ogone] module not found.');
              return;
            }
          }
          iframe.remove();
          this.rerenderComponents(uuid);
        });
      }
    })
    console.warn('[Ogone] updating module.');
  }
  static setServer(server: WebSocketServer) {
    this.server = server;
    this.server.on('connection', (ws: WebSocket) => {
      HMR.client = ws;
      HMR.sendFIFOMessages();
    });
  }
  static postMessage(obj: Object) {
    const message = JSON.stringify(obj);
    if(this.client?.readyState !== 1) {
      this.FIFOMessages.push(message);
    } else {
      this.sendFIFOMessages();
    }
    if (this.client) this.client.send(message);
  }
  static async sendFIFOMessages() {
    // if (this.client?.readyState !== 1) return;
    this.FIFOMessages.forEach((m: string) => {
      if (this.client) this.client.send(m);
    });
    this.FIFOMessages.splice(0);
  }
  static subscribe(pathToModule: string, listener: Function) {
    if (!this.listeners.has(pathToModule)) this.listeners.set(pathToModule, {
      listeners: [listener],
      graph: [],
    });
    else {
      const candidate = this.listeners.get(pathToModule)!;
      candidate.listeners.push(listener);
    }
  }
  static setGraph(pathToModule: string, graph: string[]) {
    if (this.listeners.has(pathToModule)) {
      const candidate = this.listeners.get(pathToModule);
      if (candidate) candidate.graph = candidate.graph.concat(graph);
    }
  }
}