
import type { OgoneBrowser } from "../../types/ogone.ts";
let document: any;
function _OGONE_BROWSER_CONTEXT() {
  // @ts-ignore
  const Ogone: OgoneBrowser = {
    // store
    stores: {},
    clients: [],

    render: {},
    contexts: {},
    components: {},
    classes: {},
    errorPanel: null,
    warnPanel: null,
    successPanel: null,
    infosPanel: null,
    historyError: null,
    errors: 0,
    firstErrorPerf: null,
    sound: null,
    oscillator: null,
    error(this: OgoneBrowser, message, errorType, errorObject) {
      // here we render the errors in development
      if (!this.errorPanel) {
        const p = document.createElement("div");
        const h = document.createElement("div");
        Object.entries({
          zIndex: "5000000",
          background: "#00000097",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: "0px",
          overflowY: "auto",
          justifyContent: "center",
          display: "grid",
          flexDirection: "column",
        }).forEach(([key, value]) => p.style[key] = value);
        h.style.width = "100vw";
        h.style.position = "fixed";
        h.style.background = "black";
        h.style.bottom = "26px";
        h.style.height = "20px";
        h.style.left = "0px";
        h.style.zIndex = "50000000";
        this.errorPanel = p;
        this.errorPanel.append(h);
        this.historyError = h;
      }
      this.errors++;
      const err = document.createElement("div");
      Object.entries({
        zIndex: "5000000",
        background: "#000000",
        minHeight: "fit-content",
        maxWidth: "70%",
        padding: "21px",
        color: "red",
        borderLeft: "3px solid red",
        margin: "auto",
        display: "inline-flex",
        flexDirection: "column",
      }).forEach(([key, value]) => err.style[key] = value);
      const errorId = this.errors;
      const code = document.createElement("code");
      const stack = document.createElement("code");
      const h = document.createElement("h4");
      const errorPin = document.createElement("div");
      // set the text
      h.innerText = `[Ogone] Error ${errorId}: ${errorType ||
        "Undefined Type"}`;
      code.innerText = `${message.trim()}`;
      stack.innerText = `${
        // @ts-ignore
        errorObject && errorObject.stack
          ? // @ts-ignore
          errorObject.stack.replace(message, "")
          : ""
        }`;
      // check if stack is empty or not
      if (!stack.innerText.length && errorObject && errorObject.message) {
        stack.innerText = `${errorObject && errorObject.message ? errorObject.message : ""
          }`;
      }
      !stack.innerText.length ? stack.innerText = "undefined stack" : "";
      // set the styles
      code.style.marginLeft = "20px";
      code.style.whiteSpace = "pre-wrap";
      code.style.wordBreak = "break-word";
      stack.style.marginLeft = "20px";
      stack.style.color = "#dc7373";
      stack.style.padding = "17px";
      stack.style.background = "#462626";
      stack.style.whiteSpace = "pre-wrap";
      stack.style.wordBreak = "break-word";
      stack.style.border = "1px solid";
      stack.style.marginTop = "10px";
      h.style.color = "#8c8c8c";
      errorPin.style.background = "red";
      errorPin.style.width = "13px";
      errorPin.style.height = errorPin.style.width;
      errorPin.style.position = "fixed";
      errorPin.style.bottom = "30px";
      errorPin.style.zIndex = "50000000";
      const relativePinPosition =
        Math.round((this.firstErrorPerf / performance.now()) * 30) + 30;
      errorPin.style.left = this.firstErrorPerf
        ? `${relativePinPosition}px`
        : "30px";
      if (!this.firstErrorPerf) {
        this.firstErrorPerf = performance.now();
      }
      this.errorPanel.style.paddingTop = "30px";
      // set the grid of errors
      err.style.gridArea = `e${errorId}`;
      const m = 2;
      let grid = "";
      let i = 0;
      let a = 0;
      for (i = 0, a = this.errorPanel.childNodes.length + 1; i < a; i++) {
        grid += `e${i + 1} `;
      }
      let b = i;
      while (i % m) {
        grid += `e${b} `;
        i++;
      }
      const cells = grid.split(" ");
      var o, j, temparray, chunk = m;
      let newgrid = "";
      for (o = 0, j = cells.length - 1; o < j; o += chunk) {
        temparray = cells.slice(o, o + chunk);
        newgrid += ` "${temparray.join(" ")}"`;
      }
      this.errorPanel.style.gridGap = "10px";
      this.errorPanel.style.gridAutoRows = "max-content";
      this.errorPanel.style.gridTemplateAreas = newgrid;
      err.style.animationName = "popup";
      err.style.animationIterationCoutn = "1";
      err.style.animationDuration = "0.5s";
      // append elements
      err.append(h, code, stack);
      this.errorPanel.append(err);
      this.errorPanel.append(errorPin);
      this.errorPanel.style.pointerEvents = "scroll";
      //  append only if it's not in the document
      !this.errorPanel.isConnected
        ? document.body.append(this.errorPanel)
        : [];
    },
  };
}
export default _OGONE_BROWSER_CONTEXT.toString()
  .replace("function _OGONE_BROWSER_CONTEXT() {", "")
  .slice(0, -1);
