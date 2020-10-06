// @ts-nocheck
const getClassRouter = (klass) =>
  class extends (Ogone.classes.component(klass)) {
    constructor() {
      super();
      this.type = "router";
    }
    triggerLoad() {
      const o = this.ogone, oc = o.component;
      const rr = Ogone.router.react;
      oc.runtime(0, o.historyState);
      rr.push((path) => {
        o.locationPath = path;
        this.setActualRouterTemplate();
        this.renderRouter();
        return oc.activated;
      });
    }
    routerSearch(route, locationPath) {
      const o = this.ogone, oc = o.component;
      if (typeof locationPath !== "string") return false;
      const { path } = route;
      const splitted = path.toString().split("/");
      const locationSplit = locationPath.split("/");
      const result = {};
      if (
        !splitted.filter((r) => r.trim().length).length !==
        !locationSplit.filter((r) => r.trim().length).length
      ) {
        return;
      }
      if (splitted.length !== locationSplit.length) return false;
      const error = splitted.find((p, i, arr) => {
        if (!p.startsWith(":")) {
          return locationSplit[i] !== p;
        }
      });
      if (error) return false;
      splitted.forEach((p, i, arr) => {
        if (p.startsWith(":")) {
          const param = p.slice(1, p.length);
          arr[i] = null;
          result[param] = locationSplit[i];
        }
      });
      route.params = result;
      return true;
    }
    setActualRouterTemplate() {
      const o = this.ogone, oc = o.component;
      oc.routes = o.routes;
      oc.locationPath = o.locationPath;
      const l = oc.locationPath;
      let rendered = oc.routes.find((r) =>
        r.path === l || this.routerSearch(r, l) || r.path === 404
      );
      let preservedParams = rendered.params;
      // redirections
      while (rendered && rendered.redirect) {
        rendered = oc.routes.find((r) => r.name === rendered.redirect);
        if (rendered) {
          rendered.params = preservedParams;
        }
      }
      if (rendered) {
        o.actualRouteName = rendered.name || null;
      }
      if (!rendered) {
        o.actualTemplate = new Comment();
        o.actualRoute = null;
        o.routeChanged = true;
      } else if (
        rendered && !(rendered.once || o.actualRoute === rendered.component)
      ) {
        const { component: uuidC } = rendered;
        const co = document.createElement("template", { is: uuidC });
        o.actualTemplate = co;
        o.actualRoute = rendered.component;
        o.routeChanged = true;
        // don't spread o
        // some props of o can overwritte the template.ogone and create errors in context
        // like undefined data
        let ogoneOpts = {
          isTemplate: true,
          isRouter: false,
          isStore: false,
          extends: "-nt",
          uuid: rendered.uuid,
          tree: o.tree,
          params: rendered.params || null,
          props: o.props,
          parentComponent: o.parentComponent,
          parentCTXId: o.parentCTXId,
          positionInParentComponent: o.positionInParentComponent
            .slice(),
          levelInParentComponent: o.levelInParentComponent,
          index: o.index,
          level: o.level,
          position: o.position,
          flags: o.flags,
          isRoot: false,
          name: rendered.name || rendered.component,
          parentNodeKey: o.key,
        };
        co.setOgone(ogoneOpts);
        ogoneOpts = null;
        // if the route provide any title
        // we change the title of the document

        if (rendered.title) {
          document.title = rendered.title;
        }
      } else {
        o.routeChanged = false;
      }
    }
    renderRouter() {
      const o = this.ogone, oc = o.component;
      // update Props before replacement of the element
      oc.updateProps();
      if (!o.replacer) {
        o.replacer = document.createElement('section');
      }
      if (this.parentNode) {
        this.replaceWith(o.replacer);
      }
      if (o.routeChanged) {
        o.replacer.innerHTML = "";
        o.replacer.append(o.actualTemplate);
      }
      // run case router:xxx on the router component
      oc.runtime(`router:${o.actualRouteName || o.locationPath}`, history.state);
    }
  };
export default getClassRouter.toString();