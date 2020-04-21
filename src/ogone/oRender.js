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
      let modules = {};
      const pathToData = path.join(dir, 'describe.yml');
      if (fs.existsSync(pathToData)) {
        const dataYML = fs.readFileSync(pathToData, { encoding: 'utf8' });
        const description = YAML.parse(dataYML);
        if (description.data) {
          data = description.data;
        }
        if (description.modules) {
          Object.entries(description.modules)
            .forEach(([name, p]) => {
              const pathToModule =path.join(dir, p);
              const pathToNodeModules =path.join(process.cwd(), './node_modules', p);
              switch(true) {
                case fs.existsSync(pathToModule): 
                  modules[name] = require(pathToModule);
                  break;
                case fs.existsSync(pathToNodeModules):
                  modules[name] = require(pathToNodeModules);
                  break;
                default:
                  modules[name] = require(p);
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
        modules,
        style: [],
        scripts: {},
        dom: [],
        imports: {},
        directives: [],
        for: {},
        refs: {},
        reactive: {},
      });
    } else {
      console.warn('[Ogone] passed', dir);
    }
  });
}