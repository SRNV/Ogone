import Ogone from '../classes/main/Ogone.ts';
import { PopStateEvent, Location } from '../ogone.dom.d.ts';
declare const location: Location;
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

    history.pushState(state || {}, "", url || "/");
  },
};
// @ts-ignore
window.onpopstate = function (event: PopStateEvent) {
  Ogone.router.go(location.pathname, event.state);
};
