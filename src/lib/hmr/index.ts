import {
  WebSocket,
  WebSocketServer,
} from "https://deno.land/x/websocket/mod.ts";
import compile from "../../../src/ogone/compilation/index.ts";
import Env from "../env/Env.ts";
import Ogone from "../../../src/ogone/index.ts";
let ws: WebSocket | null = null;
// open the websocket
const wss: WebSocketServer = new WebSocketServer(4000);
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
  templates: {},
  scripts: {},
  nodes: {},
  components: {},
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
async function startNodeCompareDNA(opts: any) {
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
  const ctx = newBundle.contexts.find((ctx: string) =>
    ctx.indexOf(`Ogone.contexts['${uuid}'] =`) > -1
  );
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
  if (registry.nodes[uuid] !== node.dna) {
    const newPragma = getPragma(newBundle, newComponent, node).replace(
      newComponentRegExpID,
      component.uuid,
    );
    if (ws && ctx) {
      ws.send(JSON.stringify({
        uuid,
        ctx: `
                  ${ctx}
                `,
        pragma: newPragma,
        type: "template",
      }));
    } else if (ws && !ctx) {
      // start new application
      forceReloading();
    }
    registry.nodes[uuid] = node.dna;
  }
}
async function forceReloading(): Promise<void> {
  if (newApplicationCompilation === false && ws) {
    newApplicationCompilation = true;
    const newApplication = await compile(Ogone.config.entrypoint);
    Env.setBundle(newApplication);
    ws.send(JSON.stringify({
      type: "reload",
    }));
  }
}
export async function HCR(bundle: any): Promise<void> {
  // start saving state of components
  newApplicationCompilation = false;
  const entries = Array.from(bundle.components.entries());
  entries.forEach(([path, component]: any) => {
    componentRegistry.templates[path] = component.rootNodePure.dna;
    componentRegistry.components[component.uuid] = true;
    componentRegistry.styles[component.uuid] = component.style.join("\n");
    startSavingNodesDNA(component, componentRegistry, component.rootNodePure);
  });
  // watch
  bundle.files.forEach(async (path: string) => {
    if (watchedFiles.includes(path)) {
      return;
    }
    watchedFiles.push(path);
    const module = Deno.watchFs(path);
    for await (let event of module) {
      const { kind } = event;
      if (kind === "access" && ws) {
        const newBundle = await compile(path);
        const newComponent = newBundle.components.get(path);
        const component = bundle.components.get(path);
        const newComponentRegExpID = new RegExp(newComponent.uuid, "gi");
        styleHasChanged(component, newComponent, {
          newComponentRegExpID,
        });
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
function styleHasChanged(
  component: any,
  newComponent: any,
  opts: any,
): boolean {
  const { newComponentRegExpID } = opts;
  const style = newComponent.style.join("\n").replace(
    newComponentRegExpID,
    component.uuid,
  );
  console.warn(style);
  const styleHasChanged = componentRegistry.styles[newComponent.uuid] !== style;
  if (styleHasChanged && ws) {
    ws.send(JSON.stringify({
      uuid: component.uuid,
      style,
      type: "style",
    }));
    componentRegistry.styles[newComponent.uuid] = style;
    return true;
  }
  return false;
}
