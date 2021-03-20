import Ogone from '../main/OgoneBase.ts';
import { Document, HTMLIFrameElement, HTMLUListElement } from '../ogone.dom.d.ts';
import { WebSocketServer, WebSocketAcceptedClient } from '../../deps/ws.ts';
import { HTMLOgoneElement } from '../ogone.main.d.ts';
import { ModuleErrorsDiagnostic } from './ModuleErrors.ts';

declare const document: Document;
declare const window: any;
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
  connection: WebSocketAcceptedClient;
  role: ClientRole;
}
export default class HMR {
  static FIFOMessages: string[] = [];
  static port = 3434;
  /**
   * if the session has an error
   */
  static isInErrorState = false;
  /**
   * if the session need to reload
   */
  static isWaitingForServerPort = false;
  private static _panelInformations?: HTMLUListElement;
  static heartBeatIntervalTime = 500;
  static heartBeatInterval: ReturnType<typeof setInterval>;
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
  static get isInBrowser(): boolean {
    return typeof document !== 'undefined';
  }
  static get panelInformations(): HTMLUListElement {
    if (!this.isInBrowser) throw new Error('cannot use panelInformations outside the browser');
    return this._panelInformations || (this._panelInformations = document.createElement('ul'))
  }
  static useOgone(ogone: typeof Ogone) {
    if (this.isInBrowser) {
      this.ogone = ogone;
      this.clientSettings();
    }
  }
  static clientSettings(shouldReload?: boolean): void {
    try {
      this.client = new WebSocket(this.connect);
    } catch(err) {
      return;
    }
    setTimeout(() => {
      if (this.checkHeartBeat()) {
        if (shouldReload) {
          this.clearInterval();
          this.showHMRMessage('HMR reconnected, waiting for reload message', 'success');
          this.isWaitingForServerPort = true;
        }
      } else {
        this.showHMRMessage('heart beat goes on false', 'warn');
      }
    }, this.heartBeatIntervalTime);
    this.client.onmessage = (evt: any) => {
      const payload = JSON.parse(evt.data);
      const { uuid, output, error, errorFile, diagnostics, type, pathToModule, uuidReq, port } = payload;
      if (type === 'server') {
        window.location.replace(`http://localhost:${port}/`);
      }
      if (type === 'resolved') {
        this.isInErrorState = false;
        this.hideHMRMessage();
        return;
      }
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
        this.hideHMRMessage();
        this.isInErrorState = true;
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
          let sourceline = diag && sourceLine || '';
          sourceline = repeatNumber >= 0 ?
          sourceline.substring(0, start)
            + '<span class="critic">'
            + sourceline.substring(start, end)
            + '</span>'
            + sourceline.substring(end) :
            sourceline;
          // add the error
          errorMessage = `
<span class="critic">TS${diag && diag.code} [ERROR] </span>${diag && diag.messageChain && diag.messageChain.messageText || diag && diag.messageText || ''}
${this.renderChainedDiags(diag && diag.messageChain && diag.messageChain.next || [])}
${sourceline}
`;
          this.showHMRMessage(`
${messageText || errorFile || 'Error found in application.'}
${errorMessage}
          `);
          /*
          Ogone.displayError(messageText || errorFile || 'Error found in application.', `TS${diag.code}` || 'TypeError', new Error(`
            ${errorMessage}
          `));
          */
        })
        return;
      }
      this.rerenderComponents(uuid, output);
    };
    // start checking if the server is still ok
    this.startHearBeat();
  }
  static renderChainedDiags(chainedDiags: ModuleErrorsDiagnostic[]): string {
    let result = ``;
    if (chainedDiags && chainedDiags.length) {
      for (const d of chainedDiags) {
        const diag = d as (ModuleErrorsDiagnostic);
        result += `<span class="critic">TS${diag.code} [ERROR] </span>`;
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
    this.server.on('connection', (ws: WebSocketAcceptedClient) => {
      this.cleanClients();
      const key = `client_${crypto.getRandomValues(new Uint16Array(10)).join('')}`;
      HMR.clients.set(key, {
        ready: false,
        connection: ws,
        role: 0,
      });
    });
  }
  static postMessage(obj: Object) {
    this.cleanClients();
    const message = JSON.stringify(obj);
    const entries = Array.from(this.clients.entries());
    entries.forEach(([key, client]) => {
      if (client?.connection.state !== 1
        && !client.connection.isClosed
        && !this.FIFOMessages.includes(message)) {
        this.FIFOMessages.push(message);
      } else if (!client.ready) {
        this.sendFIFOMessages(key);
      }
      if (client && !client.connection.isClosed) {
        try {
          client.connection.send(message);
        } catch (err) {}
      }
    })
  }
  static cleanClients() {
    const entries = Array.from(this.clients.entries());
    entries.forEach(([key, client]) => {
      if (client.connection.isClosed) {
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
        client.ready = client.connection.state === 1
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
      this.clearInterval();
      this.client.send(JSON.stringify({
        type: 'close',
      }));
    }
  }
  static clearInterval() {
    clearInterval(this.heartBeatInterval);
  }
  static checkHeartBeat(): boolean {
    let heartbeat = true;
    if (this.client) {
      if (this.client.readyState > 1) {
        heartbeat = false;
      } else {
        try {
          this.client.send('');
        } catch(err) {
          heartbeat = false;
        }
      }
    }
    return heartbeat;
  }
  static startHearBeat() {
    this.clearInterval();
    this.heartBeatInterval = setInterval(() => {
      if (!this.checkHeartBeat()) {
        this.showHMRMessage('HMR disconnected - retrying in 1s ...');
        this.clearInterval();
        setTimeout(() => {
          this.showHMRMessage('HMR disconnected - sending heart beat message');
          this.clientSettings(true);
        }, 1000);
      }
    }, this.heartBeatIntervalTime);
  }
  static showHMRMessage(message: string, messageType: string ='') {
    if (this.isInBrowser) {
      if (!this.panelInformations.isConnected) {
        const style = document.createElement('style');
        style.innerHTML = /*css */`
        .hmr--panel {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: fixed;
          z-index: 50000;
          background: #2a2a2d;
          width: 100vw;
          height: 100vh;
          top: 0;
          margin: 0;
          overflow: auto;
          list-style: none;
        }
        .hmr--message {
          padding: 5px;
          margin: 0px 2px;
          color: #efefef;
          font-family: sans-serif;
        }
        .hmr--message .hmr--infos {
          color: #4a4a4d;
        }
        .hmr--message .hmr--title {
          color: #7d7a7d;
        }
        .hmr--message .hmr--message {
          color: inherit;
          white-space: pre;
        }
        .hmr--message .error {
          color: #fb7191;
        }
        .hmr--message .success {
          color: #91fba1;
        }
        .hmr--message .critic {
          color: #ff7191;
          text-decoration: underline;
        }
        .hmr--message .warn {
          color: #fff2ae;
        }
        `;
        document.body.append(this.panelInformations);
        document.head.append(style);
      }
      this.addMessageToHMR(message, messageType)
      if (!this.panelInformations.classList.contains('hmr--panel')) {
        this.panelInformations.classList.add('hmr--panel');
      }
    }
  }
  static addMessageToHMR(message: string, type: string = '') {
    this.panelInformations.innerHTML +=`
    <li class="hmr--message">
      <span class="hmr--infos">${new Date().toUTCString()}</span><span class="hmr--title"> Ogone - </span><span class="hmr--message ${type}"> ${message}</span> </li>
    `;
  }
  static hideHMRMessage() {
    if (this.isInErrorState) return;
    this.panelInformations.classList.remove('hmr--panel');
    this.panelInformations.innerHTML = '';
  }
}
window.addEventListener('unload', () => {
  HMR.beforeClosing();
});