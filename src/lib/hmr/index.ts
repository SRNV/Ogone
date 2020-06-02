import {
  WebSocket,
  WebSocketServer,
} from "https://deno.land/x/websocket/mod.ts";
import compile from "../../ogone/compilation/index.ts";
let ws: WebSocket | null = null;
// open the websocket
const wss: WebSocketServer = new WebSocketServer(4000);
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

// hot component replacement
const componentRegistry: any = {
  styles: {},
  templates: {},
  scripts: {},
  nodes: {},
};
function getPragma(bundle: any, component: any, node: any) {
  return node.pragma(
    component.uuid,
    true,
    Object.keys(component.imports),
    (tagName: string) => {
      if (component.imports[tagName]) {
        const newcomponent = bundle.components.get(
          component.imports[tagName],
        );
        if (!newcomponent) return null;
        return newcomponent.uuid;
      }
      return null;
    },
  );
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
function startNodeCompareDNA(opts: any) {
  const {
    node,
    component,
    newBundle,
    newComponent,
    newComponentRegExpID,
    registry,
  } = opts;
  const isTemplate = node.tagName === null && node.nodeType === 1;
  const uuid = `${component.uuid}-${!isTemplate ? node.id : "nt"}`;
  if (node.childNodes) {
    for (let child of node.childNodes) {
      startNodeCompareDNA({
        ...opts,
        component,
        registry,
        node: child,
      });
    }
  }
  if (registry[uuid] !== node.dna) {
    const newPragma = getPragma(newBundle, newComponent, node).replace(
      newComponentRegExpID,
      component.uuid,
    );

    if (ws) {
      ws.send(JSON.stringify({
        pragma: newPragma,
        uuid,
        type: "template",
      }));
    }
    registry[uuid] = node.dna;
  }
}
export async function HCR(bundle: any): Promise<void> {
  // start saving state of components
  const entries = Array.from(bundle.components.entries());
  entries.forEach(([path, component]: any) => {
    componentRegistry.templates[path] = component.rootNodePure.dna;
    startSavingNodesDNA(component, componentRegistry, component.rootNodePure);
  });
  // watch
  bundle.files.forEach(async (path: string) => {
    const module = Deno.watchFs(path);
    for await (let event of module) {
      const { kind, paths } = event;
      if (kind === "access" && ws) {
        const newBundle = await compile(path);
        const newComponent = newBundle.components.get(path);
        const component = bundle.components.get(path);
        const newTemplate = newComponent.rootNodePure.dna;
        const newComponentRegExpID = new RegExp(newComponent.uuid, "gi");
        startNodeCompareDNA({
          component,
          registry: componentRegistry,
          node: newComponent.rootNodePure,
          newComponent,
          newBundle,
          newComponentRegExpID,
        });
      }
    }
  });
}
