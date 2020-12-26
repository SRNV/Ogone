import Workers from '../enums/workers.ts';

const client = new WebSocket('ws://localhost:3442/');
client.onopen = (event) => {
  console.warn('open', event)
}
client.onmessage = (event) => {
  console.warn('message', event, event.data);
}
self.addEventListener('unload', () => {
  client.close();
})
self.onmessage = (ev: any) => {
  const { type } = ev;
  if (type === Workers.LSP_SEND_PORT) {
    notify(Workers.LSP_SEND_PORT, ev.port);
  }
}
function notify(type: any, message: Object | string | number) {
  if (client) {
    client.send(JSON.stringify({
      type: type || 'message',
      data: JSON.stringify(message)
    }));
  }
}
export default {};