import Ogone from '../classes/Ogone.ts';
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
window.onpopstate = function (event: PopStateEvent) {
  Ogone.router.go(location.pathname, event.state);
};
