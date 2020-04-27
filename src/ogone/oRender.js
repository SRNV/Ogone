const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const uuid = require('uuid-node');
const { parse } = require('node-html-parser');
const Ogone = require('./');

module.exports = function oRender() {
  Ogone.directories.forEach((dir) => {
    const index = path.join(dir, 'index.html');
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
      let data = null;
      let services = {};
      const pathToData = path.join(dir, 'describe.yml');
      if (fs.existsSync(pathToData)) {
        const dataYML = fs.readFileSync(pathToData, { encoding: 'utf8' });
        const description = YAML.parse(dataYML);
        if (description.data) {
          data = description.data;
        }
        if (description.services) {
          Object.entries(description.services)
            .forEach(([name, p]) => {
              const pathToModule =path.join(dir, p);
              const pathToNodeModules =path.join(process.cwd(), './node_modules', p);
              switch(true) {
                case fs.existsSync(pathToModule): 
                  services[name] = require(pathToModule);
                  break;
                case fs.existsSync(pathToNodeModules):
                  services[name] = require(pathToNodeModules);
                  break;
                default:
                  services[name] = require(p);
                  break;
              }
            })
        }
      }
      Ogone.components.set(dir, {
        uuid: `data-${uuid.generateUUID().split('-')[0]}`,
        html: rootNode.toString(),
        file: dir,
        rootNode,
        rootNodePure,
        data,
        services,
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
  });
}