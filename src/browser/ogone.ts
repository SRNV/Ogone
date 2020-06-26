import { OgoneBrowser } from "../../types/ogone.ts";
let _this: OgoneBrowser;
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
    error(message, errorType, errorObject) {
      // here we render the errors in development
      if (!_this.errorPanel) {
        const p = document.createElement("div");
        const h = document.createElement("div");
        Object.entries({
          zIndex: "5000000",
          background: "#00000097",
          width: "100vw",
          height: "100vh",
          position: "fixed",
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
        _this.errorPanel = p;
        _this.errorPanel.append(h);
        _this.historyError = h;
      }
      _this.errors++;
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
      const errorId = _this.errors;
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
        stack.innerText = `${
          errorObject && errorObject.message ? errorObject.message : ""
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
        Math.round((_this.firstErrorPerf / performance.now()) * 30) + 30;
      errorPin.style.left = _this.firstErrorPerf
        ? `${relativePinPosition}px`
        : "30px";
      if (!_this.firstErrorPerf) {
        _this.firstErrorPerf = performance.now();
      }
      _this.errorPanel.style.paddingTop = "30px";
      // set the grid of errors
      err.style.gridArea = `e${errorId}`;
      const m = 2;
      let grid = "";
      let i = 0;
      let a = 0;
      for (i = 0, a = _this.errorPanel.childNodes.length + 1; i < a; i++) {
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
      _this.errorPanel.style.gridGap = "10px";
      _this.errorPanel.style.gridAutoRows = "max-content";
      _this.errorPanel.style.gridTemplateAreas = newgrid;
      err.style.animationName = "popup";
      err.style.animationIterationCoutn = "1";
      err.style.animationDuration = "0.5s";
      // append elements
      err.append(h, code, stack);
      _this.errorPanel.append(err);
      _this.errorPanel.append(errorPin);
      _this.errorPanel.style.pointerEvents = "scroll";
      //  append only if it's not in the document
      !_this.errorPanel.isConnected
        ? document.body.append(_this.errorPanel)
        : [];
    },
  };
}
export default _OGONE_BROWSER_CONTEXT.toString()
  .replace(/_this/gi, "this")
  .replace("function _OGONE_BROWSER_CONTEXT() {", "")
  .slice(0, -1);
