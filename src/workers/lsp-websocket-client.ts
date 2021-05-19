import Workers from '../enums/workers.ts';

const client = new WebSocket('ws://localhost:3444/');
const FIFOMessages: string[] = [];
client.onopen = () => {
  try {
    if (!FIFOMessages.length) return;
    FIFOMessages.forEach((message) => {
      client.send(message);
    });
    FIFOMessages.splice(0);
  } catch (err) {
    throw err;
  }
}
client.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case Workers.LSP_UPDATE_CURRENT_COMPONENT:
        self.postMessage(data);
        break;
    }
  } catch (err) {
    throw err;
  }
}
self.addEventListener('unload', () => {
  notify(Workers.LSP_CLOSE, 0);
  client.close();
})
self.onmessage = (ev: any) => {
  try {
    const { type, application, port, component, data, message, rerender } = ev.data;
    switch (type) {
      case Workers.LSP_SEND_COMPONENT_INFORMATIONS:
        notify(type, component);
        break;
      case Workers.LSP_SEND_PORT:
        notify(type, port);
        break;
      case Workers.LSP_CURRENT_COMPONENT_RENDERED:
        notify(type, application, {
          rerender,
        });
        break;
      case Workers.LSP_ERROR:
        notify(type, message);
        break;
      default:
        notify(type, data);
        break;
    }
  } catch (err) {
    throw err;
  }
}
function notify(type: string, message: Object | string | number, opts: any = {}) {
  try {
    if (client) {
      if (client.readyState !== 1) {
        FIFOMessages.push(JSON.stringify({
          type: type || 'message',
          data: message,
          opts,
        }));
      } else {
        client.send(JSON.stringify({
          type: type || 'message',
          data: message,
          opts,
        }));
      }
    }
  } catch (err) {
    throw err;
  }
}
export default {};