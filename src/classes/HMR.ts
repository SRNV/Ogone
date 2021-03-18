import Ogone from '../main/OgoneBase.ts';
import { Document, HTMLIFrameElement } from '../ogone.dom.d.ts';
import { WebSocketServer, WS } from '../../deps/ws.ts';
import { HTMLOgoneElement } from '../ogone.main.d.ts';
import { ModuleErrorsDiagnostic } from './ModuleErrors.ts';

declare const document: Document;
declare const window: any;
declare const LSP_HSE_RUNNING: boolean;
interface ModuleGraph {
  listeners: Function[];
  graph: string[];
}
enum ClientRole {
  /**
   * getting only updates on Saving events
   */
  Standard = 0,
  /**
   * getting updates while editing
   */
  Edition = 1,
}
interface Client  {
  ready: boolean;
  connection: WebSocket;
  role: ClientRole;
}
export default class HMR {
  static FIFOMessages: string[] = [];
  static port = 3434;
  static components: { [k: string]: HTMLOgoneElement[] } = {};
  static server?: WebSocketServer;
  static client?: WebSocket;
  /**
   * only Deno side
   */
  static clients: Map<string, Client> = new Map();
  static ogone?: typeof Ogone;
  static listeners: Map<string, ModuleGraph> = new Map();
  static get connect (): string {
    return `ws://0.0.0.0:${this.port}/`
  }
  static startHandshake() {

  }
  static async sendError(error: string, diagnostics: ModuleErrorsDiagnostic[]) {
    this.postMessage({
      error,
      diagnostics,
    });
  }
  static useOgone(ogone: typeof Ogone) {
    /**
     * check if HSE (Hot Scoped Editor)
     * is currently
     * running on the browser.
     */
    if (typeof LSP_HSE_RUNNING !== "undefined") {
      return;
    }
    if (typeof document !== "undefined") {
      this.ogone = ogone;
      this.clientSettings();
    }
  }
  static clientSettings(): void {
    this.client = new WebSocket(this.connect);
    this.client.onmessage = (evt: any) => {
      const payload = JSON.parse(evt.data);
      const { uuid, output, error, errorFile, diagnostics, type, pathToModule, uuidReq } = payload;
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
        let errorUuid: string | undefined;
        (diagnostics as  ModuleErrorsDiagnostic[]).forEach((diag) => {
          let errorMessage = '';
          const { sourceLine, messageText } = diag;
          if (diag) {
            errorUuid = diag.fileName && diag.fileName.match(/(?<=\/)(?<uuid>[\w\d\-]+?)\.tsx$/)?.groups?.uuid || undefined;
          }
          const start = diag.start && diag.start.character || 0;
          const end = diag.end && diag.end.character || 0;
          const repeatNumber = end - start - 1
          const underline = `${' '.repeat(start)}^${'~'.repeat(repeatNumber > 0 ? repeatNumber : 0)}`
          let sourceline = diag && sourceLine || '';
          sourceline = repeatNumber >= 0 ?
          sourceline.substring(0, start)
            + sourceline.substring(start, end)
            + sourceline.substring(end) :
            sourceline;
          // add the error
          errorMessage = `
          TS${diag && diag.code} [ERROR] ${diag && diag.messageChain && diag.messageChain.messageText || diag && diag.messageText || ''}
        ${this.renderChainedDiags(diag && diag.messageChain && diag.messageChain.next || [])}
          ${sourceline}
          ${underline}`;
          Ogone.displayError(messageText || errorFile || 'Error found in application.', `TS${diag.code}` || 'TypeError', new Error(`
            ${errorMessage}
          `));
        })
        return;
      }
      this.rerenderComponents(uuid, output);
    };
  }
  static renderChainedDiags(chainedDiags: ModuleErrorsDiagnostic[]): string {
    let result = ``;
    if (chainedDiags && chainedDiags.length) {
      for (const d of chainedDiags) {
        const diag = d as (ModuleErrorsDiagnostic);
        result += `TS${diag.code} [ERROR] `;
        result += `${diag && diag.messageText}\n`
      }
    }
    return result;
  }
  static rerenderComponents(uuid: string, output?: string) {
    const savedComponents = this.components[uuid];
    if (savedComponents) {
      const renderedRouter = savedComponents.filter(c => c.routerCalling?.isRouter
        && c.routerCalling.isOriginalNode);
      const components = savedComponents.map((component) => component.isTemplate && component.original );
      if (output) {
        console.warn(components);
        const replacement = eval(`((Ogone) => {
          ${output}
          console.warn('[Ogone] references are updated.');
        })`);
        replacement(Ogone);
      }
      console.warn('[Ogone] rendering new components.');
      /**
       * remove previously generated components
       */
      savedComponents.splice(0);
      renderedRouter.forEach((component) => {
        component.routerCalling?.rerender();
      });
      components.forEach((component) => {
        if (component) component.rerender();
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
      const key = `client_${crypto.getRandomValues(new Uint16Array(10)).join('')}`;
      HMR.clients.set(key, {
        ready: false,
        connection: ws,
        role: 0,
      });
      HMR.sendFIFOMessages(key);
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.warn(message);
        if (message.type === 'closing') {
          HMR.clients.delete(key);
        }
      };
    });
  }
  static postMessage(obj: Object) {
    this.cleanClients();
    const message = JSON.stringify(obj);
    const entries = Array.from(this.clients.entries());
    entries.forEach(([key, client]) => {
      if (client?.connection.readyState !== 1
        && !this.FIFOMessages.includes(message)) {
        this.FIFOMessages.push(message);
      } else if (!client.ready) {
        this.sendFIFOMessages(key);
      }
      if (client) {
        try {
          client.connection.send(message);
        } catch (err) {}
      }
    })
  }
  static cleanClients() {
    const entries = Array.from(this.clients.entries());
    entries.forEach(([key, client]) => {
      if (client.connection.readyState > 1) {
        this.clients.delete(key);
      }
    });
  }
  static async sendFIFOMessages(id: string) {
    // if (this.client?.readyState !== 1) return;
    const entries = Array.from(this.clients.entries())
      .filter(([key, client]) => !client.ready && key === id)
    entries.forEach(([key, client]) => {
      this.FIFOMessages.forEach((m: string) => {
        client.connection.send(m);
        client.ready = client.connection.readyState === 1
          && true;
      });
    });
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
  static beforeClosing() {
    if (typeof document === 'undefined') {
      this.postMessage({
        type: 'close',
      })
    } else if (this.client) {
      this.client.send(JSON.stringify({
        type: 'close',
      }));
    }
  }
}
window.addEventListener('unload', () => {
  HMR.beforeClosing();
});