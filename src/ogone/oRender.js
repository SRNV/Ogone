const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const uuid = require('uuid-node');
const { parse } = require('node-html-parser');
const Ogone = require('./');

module.exports = function oRender() {
  Ogone.directories.forEach((dir) => {
    const paths = fs.readdirSync(dir);
    paths.filter((file) => /(\.o3)$/.test(file)).forEach((file) => {
      const index = path.join(dir, file);
      if (fs.existsSync(index)) {
        const html = fs.readFileSync(index, { encoding: 'utf8' });
        const rootNode = parse(html, {
          comment: true,
          script: true,
          style: true
        });
        const rootNodePure = parse(html, {
          comment: false,
          script: false,
          style: false
        });
        Ogone.components.set(index, {
          uuid: `data-${uuid.generateUUID().split('-')[0]}`,
          html: rootNode.toString(),
          file: index,
          rootNode,
          rootNodePure,
          data: {},
          style: [],
          scripts: {},
          dom: [],
          imports: {},
          directives: [],
          for: {},
          refs: {},
          reactive: {},
          reactiveText: {},
        });
      } else {
        console.warn('[Ogone] passed', dir);
      }
    })
  });
}