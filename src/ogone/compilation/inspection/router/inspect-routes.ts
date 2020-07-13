import { Bundle, Component, Route } from "../../../../../.d.ts";
import { Utils } from "../../../../../classes/utils/index.ts";
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
function startRecursiveRouterInspection(
  bundle: Bundle,
  component: Component,
  route: Route,
  opts: any,
) {
  if (!route) return;
  const keys = Object.keys(route);
  const unsupported = keys.find((k) => !allowedKeys.includes(k));
  const missingKey = requiredKeys.find((k) => !(k in route));
  if (missingKey) {
    Utils.error(
      `[Ogone] ${missingKey} is undefined in one route of component ${component.file}`,
    );
  }
  if (unsupported) {
    Utils.error(
      `[Ogone] ${unsupported} is not supported in this version of Ogone
      error found in: ${component.file}`,
    );
  }

  if (route.component) {
    const c = component.imports[route.component];
    if (c) {
      if (!bundle.components.get(c)) {
        Utils.error(
          `incorrect path: ${c} is not a component. error found in: ${component.file}`,
        );
      }
      const newcomp = bundle.components.get(c);
      if (newcomp) {
        route.component = `${newcomp.uuid}-nt`;
      }
    } else {
      Utils.error(
        `${route.component} is not imported in the component.
        please use this syntaxe to import a component: use @/... as '${route.component}'
        error found in: ${component.file}`,
      );
    }
  }
  if (route.path && opts.parentPath) {
    route.path = `${opts.parentPath}/${route.path}`;
    route.path = route.path.replace(/\/\//gi, "/");
  }
  if (route.children) {
    if (!Array.isArray(route.children)) {
      Utils.error(`[Ogone] route.children should be an Array.
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
export default function inspectRoutes(
  bundle: Bundle,
  component: Component,
  routes: Route[],
): Route[] {
  if (!Array.isArray(routes)) {
    Utils.error(
      `[Ogone] inspectRoutes is waiting for an array as argument 2.
        error found in: ${component.file}`,
    );
  }
  const opts = {
    parentPath: null,
    routes: [],
  };
  routes.forEach((route) => {
    startRecursiveRouterInspection(bundle, component, route, opts);
  });
  return opts.routes;
}
