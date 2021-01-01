import Workers from '../enums/workers.ts';

const client = new WebSocket('ws://localhost:3441/');
const FIFOMessages: string[] = [];
client.onopen = () => {
  FIFOMessages.forEach((message) => {
    client.send(message);
  });
  FIFOMessages.splice(0);
}
client.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case Workers.LSP_UPDATE_CURRENT_COMPONENT:
      self.postMessage(data);
      break;
  }
}
self.addEventListener('unload', () => {
  notify(Workers.LSP_CLOSE, 0);
  client.close();
})
self.onmessage = (ev: any) => {
  const { type, application, port, component, data } = ev.data;
  switch (type) {
    case Workers.LSP_SEND_COMPONENT_INFORMATIONS:
      notify(Workers.LSP_SEND_COMPONENT_INFORMATIONS, component);
      break;
    case Workers.LSP_SEND_PORT:
      notify(Workers.LSP_SEND_PORT, port);
      break;
    case Workers.LSP_CURRENT_COMPONENT_RENDERED:
      notify(Workers.LSP_CURRENT_COMPONENT_RENDERED, application);
      break;
    default:
      notify(type, data);
      break;
  }
}
function notify(type: any, message: Object | string | number) {
  if (client) {
    if (client.readyState !== 1) {
      FIFOMessages.push(JSON.stringify({
        type: type || 'message',
        data: message
      }));
    } else {
      client.send(JSON.stringify({
        type: type || 'message',
        data: message
      }));
    }
  }
}
export default {};