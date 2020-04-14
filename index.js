const express = require('express');
const app = express();
const fs = require('fs');
const expressWs = require('express-ws')(app);
const uuid = require('uuid-node');
const OComponent = require('./src/');

const template = fs.readFileSync('./ogone.html', { encoding: 'utf8' });
const json = fs.readFileSync('./ogone.config.json', { encoding: 'utf8' });
const config = JSON.parse(json);

const renderApp = (app, id) => {
  return template.replace(/%%id%%/gi, id);
};

app.get('/', (req, res) => {
  const id = uuid.generateUUID().split('-')[0];
  app.ws(`/load/${id}`, (ws, req) => {
    ws.OGONE_EVENTS = new Map();
    ws.on('message', (msg) => {
      switch(msg) {
        case 'load': 
          if (ws.readyState === 1) {
            const oc = new OComponent(config.entrypoint, ws);
            const json = JSON.stringify({
              type: 'load',
              querySelector: `#app${id}`,
              html: oc.render(),
              renderUUID: oc.id,
            });
            ws.send(json);
          }
          break;
        default:
          if (ws.OGONE_EVENTS.has(msg)) {
            ws.OGONE_EVENTS.get(msg)();
          } else {
            const data = msg.split(':');
            if (data.length) {
              const id = `${data[0]}:${data[1]}`
              ws.OGONE_EVENTS.get(id)(data);
            }
          }
      }
    });
  });
  res.send(renderApp(config.app, id));
});


app.listen(config.port || 8080);