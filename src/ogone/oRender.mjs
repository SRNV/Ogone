import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import uuid from 'uuid-node';
import nhp from 'node-html-parser';
import Ogone from './index.js';

const { parse } = nhp;
export default function oRender() {
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
          esmExpressions: '',
          exportsExpressions: '',
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