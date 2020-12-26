import Workers from '../enums/workers.ts';

const client = new WebSocket('ws://localhost:3442/');
client.onopen = (event) => {
  console.warn('open', event)
}
client.onmessage = (event) => {
  console.warn('message', event, event.data);
  switch (event.data.type) {
    case Workers.LSP_UPDATE_CURRENT_COMPONENT:
      self.postMessage(event.data);
      break;
  }
}
self.addEventListener('unload', () => {
  client.close();
})
self.onmessage = (ev: any) => {
  const { type } = ev;
  if (type === Workers.LSP_SEND_PORT) {
  }
  switch (type) {
    case Workers.LSP_SEND_PORT:
      notify(Workers.LSP_SEND_PORT, ev.port);
      break;
    case Workers.LSP_CURRENT_COMPONENT_RENDERED:
      notify(Workers.LSP_CURRENT_COMPONENT_RENDERED, ev.application);
      break;
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