enum Deployer {
    App = `
const app = new (class {
  private decoder = new TextDecoder();
  private HTML: Uint8Array = [{% HTML %}];
  private CSS: Uint8Array = [{% CSS %}];
  private JS: Uint8Array = [{% JS %}];
  /**
   * HTML provider
   * */
  private _template: string;
  get template(): string {
    let result = this.decoder.decode(this.HTML);
    if (this._template) return this._template;
    this._template = result;
    return result;
  }
  /**
   * JS provider
   * */
  private _script: string;
  get script(): string {
    let result = this.decoder.decode(this.JS);
    if (this._script) return this._script;
    this._script = result;
    return result;
  }
  /**
   * CSS provider
   * */
  private _style: string;
  get style(): string {
    let result = this.decoder.decode(this.HTML);
    if (this._style) return this._style;
    this._style = result;
    return result;
  }
})();
function handleRequest(request) {
  switch(true) {
    case request.url === '/app.js':
      return new Response(app.script, {
        headers: {
          "content-type": "application/javascript; charset=UTF-8",
        },
      });
    case request.url === '/style.css':
      return new Response(app.style, {
        headers: {
          "content-type": "text/css; charset=UTF-8",
        },
      });
    default:
      return new Response(app.template, {
        headers: {
          "content-type": "text/html; charset=UTF-8",
        },
      });
      break;
  }
}
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
`
}
export default Deployer;