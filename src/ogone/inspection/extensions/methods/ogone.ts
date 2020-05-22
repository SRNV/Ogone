import Ogone from "../../../index.ts";

export default function setOgoneMethod(component: any, node: any, opts: any): string {
  const { isTemplate, isRouter, isAsyncNode } = opts;
    const componentPragma = node.pragma(
      component.uuid,
      true,
      Object.keys(component.imports),
      (tagName: string) => {
        if (component.imports[tagName]) {
          const newcomponent = Ogone.components.get(component.imports[tagName]);
          if (!newcomponent) return null;
          return newcomponent.uuid;
        }
        return null;
      },
    );
  return `
  setOgone(def = {}) {
    this.ogone = {

      // int[]
      ${isTemplate ? "position: [0]," : ""}

      // int[]
      positionInParentComponent: [0],

      // int
      levelInParentComponent: 0,

      // int
      ${isTemplate ? "index: 0," : ""}

      // int, position[level] = index
      ${isTemplate ? "level: 0," : ""}

      // define component
      ${isTemplate ? "component: this.component," : ""}

      // get from router the parameters
      ${isTemplate ? "params: null," : ""}

      // define parentComponent
      parentComponent: null,

      // jsx function
      render: null,

      // register all nodes of template or custom element
      nodes: [],

      // {}[]
      directives: null,

      // replacer is used for --ifElse directive
      replacer: null,

      // critical function
      getContext: null,

      // set as false by the component, preserves from maximum call stack
      originalNode: true,

      // promise for await directive
      promise: null,

      // set unique key
      key: '${node.id}'+\`\${Math.random()}\`,

      // set routes if component is a router
      ${isRouter ? `routes: ${JSON.stringify(component.routes)},` : ""}

      // set the location
      ${isRouter ? `locationPath: location.pathname,` : ""}

      // set the actualTemplate of the router
      ${isRouter ? `actualTemplate: null,` : ""}

      // save the route
      ${isRouter ? "actualRoute: null," : ""}
      ${isRouter ? "actualRouteName: null," : ""}

      // whenever the route change
      ${isRouter ? "routeChanged: true," : ""}

      // set state to pass it through the history.state
      ${
  isRouter
    ? `
            historyState: { ...(() => {
              const url = new URL(location.href);
              const query = new Map(url.searchParams.entries());
              return { query }
            })(),  },`
    : ""
}

      // overwrite properties
      ...def,
    };
    // use the jsx function and save it into this.ogone.render
    // this function generates all the childNodes or the template
    this.ogone.render = ${
  componentPragma
    .replace(/\n/gi, "")
    .replace(/\s+/gi, " ")
}
    // set Async context for Async nodes
    ${isAsyncNode ? 'this.setNodeAsyncContext();':''}
  }
  `;
}