import { OgoneBrowser } from "../../types/ogone.ts";

let Ogone: OgoneBrowser;
function _OGONE_BROWSER_CONTEXT() {
  Ogone.router = {
    react: [],
    actualRoute: null,
    go: (url: string, state: any) => {
      if (!Ogone.router) return;
      if (Ogone.router.actualRoute === url) return;
      // protect from infinite loop
      Ogone.router.actualRoute = url;
      Ogone.router.react.forEach((r, i, arr) => {
        if (r && !r(url, state)) delete arr[i];
      });
      // @ts-ignore
      history.pushState(state || {}, "", url || "/");
    },
  };
  // @ts-ignore
  window.onpopstate = function (event) {
    // @ts-ignore
    Ogone.router.go(location.pathname, event.state);
  };
}
export default _OGONE_BROWSER_CONTEXT.toString()
  .replace(/_this/gi, "this")
  .replace("function _OGONE_BROWSER_CONTEXT() {", "")
  .slice(0, -1);
