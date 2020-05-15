
Ogone.router = {
  react: [],
  go: (url, state) => {
    Ogone.router.react.forEach((r,i, arr) => {
      if (r && !r(url, state)) delete arr[i];
    });
    history.pushState(state || {}, '', url || '/');
  },
};
window.onpopstate = function (event) {
  console.warn(event);
  Ogone.router.go(location.pathname, event.state);
  console.warn(Ogone.router.react);
};
console.warn(Ogone.router.go);