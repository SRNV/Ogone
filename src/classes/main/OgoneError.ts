import OgoneBase from "./OgoneBase.ts";
import { Document } from '../../ogone.dom.d.ts';
declare const document: Document;
export default abstract class OgoneError extends OgoneBase {
  static displayError(message: string, errorType: string, errorObject: Error) {
    // here we render the errors in development
    if (!OgoneError.errorPanel) {
      const p = document.createElement("div");
      Object.entries({
        zIndex: "5000000",
        background: "#00000097",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: "0px",
        left: "0px",
        overflowY: "auto",
        justifyContent: "center",
        display: "grid",
        flexDirection: "column",
      }).forEach(([key, value]: [string, string]) => {
        p.style[key as unknown as number] = value;
      });
      OgoneError.errorPanel = p;
    }
    OgoneError.errors++;
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
    }).forEach(([key, value]) => err.style[key as unknown as number] = value);
    const errorId = OgoneError.errors;
    const code = document.createElement("code");
    const stack = document.createElement("code");
    const h = document.createElement("h4");
    // set the text
    h.innerText = `[Ogone] Error ${errorId}: ${errorType ||
      "Undefined Type"}`;
    code.innerText = `${message.trim()}`;
    stack.innerText = `${
      errorObject && errorObject.stack ?
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
    if (!OgoneError.firstErrorPerf) {
      OgoneError.firstErrorPerf = performance.now();
    }
    if (OgoneError.errorPanel) {
      OgoneError.errorPanel.style.paddingTop = "30px";
      // set the grid of errors
      err.style.gridArea = `e${errorId}`;
      const m = 2;
      let grid = "";
      let i = 0;
      let a = 0;
      for (i = 0, a = OgoneError.errorPanel.childNodes.length + 1; i < a; i++) {
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
      OgoneError.errorPanel.style.gridGap = "10px";
      OgoneError.errorPanel.style.gridAutoRows = "max-content";
      OgoneError.errorPanel.style.gridTemplateRows = "masonry";
      OgoneError.errorPanel.style.gridTemplateAreas = newgrid;
      err.style.animationName = "popup";
      err.style.animationIterationCount = "1";
      err.style.animationDuration = "0.5s";
      // append elements
      err.append(h, code, stack);
      OgoneError.errorPanel.append(err);
      OgoneError.errorPanel.style.pointerEvents = "scroll";
      //  append only if it's not in the document
      !OgoneError.errorPanel.isConnected
        ? document.body.append(OgoneError.errorPanel)
        : [];
    }
  };

}