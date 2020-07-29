// @ts-nocheck
import {
  WebSocket,
  WebSocketServer,
} from "../../deps.ts";
import Env from "../../classes/env/Env.ts";
import Ogone from "../../classes/main/index.ts";
import { Bundle, Component, XMLNodeDescription } from "./../../.d.ts";

let ws: WebSocket | null = null;
// open the websocket
const wss: WebSocketServer = new WebSocketServer(1285);
//
let newApplicationCompilation: boolean = false;
// when client open the connection
// assign to ws the socket
wss.on("connection", (socket: WebSocket) => {
  ws = socket;
});
const watchingFiles: string[] = [];

export default async function HMR(modulePath: string): Promise<void> {
  if (watchingFiles.includes(modulePath)) return;
  watchingFiles.push(modulePath);
  const module = Deno.watchFs(modulePath);
  for await (let event of module) {
    const { kind, paths } = event;
    const url = paths[0].replace(Deno.cwd(), "");
    if (kind === "access" && ws) {
      ws.send(JSON.stringify({
        url,
        ...event,
        type: "javascript",
        timestamp: performance.now(),
      }));
    }
  }
}

const watchedFiles: string[] = [];
// hot component replacement
const componentRegistry: any = {
  styles: {},
  runtimes: {},
  nodes: {},
  components: {},
  lengthOfNodes: {},
};
function getPragma(
  bundle: Bundle,
  component: Component,
  node: XMLNodeDescription,
): string {
  if (node.pragma) {
    return node.pragma(bundle, component, true);
  }
  return "undefined";
}
function startSavingNodesDNA(component: any, registry: any, node: any) {
  const isTemplate = node.tagName === null && node.nodeType === 1;
  const uuid = `${component.uuid}-${!isTemplate ? node.id : "nt"}`;
  registry.nodes[uuid] = node.dna;
  if (node.childNodes) {
    for (let child of node.childNodes) {
      startSavingNodesDNA(component, componentRegistry, child);
    }
  }
}
async function startNodeCompareDNA(opts: any) {
  const {
    node,
    component,
    bundle,
    newBundle,
    newComponent,
    registry,
  } = opts;
  const uuid = `${component.uuid}-${node.id}`;
  const pragma = getPragma(newBundle, newComponent, node);
  let ctx: string = newBundle.contexts.find((c: string) =>
    c.indexOf(`${node.id}'] =`) > -1
  );
  let render = newBundle.render.find((r: string) =>
    r.indexOf(`${node.id}'] =`) > -1
  );
  let klass = newBundle.classes.find((k: string) =>
    k.indexOf(`${node.id}'] =`) > -1
  );
  let customElements = newBundle.customElements.find((c: string) =>
    c.indexOf(`${node.id}'`) > -1
  );
  if (!registry.nodes[uuid] && pragma) {
    const newPragma = mergeComponentsUUIDs(pragma, opts);
    ctx = ctx ? mergeComponentsUUIDs(ctx, opts) : "";
    render = render ? mergeComponentsUUIDs(render, opts) : "";
    klass = klass ? mergeComponentsUUIDs(klass, opts) : "";
    customElements = customElements
      ? mergeComponentsUUIDs(customElements, opts)
      : "";
    if (ws) {
      ws.send(JSON.stringify({
        uuid,
        ctx: `
        ${render}
        ${ctx}
        ${klass}
        ${customElements}
        `,
        pragma: newPragma,
        type: "template",
      }));
    }
    registry.nodes[uuid] = node.dna;
  }

  if (node.childNodes) {
    for (let child of node.childNodes) {
      startNodeCompareDNA({
        ...opts,
        bundle,
        component,
        registry,
        node: child,
      });
    }
  }
  if (registry.nodes[uuid] !== node.dna && pragma) {
    const newPragma = mergeComponentsUUIDs(pragma, opts);
    ctx = ctx ? mergeComponentsUUIDs(ctx, opts) : "";
    render = render ? mergeComponentsUUIDs(render, opts) : "";
    klass = klass ? mergeComponentsUUIDs(klass, opts) : "";
    customElements = customElements
      ? mergeComponentsUUIDs(customElements, opts)
      : "";
    if (ws) {
      ws.send(JSON.stringify({
        uuid,
        ctx: `
        ${render}
        ${ctx}
        ${klass}
        ${customElements}
        `,
        pragma: newPragma,
        type: "template",
      }));
    }
    registry.nodes[uuid] = node.dna;
  }
}
async function setNewApplication(): Promise<void> {
  newApplicationCompilation = true;
  const newApplication: Bundle = await Ogone.compile(Ogone.config.entrypoint);
  Ogone.setBundle(newApplication);
}
function forceReloading() {
  if (newApplicationCompilation === false && ws) {
    setNewApplication();
    ws.send(JSON.stringify({
      type: "reload",
    }));
  }
}
export async function HCR(bundle: Bundle): Promise<void> {
  // start saving state of components
  newApplicationCompilation = false;
  const entries = Array.from(bundle.components.entries());
  entries.forEach(([path, component]: any) => {
    // defined components
    componentRegistry.components[component.uuid] = true;
    // save the protos of components
    componentRegistry.runtimes[component.uuid] = component.scripts.runtime;
    // save the styles of components
    componentRegistry.styles[component.uuid] = component.style.join("\n");
    componentRegistry.lengthOfNodes[component.uuid] =
      component.rootNode.nodeList.length;
    startSavingNodesDNA(component, componentRegistry, component.rootNode);
  });
  // watch
  for await (const { path } of bundle.files) {
    if (watchedFiles.includes(path)) {
      return;
    }
    watchedFiles.push(path);
    const module = Deno.watchFs(path);
    for await (let event of module) {
      const { kind } = event;
      if (kind === "access" && ws) {
        const newBundle = await Ogone.compile(path);
        const newComponent = newBundle.components.get(path);
        if (newComponent) {
          const component = bundle.components.get(path);
          const newComponentRegExpID = new RegExp(newComponent.uuid, "gi");
          if (component) {
            styleHasChanged(component, newComponent, {
              newComponentRegExpID,
            });
            protoHasChanged(component, newComponent);
            setNewApplication();
            startNodeCompareDNA({
              component,
              bundle,
              newComponent,
              newBundle,
              newComponentRegExpID,
              registry: componentRegistry,
              node: newComponent.rootNode,
            });
          }
        }
      }
    }
  }
}
function styleHasChanged(
  component: Component,
  newComponent: Component,
  opts: any,
): boolean {
  const { newComponentRegExpID } = opts;
  const style = newComponent.style.join("\n").replace(
    newComponentRegExpID,
    component.uuid,
  );
  const styleHasChanged = componentRegistry.styles[component.uuid] !== style;
  if (styleHasChanged && ws) {
    ws.send(JSON.stringify({
      uuid: component.uuid,
      style,
      type: "style",
    }));
    componentRegistry.styles[component.uuid] = style;
    return true;
  }
  return false;
}
function protoHasChanged(
  component: Component,
  newComponent: Component,
): boolean {
  if (!newComponent.scripts.runtime) return false;
  const { runtime } = newComponent.scripts;
  const runtimeHasChanged =
    componentRegistry.runtimes[component.uuid] !== runtime;
  if (runtimeHasChanged && ws) {
    ws.send(JSON.stringify({
      uuid: component.uuid,
      runtime,
      type: "runtime",
    }));
    componentRegistry.runtimes[component.uuid] = runtime;
    return true;
  }
  return false;
}
function mergeComponentsUUIDs(txt: string, opts: any) {
  let result = txt;
  const { bundle, newBundle, registry, newComponent, component } = opts;
  const comps = Array.from(newBundle.components.entries());
  while (result.indexOf(newComponent.uuid) > -1) {
    result = result.replace(newComponent.uuid, component.uuid);
  }
  let comp: any = comps.find((entry: any) =>
    result.indexOf(entry[1].uuid) > -1 && bundle.components.get(entry[0])
  );
  let oldComp: any = bundle.components.get((comp || [""])[0]);
  while (comp) {
    comp = comps.find((entry: any) =>
      result.indexOf(entry[1].uuid) > -1 && bundle.components.get(entry[0])
    );
    if (comp && oldComp) {
      oldComp = bundle.components.get(comp[0]);
      result = result.replace(comp[1].uuid, oldComp.uuid);
    }
    if (!oldComp) {
      const index = comps.indexOf(comp);
      delete comps[index];
    }
  }
  return result;
}
