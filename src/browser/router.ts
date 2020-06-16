export default
`
Ogone.router = {
  react: [],
  actualRoute: null,
  go: (url, state) => {
    if (Ogone.router.actualRoute === url) return;
    // protect from infinite loop
    Ogone.router.actualRoute = url;
    Ogone.router.react.forEach((r, i, arr) => {
      if (r && !r(url, state)) delete arr[i];
    });
    history.pushState(state || {}, "", url || "/");
  },
};
window.onpopstate = function (event) {
  Ogone.router.go(location.pathname, event.state);
};
`