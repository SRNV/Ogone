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
