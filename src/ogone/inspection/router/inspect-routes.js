const allowedKeys = [
  "path",
  "redirect",
  "component",
  "name",
  "children",
  "title",
  "once",
];
const requiredKeys = [
  "path",
  "component",
];
function startRecursiveRouterInspection(bundle, component, route, opts) {
  if (!route) return;
  const keys = Object.keys(route);
  const unsupported = keys.find((k) => !allowedKeys.includes(k));
  const missingKey = requiredKeys.find((k) => !route[k]);
  if (missingKey) {
    const RequiredPropertyIsUndefinedException = new Error(
      `[Ogone] ${missingKey} is undefined in one route of component ${component.file}`,
    );
    throw RequiredPropertyIsUndefinedException;
  }
  if (unsupported) {
    const UnsupportedRoutePropertyException = new Error(
      `[Ogone] ${unsupported} is not supported in this version of Ogone
      error found in: ${component.file}`,
    );
    throw UnsupportedRoutePropertyException;
  }

  if (route.component) {
    const c = component.imports[route.component];
    if (c) {
      if (!bundle.components.get(c)) {
        throw new Error(
          `[Ogone] incorrect path: ${c} is not a component. error found in: ${component.file}`,
        );
      }
      const { uuid } = bundle.components.get(c);
      route.component = `${uuid}-nt`;
    } else {
      const RouterUndefinedComponentException = new Error(
        `[Ogone] ${route.component} is not imported in the component.
        please use this syntaxe to import a component: use @/... as '${route.component}'
        error found in: ${component.file}`,
      );
      throw RouterUndefinedComponentException;
    }
  }
  if (route.path && opts.parentPath) {
    route.path = `${opts.parentPath}/${route.path}`;
    route.path = route.path.replace(/\/\//gi, "/");
  }
  if (route.children) {
    if (!Array.isArray(route.children)) {
      throw new TypeError(`[Ogone] route.children should be an Array.
        error found in: ${component.file}`);
    }

    route.children.forEach((child) => {
      startRecursiveRouterInspection(
        bundle,
        component,
        child,
        { routes: opts.routes, parentPath: route.path },
      );
    });
  }
  opts.routes.push(route);
}
export default function inspectRoutes(bundle, component, routes) {
  if (!Array.isArray(routes)) {
    const InpectRoutesWaitingForAnArrayException = new TypeError(
      `[Ogone] inspectRoutes is waiting for an array as argument 2.
        error found in: ${component.file}`,
    );
    throw InpectRoutesWaitingForAnArrayException;
  }
  const opts = {
    parentPath: null,
    // to discard to recursivity
    routes: [],
  };
  routes.forEach((route) => {
    startRecursiveRouterInspection(bundle, component, route, opts);
  });
  return opts.routes;
}
