export default function routerMethods(component: any, node: any, opts: any) {
  const { isRouter } = opts;
  if (!isRouter) {
    return `
    triggerLoad() {}
    routerSearch() {}
    setActualRouterTemplate() {}
    renderRouter() {}`;
  }
  return `
    triggerLoad() {
      const o = this.ogone;
      const oc = o.component;
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
      if (typeof locationPath !== 'string') return false;
      const { path } = route;
      const splitted = path.toString().split('/');
      const locationSplit = locationPath.split('/');
      const result = {};
      if (!splitted.filter(r => r.trim().length).length !== !locationSplit.filter(r => r.trim().length).length) return;
      if (splitted.length !== locationSplit.length) return false;
      const error = splitted.find((p,i, arr) => {
        if (!p.startsWith(':')) {
          return locationSplit[i] !== p;
        }
      });
      if (error) return false;
      splitted.forEach((p, i, arr) => {
        if (p.startsWith(':')) {
          const param = p.slice(1, p.length);
          arr[i] = null;
          result[param] = locationSplit[i];
        }
      });
      route.params = result;
      return true;
    }
    setActualRouterTemplate() {
      const o = this.ogone;
      const oc = o.component;

      oc.routes = o.routes;
      oc.locationPath = o.locationPath;
      const l = oc.locationPath;
      let rendered = oc.routes.find((r) => r.path === l || this.routerSearch(r,l) || r.path === 404);
      let preservedParams = rendered.params;

      // redirections
      while (rendered && rendered.redirect) {
        rendered = oc.routes.find((r) => r.name === rendered.redirect);
        if (rendered) {
          rendered.params = preservedParams;
        }
      }
      if (!rendered) {
        o.actualTemplate = [new Comment()];
        o.actualRoute = null;
        o.routeChanged = true;
      } else if (rendered && !(rendered.once || o.actualRoute === rendered.component)) {
        const { component: uuidC } = rendered;
        const co = document.createElement('template', { is: uuidC });
        o.actualTemplate = [co];
        o.actualRoute = rendered.component;
        o.actualRouteName = rendered.name || null;
        o.routeChanged = true;
        // don't spread o
        // some props of o can overwritte the template.ogone and create errors in context
        // like undefined data
        co.setOgone({
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
        });

        // if the route provide any title
        // we change the title of the document

        if (rendered.title) {
          document.title = rendered.title;
        }
      } else {
        o.routeChanged = false
      }
    }
    renderRouter() {
      const o = this.ogone;
      const oc = o.component;

      // update Props before replacement of the element
      oc.updateProps();

      // we will use o.replacer cause it's used in the flag if
      if (!o.actualTemplate) {
        o.actualTemplate = o.replacer;
      }
      if (this.isConnected) {
        this.replaceWith(...o.actualTemplate);
        o.replacer = o.actualTemplate;
      } else if (o.routeChanged) {
        const replacer = o.replacer && o.replacer[0].ogone ?
          [[o.replacer[0].context.placeholder], o.replacer[0].ogone.nodes].find(n => n[0].isConnected)
          : o.replacer;
        if (!replacer) return;
        replacer.slice(1, replacer.length).forEach(n => n.remove());
        for (let n of replacer) {
          n.isConnected ? n.replaceWith(...o.actualTemplate) : '';
        }
        o.replacer[0] && o.replacer[0].isComponent ? o.replacer[0].destroy() : 0;
      }
      if (o.actualTemplate && o.actualTemplate[0].ogone && o.actualTemplate[0].isConnected) {
        // router stopped cause the template is still connected to the document
        // it means that they were an error in the component provided in router

        Ogone.error(\` router stopped: the template is still connected to the document. It seems like there is an error in the component provided in the router\`,
          'RouterError during rendering',
          { message: \`path: $\{o.actualRoute}\nname: $\{o.actualRouteName}\` });
      } else {
        o.replacer = o.actualTemplate;
      }
      oc.runtime(o.actualRouteName || o.locationPath, history.state);
    }
  `;
}
