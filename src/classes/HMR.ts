import Ogone from '../main/OgoneBase.ts';
import { Document, HTMLIFrameElement } from '../ogone.dom.d.ts';
import { WebSocketServer, WS } from '../../deps/ws.ts';
import { HTMLOgoneElement } from '../ogone.main.d.ts';

declare const document: Document;
export default class HMR {
  static FIFOMessages: string[] = [];
  static port = 3434;
  static components: { [k: string]: HTMLOgoneElement[] } = {};
  static server?: WebSocketServer;
  static client?: WebSocket;
  static ogone?: typeof Ogone;
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
      console.warn('[Ogone] server asking for updates.');
      const payload = JSON.parse(evt.data);
      const { uuid, output, error, errorFile } = payload;
      const savedComponents = this.components[uuid];
      if (error) {
        console.error(error);
        Ogone.displayError(errorFile || 'Error found in application.', 'TypeError', new Error(error));
        return;
      }
      if (savedComponents) {
        const components = savedComponents.filter((component) => component.isOriginalNode && component.isTemplate);
        const replacement = eval(`((Ogone) => {
          ${output}
          console.warn('[Ogone] references are updated.');
        })`);
        replacement(Ogone);
        console.warn('[Ogone] rendering new components.', uuid);
        components.forEach((component) => {
          component.rerender();
        });
        console.warn(Object.keys(this.components).length)
      }
    };
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
}