import fs from 'fs';
import path from 'path';
import uuid from 'uuid-node';
const json = fs.readFileSync('./ogone.config.json', { encoding: 'utf8' });
const config = JSON.parse(json);

export default {
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