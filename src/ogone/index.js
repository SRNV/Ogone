const fs = require('fs');
const path = require('path');
const uuid = require('uuid-node');
const json = fs.readFileSync('./ogone.config.json', { encoding: 'utf8' });
const config = JSON.parse(json);

module.exports = {
  config,
  files: [],
  directories: [],
  components: new Map(),
  main: path.join(process.cwd(), config.entrypoint),
  sockets: [],
  pragma: 'self.h',
  onmessage: [],
  onclose: [],
  templates: [],
  contexts: [],
  datas: [],
};