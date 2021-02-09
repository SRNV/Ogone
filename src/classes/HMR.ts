// this file is used inside a worker
import Ogone from '../main/OgoneBase.ts';
import { Document, HTMLIFrameElement } from '../ogone.dom.d.ts';
import { WebSocketServer, WS } from '../../deps/ws.ts';

declare const document: Document;
export default class HMR {
  static port = 3434;
  static server?: WebSocketServer;
  static client?: WebSocket;
  static ogone?: typeof Ogone;
  static get connect (): string {
    return `ws://0.0.0.0:${this.port}/`
  }
  static useOgone(ogone: typeof Ogone) {
    if (typeof document !== "undefined") {
      // create the iframe connected to the websocket
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      // start iframe dynamisation
      iframe.name = "HMR_IFRAME";
      iframe.hidden = true;
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      this.setDocumentIframe(iframe);
      this.ogone = ogone;
    }
  }
  static setDocumentIframe(iframe: HTMLIFrameElement): void {
    this.client = new WebSocket(this.connect);
    this.client.onmessage = (evt: any) => {
      this.updateIframe(iframe, evt.data);
    };
    this.updateIframe(iframe);
  }
  static updateIframe(iframe: HTMLIFrameElement, script: string = 'true') {
    iframe.srcdoc = `
    <script defer async type="module">
      window.setOgone = (Ogone, script) => {
        eval(script);
        console.warn('[Ogone] HMR update');
      };
    </ script>
    `.replace(/(?<=\<\/)\s+(?=script)/i, '');
    // @ts-ignore created inside the iframe
    if (iframe.contentWindow?.setOgone) {
      // @ts-ignore
      iframe.contentWindow.setOgone(this.ogone, script);
    }
  }
}