import { Utils } from './Utils.ts';
import type { Bundle, Component, Route } from "../.d.ts";
/**
 * @name RouterAnalyzer
 * @code ORA-OSB4
 * @description under the step4: this class will inspect all the routes of the router components
 */
export default class RouterAnalyzer extends Utils {
  private allowedKeys = [
    "path",
    "redirect",
    "component",
    "name",
    "children",
    "title",
    "once",
  ];
  private requiredKeys = [
    "path",
    "component",
  ];
  private startRecursiveRouterInspection(
    bundle: Bundle,
    component: Component,
    route: Route,
    opts: any,
  ) {
    if (!route) return;
    const keys = Object.keys(route);
    const unsupported = keys.find((k) => !this.allowedKeys.includes(k));
    const missingKey = this.requiredKeys.find((k) => !(k in route));
    if (missingKey) {
      this.error(
        `${missingKey} is undefined in one route of component ${component.file}`,
      );
    }
    if (unsupported) {
      this.error(
        `${unsupported} is not supported in this version of Ogone
            error found in: ${component.file}`,
      );
    }

    if (route.component) {
      const c = component.imports[route.component];
      if (c) {
        if (!bundle.components.get(c)) {
          this.error(
            `incorrect path: ${c} is not a component. error found in: ${component.file}`,
          );
        }
        const newcomp = bundle.components.get(c);
        if (newcomp) {
          route.component = `${newcomp.uuid}-nt`;
          route.uuid = newcomp.uuid;
        }
      } else {
        this.error(
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
        this.error(`route.children should be an Array.
              error found in: ${component.file}`);
      }

      route.children.forEach((child) => {
        this.startRecursiveRouterInspection(
          bundle,
          component,
          child,
          { routes: opts.routes, parentPath: route.path },
        );
      });
    }
    opts.routes.push(route);
  }
  public inspectRoutes(
    bundle: Bundle,
    component: Component,
    routes: Route[],
  ): Route[] {
    if (!Array.isArray(routes)) {
      this.error(
        `inspectRoutes is waiting for an array as argument 2.
              error found in: ${component.file}`,
      );
    }
    const opts = {
      parentPath: null,
      routes: [],
    };
    routes.forEach((route) => {
      this.startRecursiveRouterInspection(bundle, component, route, opts);
    });
    return opts.routes;
  }
};
