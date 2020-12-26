import Workers from '../enums/workers.ts';

const client = new WebSocket('ws://localhost:3441/');
client.onopen = (event) => {
  console.warn('open', event)
}
client.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.warn('message', data);
  switch (data.type) {
    case Workers.LSP_UPDATE_CURRENT_COMPONENT:
      self.postMessage(data);
      break;
  }
}
self.addEventListener('unload', () => {
  client.close();
})
self.onmessage = (ev: any) => {
  const { type, application, port } = ev.data;
  switch (type) {
    case Workers.LSP_SEND_PORT:
      notify(Workers.LSP_SEND_PORT, port);
      break;
    case Workers.LSP_CURRENT_COMPONENT_RENDERED:
      notify(Workers.LSP_CURRENT_COMPONENT_RENDERED, application);
      break;
  }
}
function notify(type: any, message: Object | string | number) {
  if (client) {
    client.send(JSON.stringify({
      type: type || 'message',
      data: message
    }));
  }
}
export default {};