import {
  WebSocket,
  WebSocketServer,
} from "https://deno.land/x/websocket/mod.ts";

let ws: WebSocket | null = null;
// open the websocket
const wss: WebSocketServer = new WebSocketServer(4000);
// when client open the connection
// assign to ws the socket
wss.on("connection", (socket: WebSocket) => {
  ws = socket;
});

export default async function HMR(modulePath: string): Promise<void> {
  const module = Deno.watchFs(modulePath);
  for await (let event of module) {
    const { kind, paths } = event;
    const url = paths[0].replace(Deno.cwd(), "");
    console.warn(url);
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
